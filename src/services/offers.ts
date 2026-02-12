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
    query = query.eq("merchant.slug", filters.merchant);
  }
  if (filters.category) {
    // Category filter comes as a slug string — resolve to UUID first
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();

    if (cat) {
      query = query.eq("merchant.category_id", cat.id);
    }
  }
  if (filters.payment_app) {
    query = query.eq("payment_app.slug", filters.payment_app);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
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

  const { data, error } = await supabase
    .from("offers")
    .select(`*, merchant:merchants(*), payment_app:payment_apps(*)`)
    .eq("status", "active")
    .gte("valid_to", new Date().toISOString())
    .ilike("merchant.name", `%${merchantName}%`)
    .or(`min_transaction.is.null,min_transaction.lte.${amount}`)
    .order("cashback_amount", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch recommendations: ${error.message}`);
  }

  return (data ?? []) as unknown as OfferWithRelations[];
}
