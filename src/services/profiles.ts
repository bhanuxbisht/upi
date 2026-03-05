/**
 * User Profile Service — Payment preferences and onboarding
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileInput {
    preferred_apps?: string[];
    cards?: Array<{ bank: string; type: string; name: string; last4?: string }>;
    wallets?: Array<{ app: string; balance: number }>;
    monthly_budget?: number | null;
    category_budgets?: Record<string, number>;
    notification_preferences?: {
        email_alerts?: boolean;
        push_alerts?: boolean;
        weekly_report?: boolean;
        deal_expiry?: boolean;
    };
    spending_goals?: Record<string, number>;
    onboarding_completed?: boolean;
}

/**
 * Get or create a user profile
 */
export async function getProfile(userId: string) {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error && error.code === "PGRST116") {
        // Profile doesn't exist — create one
        const { data: newProfile, error: createError } = await supabase
            .from("user_profiles")
            .insert({ user_id: userId })
            .select()
            .single();

        if (createError) throw new Error(`Failed to create profile: ${createError.message}`);
        return newProfile;
    }

    if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
    return data;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, input: ProfileInput) {
    const supabase = await getSupabaseServerClient();

    const updateData: Record<string, unknown> = {};

    if (input.preferred_apps !== undefined) updateData.preferred_apps = input.preferred_apps;
    if (input.cards !== undefined) updateData.cards = input.cards;
    if (input.wallets !== undefined) updateData.wallets = input.wallets;
    if (input.monthly_budget !== undefined) updateData.monthly_budget = input.monthly_budget;
    if (input.category_budgets !== undefined) updateData.category_budgets = input.category_budgets;
    if (input.notification_preferences !== undefined) updateData.notification_preferences = input.notification_preferences;
    if (input.spending_goals !== undefined) updateData.spending_goals = input.spending_goals;
    if (input.onboarding_completed !== undefined) updateData.onboarding_completed = input.onboarding_completed;

    const { data, error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

    if (error) throw new Error(`Failed to update profile: ${error.message}`);
    return data;
}

/**
 * Check if user is Pro subscriber
 */
export async function isProUser(userId: string): Promise<boolean> {
    const supabase = await getSupabaseServerClient();

    const { data } = await supabase
        .from("user_profiles")
        .select("pro_user, pro_expires_at")
        .eq("user_id", userId)
        .single();

    if (!data) return false;
    if (!data.pro_user) return false;

    // Check if Pro hasn't expired
    if (data.pro_expires_at && new Date(data.pro_expires_at) < new Date()) {
        // Pro expired — update the flag
        await supabase
            .from("user_profiles")
            .update({ pro_user: false })
            .eq("user_id", userId);
        return false;
    }

    return true;
}

/**
 * Check AI usage limits for free/pro users
 */
export async function checkAIUsageLimit(userId: string): Promise<{
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
}> {
    try {
        const supabase = await getSupabaseServerClient();
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // Get today's usage
        const { data: usage } = await supabase
            .from("ai_usage")
            .select("queries_used, daily_limit")
            .eq("user_id", userId)
            .eq("query_date", today)
            .single();

        if (!usage) {
            // First query today — check if pro
            const isPro = await isProUser(userId);
            const dailyLimit = isPro ? 99999 : 3;

            // Create usage record
            await supabase.from("ai_usage").insert({
                user_id: userId,
                query_date: today,
                queries_used: 0,
                daily_limit: dailyLimit,
            });

            return { allowed: true, used: 0, limit: dailyLimit, remaining: dailyLimit };
        }

        const remaining = usage.daily_limit - usage.queries_used;

        return {
            allowed: remaining > 0,
            used: usage.queries_used,
            limit: usage.daily_limit,
            remaining: Math.max(0, remaining),
        };
    } catch {
        // If ai_usage table doesn't exist yet, allow queries with default limits
        return { allowed: true, used: 0, limit: 3, remaining: 3 };
    }
}

/**
 * Increment AI usage counter
 */
export async function incrementAIUsage(
    userId: string,
    tokensUsed: number
): Promise<void> {
    try {
        const supabase = await getSupabaseServerClient();
        const today = new Date().toISOString().split("T")[0];

        // Upsert usage
        const { error } = await supabase.rpc("increment_ai_usage", {
            p_user_id: userId,
            p_date: today,
            p_tokens: tokensUsed,
        });

        // Fallback if RPC doesn't exist
        if (error) {
            await supabase
                .from("ai_usage")
                .upsert(
                    {
                        user_id: userId,
                        query_date: today,
                        queries_used: 1,
                        tokens_used: tokensUsed,
                    },
                    { onConflict: "user_id,query_date" }
                );
        }
    } catch {
        // Table may not exist yet — silently fail
    }
}

/**
 * Export all user data (DPDP Act compliance)
 */
export async function exportUserData(userId: string) {
    const supabase = await getSupabaseServerClient();

    const [
        { data: profile },
        { data: transactions },
        { data: savings },
        { data: conversations },
        { data: consent },
    ] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("user_id", userId),
        supabase.from("user_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("user_savings").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("ai_conversations").select("id, title, created_at, updated_at").eq("user_id", userId),
        supabase.from("consent_records").select("*").eq("user_id", userId),
    ]);

    return {
        exported_at: new Date().toISOString(),
        profile: profile || [],
        transactions: transactions || [],
        savings: savings || [],
        conversations: conversations || [],
        consent_records: consent || [],
    };
}

/**
 * Delete all user data (DPDP Act — Right to Erasure)
 */
export async function deleteAllUserData(userId: string): Promise<void> {
    const supabase = await getSupabaseServerClient();

    // Delete in correct order (respect foreign key constraints)
    // Sequential to avoid FK violations
    await supabase.from("ai_conversations").delete().eq("user_id", userId);
    await supabase.from("ai_usage").delete().eq("user_id", userId);
    await supabase.from("user_offer_matches").delete().eq("user_id", userId);
    await supabase.from("user_transactions").delete().eq("user_id", userId);
    await supabase.from("user_savings").delete().eq("user_id", userId);
    await supabase.from("user_savings_stats").delete().eq("user_id", userId);
    await supabase.from("consent_records").delete().eq("user_id", userId);
    await supabase.from("user_profiles").delete().eq("user_id", userId);
}
