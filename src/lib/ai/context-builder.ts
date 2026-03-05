/**
 * Context Builder — Constructs RICH user + knowledge context for AI conversations
 * 
 * v2: Now integrates the Knowledge Engine to inject domain-specific data
 * based on what the user is asking about. This transforms generic AI
 * responses into expert-level, data-driven advice.
 * 
 * All queries are wrapped in try-catch so the AI still works
 * even if some tables haven't been created yet.
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeQuery, buildKnowledgeContext } from "./query-analyzer";
import { buildDatabaseKnowledgeContext } from "./knowledge-service";

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
    recentTransactions: Array<{
        merchant: string;
        category: string;
        amount: number;
        paymentApp: string;
        date: string;
    }>;
    missedSavings: number;
}

/**
 * Build a comprehensive context string for the AI about this user.
 * Now includes knowledge injection based on the user's query.
 */
export async function buildUserContext(userId: string, userQuery?: string): Promise<string> {
    const context: UserContext = {
        profile: null,
        recentSpending: {
            thisMonth: 0,
            topCategories: [],
            topApps: [],
        },
        savingsStats: null,
        activeOfferCount: 0,
        recentTransactions: [],
        missedSavings: 0,
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

        // 5. Get recent transactions (for context-aware responses)
        try {
            const { data: recentTxns } = await supabase
                .from("user_transactions")
                .select("merchant_name, category, amount, payment_app, transaction_date, missed_saving")
                .eq("user_id", userId)
                .order("transaction_date", { ascending: false })
                .limit(20);

            if (recentTxns && recentTxns.length > 0) {
                context.recentTransactions = recentTxns.map((t: { merchant_name: string; category: string; amount: number; payment_app: string; transaction_date: string }) => ({
                    merchant: t.merchant_name || "Unknown",
                    category: t.category || "other",
                    amount: Number(t.amount),
                    paymentApp: t.payment_app || "Unknown",
                    date: t.transaction_date,
                }));

                // Calculate missed savings
                context.missedSavings = recentTxns.reduce(
                    (sum: number, t: { missed_saving?: number }) => sum + Number(t.missed_saving || 0),
                    0
                );
            }
        } catch {
            // Table may not exist yet
        }
    } catch {
        // Supabase not configured — return empty context
    }

    // Build the user context string
    const userContextStr = formatContextForLLM(context);
    
    // If we have a query, analyze it and inject domain knowledge
    // Phase 3: Try Supabase knowledge first, then fall back to TypeScript
    let knowledgeContext = "";
    if (userQuery) {
        try {
            const analysis = analyzeQuery(userQuery);
            
            // Try database knowledge first (Phase 3 — admin-editable data)
            try {
                const dbKnowledge = await buildDatabaseKnowledgeContext(
                    analysis.intent,
                    analysis.categories,
                    analysis.merchants
                );
                if (dbKnowledge && !dbKnowledge.includes("unavailable")) {
                    knowledgeContext = `[DETECTED INTENT: ${analysis.intent} (confidence: ${(analysis.confidence * 100).toFixed(0)}%)]\n\n${dbKnowledge}`;
                }
            } catch {
                console.warn("[ContextBuilder] DB knowledge failed, falling back to TypeScript");
            }
            
            // Fallback to TypeScript-based knowledge if DB didn't return useful data
            if (!knowledgeContext) {
                knowledgeContext = buildKnowledgeContext(analysis);
            }
        } catch (err) {
            console.warn("[ContextBuilder] Knowledge injection failed:", err);
        }
    }

    return knowledgeContext 
        ? `${userContextStr}\n\n--- DOMAIN KNOWLEDGE (Use this data in your response) ---\n${knowledgeContext}`
        : userContextStr;
}

function formatContextForLLM(ctx: UserContext): string {
    const parts: string[] = [];
    parts.push("--- USER PROFILE ---");

    if (ctx.profile) {
        parts.push(
            `Payment apps: ${ctx.profile.preferredApps.length > 0 ? ctx.profile.preferredApps.join(", ") : "not set up yet"}`
        );
        if (ctx.profile.cards.length > 0) {
            const cardList = ctx.profile.cards
                .map((c) => `${c.bank} ${c.name} (${c.type})`)
                .join(", ");
            parts.push(`Cards: ${cardList}`);
        } else {
            parts.push("Cards: None registered yet (good opportunity to recommend one!)");
        }
        if (ctx.profile.monthlyBudget) {
            parts.push(`Monthly budget: ₹${ctx.profile.monthlyBudget}`);
        }
        parts.push(`Subscription: ${ctx.profile.isPro ? "Pro (unlimited queries)" : "Free (3 queries/day)"}`);
    } else {
        parts.push("Profile: Not set up yet (suggest onboarding)");
    }

    parts.push("\n--- SPENDING DATA ---");
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
    } else {
        parts.push("No spending data logged this month. Encourage user to start tracking transactions.");
    }

    // Recent transactions for pattern recognition
    if (ctx.recentTransactions.length > 0) {
        parts.push("\nRecent transactions (latest 10):");
        ctx.recentTransactions.slice(0, 10).forEach((t) => {
            parts.push(`  - ₹${t.amount} at ${t.merchant} (${t.category}) via ${t.paymentApp}`);
        });
    }

    // Missed savings — this is GOLD for the AI to highlight
    if (ctx.missedSavings > 0) {
        parts.push(`\nMISSED SAVINGS THIS MONTH: ₹${ctx.missedSavings.toFixed(0)} (use this to motivate the user!)`);
    }

    parts.push("\n--- SAVINGS DATA ---");
    if (ctx.savingsStats) {
        parts.push(
            `Total saved via PayWise: ₹${ctx.savingsStats.totalSaved.toFixed(0)}`
        );
        parts.push(`Saved this month: ₹${ctx.savingsStats.savedThisMonth.toFixed(0)}`);
        parts.push(`Savings streak: ${ctx.savingsStats.streak} days`);
    } else {
        parts.push("No savings tracked yet. Encourage using 'I Used This' on offers page.");
    }

    parts.push(`\nActive offers on platform: ${ctx.activeOfferCount}`);

    return parts.join("\n");
}
