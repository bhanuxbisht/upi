import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Merchant, PaymentApp } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return (data ?? []) as Category[];
}

export async function getMerchants(): Promise<Merchant[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .order("name");

  if (error) throw new Error(`Failed to fetch merchants: ${error.message}`);
  return (data ?? []) as Merchant[];
}

export async function getPaymentApps(): Promise<PaymentApp[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("payment_apps")
    .select("*")
    .order("name");

  if (error) throw new Error(`Failed to fetch payment apps: ${error.message}`);
  return (data ?? []) as PaymentApp[];
}

export async function getMerchantBySlug(slug: string): Promise<Merchant | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Merchant;
}
