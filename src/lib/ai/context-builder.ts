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
import { buildDatabaseKnowledgeContext, buildSmartKnowledgeContext } from "./knowledge-service";
import { calculateBestPayment, calculateBestCard, calculateBestBillPayment, formatCalculationForLLM } from "./payment-calculator";
import { CREDIT_CARDS } from "./knowledge/credit-cards";
import { UPI_APPS } from "./knowledge/upi-apps";
import { OFFER_STACKING_STRATEGIES } from "./knowledge/payment-strategies";

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
                .select("merchant_name, category, amount, payment_app, transaction_date, could_have_saved")
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
                    (sum: number, t: { could_have_saved?: number }) => sum + Number(t.could_have_saved || 0),
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
    // Phase 3 Build 3-4: Smart retrieval (hybrid search + offer injection)
    // Fallback chain: Smart search → Intent-based DB → TypeScript
    let knowledgeContext = "";
    let calculatedContext = "";
    
    if (userQuery) {
        try {
            const analysis = analyzeQuery(userQuery);
            
            // ═══════════════════════════════════════════════════════
            // LAYER 0: DETERMINISTIC CALCULATOR (accuracy-first)
            // When we detect a payment query with merchant + amount,
            // compute EXACT ₹ savings in code. The LLM cannot
            // hallucinate these numbers — they come from pure math.
            // ═══════════════════════════════════════════════════════
            try {
                if (
                    analysis.amount &&
                    analysis.merchants.length > 0 &&
                    (analysis.intent === "payment_recommendation" || analysis.intent === "merchant_specific")
                ) {
                    // Calculate exact savings for this merchant + amount
                    const calcResult = calculateBestPayment(
                        analysis.merchants[0],
                        analysis.amount,
                        CREDIT_CARDS,
                        UPI_APPS,
                        OFFER_STACKING_STRATEGIES
                    );
                    calculatedContext = formatCalculationForLLM(calcResult);
                } else if (
                    analysis.intent === "bill_optimization" &&
                    analysis.amount &&
                    analysis.categories.length > 0
                ) {
                    const billResult = calculateBestBillPayment(
                        analysis.categories[0],
                        analysis.amount,
                        CREDIT_CARDS,
                        UPI_APPS
                    );
                    calculatedContext = [
                        `[CALCULATED BILL OPTIMIZATION — These numbers are VERIFIED]`,
                        `Best app: ${billResult.app}`,
                        `Best card: ${billResult.card || "N/A"}`,
                        `Total savings: ₹${billResult.savings.toFixed(0)}`,
                        `Breakdown: ${billResult.breakdown.join(" + ")}`,
                        `[IMPORTANT: Use these exact numbers in your response.]`,
                    ].join("\n");
                } else if (
                    analysis.intent === "card_recommendation" &&
                    analysis.categories.length > 0
                ) {
                    // Build a spending profile from the detected categories
                    const profile: Record<string, number> = {};
                    for (const cat of analysis.categories) {
                        profile[cat] = analysis.amount || 5000; // default ₹5000/month if no amount
                    }
                    const cardResults = calculateBestCard(profile, CREDIT_CARDS);
                    const top3 = cardResults.slice(0, 3);
                    calculatedContext = [
                        `[CALCULATED CARD COMPARISON — These numbers are VERIFIED]`,
                        ...top3.map((r, i) => [
                            `${i + 1}. ${r.card.bank} ${r.card.name}`,
                            `   Monthly savings: ₹${r.monthlySavings.toFixed(0)}`,
                            `   Annual savings: ₹${r.annualSavings.toFixed(0)}`,
                            `   Net benefit (after fee): ₹${r.netAnnualBenefit.toFixed(0)}`,
                            `   Breakdown: ${r.breakdown.map(b => `${b.category}: ${b.rate}% = ₹${b.savings.toFixed(0)}/mo`).join(", ")}`,
                        ].join("\n")),
                        `[IMPORTANT: Present these cards with the exact ₹ numbers shown above.]`,
                    ].join("\n");
                }
            } catch (calcError) {
                console.warn("[ContextBuilder] Calculator failed, continuing with knowledge fallback:", calcError);
            }
            
            // LAYER 1: Smart retrieval (hybrid full-text + vector search + live offers)
            try {
                const smartKnowledge = await buildSmartKnowledgeContext(
                    userQuery,
                    analysis.intent,
                    analysis.categories,
                    analysis.merchants,
                    analysis.paymentApps
                );
                if (smartKnowledge && !smartKnowledge.includes("unavailable")) {
                    knowledgeContext = `[DETECTED INTENT: ${analysis.intent} (confidence: ${(analysis.confidence * 100).toFixed(0)}%)]\n\n${smartKnowledge}`;
                }
            } catch {
                console.warn("[ContextBuilder] Smart retrieval failed, trying intent-based fallback");
            }

            // LAYER 2: Intent-based DB fetch (Phase 3 Build 1-2 — fetch all, filter by intent)
            if (!knowledgeContext) {
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
            }
            
            // LAYER 3: TypeScript hardcoded fallback (always works, never breaks)
            if (!knowledgeContext) {
                knowledgeContext = buildKnowledgeContext(analysis);
            }
        } catch (err) {
            console.warn("[ContextBuilder] Knowledge injection failed:", err);
        }
    }

    // Combine all context layers — calculator results override knowledge
    const allContext = [
        userContextStr,
        calculatedContext ? `\n--- CALCULATED RESULTS (Trust these numbers completely) ---\n${calculatedContext}` : "",
        knowledgeContext ? `\n--- DOMAIN KNOWLEDGE (Use this data in your response) ---\n${knowledgeContext}` : "",
    ].filter(Boolean).join("\n");

    return allContext;
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
