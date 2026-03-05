import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OfferWithRelations, OfferFilters, PaginatedResponse } from "@/types";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export async function getOffers(
  filters: OfferFilters = {}
): Promise<PaginatedResponse<OfferWithRelations>> {
  const supabase = await getSupabaseServerClient();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? ITEMS_PER_PAGE;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("offers")
    .select(
      `*, merchant:merchants(*), payment_app:payment_apps(*)`,
      { count: "exact" }
    )
    .eq("status", "active")
    .gte("valid_to", new Date().toISOString())
    .order("verified_count", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.merchant) {
    // Supabase PostgREST can't filter on embedded tables with .eq()
    // Instead, look up the merchant ID first and filter by FK
    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("slug", filters.merchant)
      .single();

    if (merchant) {
      query = query.eq("merchant_id", merchant.id);
    }
  }
  if (filters.category) {
    // Category filter — resolve slug to ID, then find merchants in that category
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();

    if (cat) {
      const { data: merchantsInCat } = await supabase
        .from("merchants")
        .select("id")
        .eq("category_id", cat.id);

      if (merchantsInCat && merchantsInCat.length > 0) {
        query = query.in("merchant_id", merchantsInCat.map(m => m.id));
      }
    }
  }
  if (filters.payment_app) {
    const { data: payApp } = await supabase
      .from("payment_apps")
      .select("id")
      .eq("slug", filters.payment_app)
      .single();

    if (payApp) {
      query = query.eq("payment_app_id", payApp.id);
    }
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.search) {
    // Escape SQL LIKE wildcards in user input to prevent pattern injection
    const escapedSearch = filters.search.replace(/%/g, "\\%").replace(/_/g, "\\_");
    query = query.ilike("title", `%${escapedSearch}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch offers: ${error.message}`);
  }

  return {
    items: (data ?? []) as unknown as OfferWithRelations[],
    total: count ?? 0,
    page,
    limit,
    has_more: (count ?? 0) > offset + limit,
  };
}

export async function getOfferById(id: string): Promise<OfferWithRelations | null> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("offers")
    .select(`*, merchant:merchants(*), payment_app:payment_apps(*)`)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as OfferWithRelations;
}

export async function getTrendingOffers(limit: number = 10): Promise<OfferWithRelations[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("offers")
    .select(`*, merchant:merchants(*), payment_app:payment_apps(*)`)
    .eq("status", "active")
    .gte("valid_to", new Date().toISOString())
    .order("verified_count", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch trending offers: ${error.message}`);
  }

  return (data ?? []) as unknown as OfferWithRelations[];
}

export async function getOffersByMerchantAndAmount(
  merchantName: string,
  amount: number
): Promise<OfferWithRelations[]> {
  const supabase = await getSupabaseServerClient();

  // First find the merchant by name
  const { data: merchants } = await supabase
    .from("merchants")
    .select("id")
    .ilike("name", `%${merchantName}%`);

  const merchantIds = merchants?.map(m => m.id) || [];

  let query = supabase
    .from("offers")
    .select(`*, merchant:merchants(*), payment_app:payment_apps(*)`)
    .eq("status", "active")
    .gte("valid_to", new Date().toISOString())
    .or(`min_transaction.is.null,min_transaction.lte.${amount}`)
    .order("cashback_amount", { ascending: false });

  if (merchantIds.length > 0) {
    query = query.in("merchant_id", merchantIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch recommendations: ${error.message}`);
  }

  return (data ?? []) as unknown as OfferWithRelations[];
}
