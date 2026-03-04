/**
 * Context Builder — Constructs user context for AI conversations
 * Pulls from user profile, recent transactions, savings stats, and active offers
 * 
 * All queries are wrapped in try-catch so the AI still works
 * even if some tables haven't been created yet.
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface UserContext {
    profile: {
        preferredApps: string[];
        cards: Array<{ bank: string; type: string; name: string }>;
        monthlyBudget: number | null;
        isPro: boolean;
    } | null;
    recentSpending: {
        thisMonth: number;
        topCategories: Array<{ category: string; amount: number }>;
        topApps: Array<{ app: string; count: number }>;
    };
    savingsStats: {
        totalSaved: number;
        savedThisMonth: number;
        streak: number;
    } | null;
    activeOfferCount: number;
}

/**
 * Build a comprehensive context string for the AI about this user
 */
export async function buildUserContext(userId: string): Promise<string> {
    const context: UserContext = {
        profile: null,
        recentSpending: {
            thisMonth: 0,
            topCategories: [],
            topApps: [],
        },
        savingsStats: null,
        activeOfferCount: 0,
    };

    try {
        const supabase = await getSupabaseServerClient();

        // 1. Get user profile (may not exist yet)
        try {
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (profile) {
                context.profile = {
                    preferredApps: profile.preferred_apps || [],
                    cards: (profile.cards as Array<{ bank: string; type: string; name: string }>) || [],
                    monthlyBudget: profile.monthly_budget,
                    isPro: profile.pro_user || false,
                };
            }
        } catch {
            // Table may not exist yet — that's okay
        }

        // 2. Get recent spending (this month)
        try {
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const { data: transactions } = await supabase
                .from("user_transactions")
                .select("amount, category, payment_app")
                .eq("user_id", userId)
                .gte("transaction_date", monthStart.toISOString())
                .order("transaction_date", { ascending: false })
                .limit(100);

            if (transactions && transactions.length > 0) {
                context.recentSpending.thisMonth = transactions.reduce(
                    (sum: number, t: { amount: number }) => sum + Number(t.amount),
                    0
                );

                const categoryMap = new Map<string, number>();
                const appMap = new Map<string, number>();

                for (const t of transactions) {
                    categoryMap.set(
                        t.category,
                        (categoryMap.get(t.category) || 0) + Number(t.amount)
                    );
                    appMap.set(t.payment_app, (appMap.get(t.payment_app) || 0) + 1);
                }

                context.recentSpending.topCategories = Array.from(categoryMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, amount]) => ({ category, amount }));

                context.recentSpending.topApps = Array.from(appMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([app, count]) => ({ app, count }));
            }
        } catch {
            // Table may not exist yet
        }

        // 3. Get savings stats
        try {
            const { data: stats } = await supabase
                .from("user_savings_stats")
                .select("total_saved, saved_this_month, current_streak")
                .eq("user_id", userId)
                .single();

            if (stats) {
                context.savingsStats = {
                    totalSaved: Number(stats.total_saved),
                    savedThisMonth: Number(stats.saved_this_month),
                    streak: stats.current_streak,
                };
            }
        } catch {
            // Table may not exist yet
        }

        // 4. Get active offer count
        try {
            const { count } = await supabase
                .from("offers")
                .select("*", { count: "exact", head: true })
                .eq("status", "active")
                .gte("valid_to", new Date().toISOString());

            context.activeOfferCount = count || 0;
        } catch {
            // Table may not exist yet
        }
    } catch {
        // Supabase not configured — return empty context
    }

    return formatContextForLLM(context);
}

function formatContextForLLM(ctx: UserContext): string {
    const parts: string[] = [];

    if (ctx.profile) {
        parts.push(
            `User's payment apps: ${ctx.profile.preferredApps.length > 0 ? ctx.profile.preferredApps.join(", ") : "not set up yet"}`
        );
        if (ctx.profile.cards.length > 0) {
            const cardList = ctx.profile.cards
                .map((c) => `${c.bank} ${c.name} (${c.type})`)
                .join(", ");
            parts.push(`User's cards: ${cardList}`);
        }
        if (ctx.profile.monthlyBudget) {
            parts.push(`Monthly budget: ₹${ctx.profile.monthlyBudget}`);
        }
        parts.push(`Subscription: ${ctx.profile.isPro ? "Pro" : "Free"}`);
    }

    if (ctx.recentSpending.thisMonth > 0) {
        parts.push(
            `This month's spending: ₹${ctx.recentSpending.thisMonth.toFixed(0)}`
        );
        if (ctx.recentSpending.topCategories.length > 0) {
            const cats = ctx.recentSpending.topCategories
                .map((c) => `${c.category}: ₹${c.amount.toFixed(0)}`)
                .join(", ");
            parts.push(`Top spending categories: ${cats}`);
        }
        if (ctx.recentSpending.topApps.length > 0) {
            const apps = ctx.recentSpending.topApps
                .map((a) => `${a.app} (${a.count} txns)`)
                .join(", ");
            parts.push(`Most used payment apps: ${apps}`);
        }
    }

    if (ctx.savingsStats) {
        parts.push(
            `Total saved via PayWise: ₹${ctx.savingsStats.totalSaved.toFixed(0)}, this month: ₹${ctx.savingsStats.savedThisMonth.toFixed(0)}, streak: ${ctx.savingsStats.streak} days`
        );
    }

    parts.push(`Active offers on platform: ${ctx.activeOfferCount}`);

    return parts.join("\n");
}
