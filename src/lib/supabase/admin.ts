import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const isConfigured =
    SUPABASE_URL.startsWith("http") && SUPABASE_SERVICE_ROLE_KEY.length > 0;

/**
 * Returns a Supabase client with the SERVICE ROLE key.
 * ⚠️ DANGER: This client bypasses Row Level Security (RLS).
 * Only use this in secure server-side contexts (API routes)
 * after proper authentication checks via verifyAdmin().
 */
export function getSupabaseAdminClient() {
    if (!isConfigured) {
        console.warn(
            "[PayWise] Supabase Service Role Key is missing. Set SUPABASE_SERVICE_ROLE_KEY in .env.local"
        );
    }

    return createClient(
        isConfigured ? SUPABASE_URL : "https://placeholder.supabase.co",
        isConfigured ? SUPABASE_SERVICE_ROLE_KEY : "placeholder-key",
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
