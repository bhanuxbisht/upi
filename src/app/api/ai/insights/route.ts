/**
 * Proactive AI Insights API
 * 
 * Instead of waiting for users to ask, we TELL them:
 * - "You spent ₹3000 on food delivery this month — here's how to save ₹500 next month"
 * - "You missed ₹80 cashback on yesterday's Swiggy order"
 * - "HDFC has a new 10% offer on Amazon ending in 2 days"
 * 
 * This endpoint generates personalized, actionable insights
 * that give people a REASON to open PayWise every day.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { 
    getBestCardForMerchant, 
    estimateMonthlySavings,
    getOptimalAppStack,
    SUBSCRIPTION_OPTIMIZATION,
} from "@/lib/ai/knowledge";

const rateLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

interface Insight {
    id: string;
    type: "missed-saving" | "offer-alert" | "spending-alert" | "optimization-tip" | "streak" | "milestone";
    title: string;
    description: string;
    savingsAmount: number;
    action: string;
    actionLink?: string;
    urgency: "low" | "medium" | "high";
    category?: string;
    icon: string;
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const rateLimitResult = rateLimiter.check(user.id);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }

        const insights: Insight[] = [];

        // 1. MISSED SAVINGS — Check recent transactions for suboptimal payments
        try {
            const { data: recentTxns } = await supabase
                .from("user_transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("transaction_date", { ascending: false })
                .limit(20);

            if (recentTxns && recentTxns.length > 0) {
                for (const txn of recentTxns.slice(0, 5)) {
                    const betterOptions = getBestCardForMerchant(
                        txn.merchant_name || "",
                        Number(txn.amount)
                    );

                    if (betterOptions.length > 0) {
                        const bestOption = betterOptions[0];
                        const currentSavings = Number(txn.cashback_earned || 0);

                        if (bestOption.savings > currentSavings + 5) {
                            insights.push({
                                id: `missed-${txn.id}`,
                                type: "missed-saving",
                                title: `Missed ₹${(bestOption.savings - currentSavings).toFixed(0)} at ${txn.merchant_name}`,
                                description: `Your ₹${Number(txn.amount).toFixed(0)} payment at ${txn.merchant_name} via ${txn.payment_app} could've saved ₹${bestOption.savings.toFixed(0)} more using ${bestOption.card.bank} ${bestOption.card.name}.`,
                                savingsAmount: bestOption.savings - currentSavings,
                                action: `Use ${bestOption.card.bank} ${bestOption.card.name} next time`,
                                actionLink: "/recommend",
                                urgency: bestOption.savings > 100 ? "high" : "medium",
                                category: txn.category,
                                icon: "💸",
                            });
                        }
                    }
                }
            }
        } catch {
            // Table may not exist yet
        }

        // 2. SPENDING ALERTS — Detect high spending categories
        try {
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const { data: monthlyTxns } = await supabase
                .from("user_transactions")
                .select("category, amount")
                .eq("user_id", user.id)
                .gte("transaction_date", monthStart.toISOString());

            if (monthlyTxns && monthlyTxns.length > 0) {
                const categoryTotals: Record<string, number> = {};
                for (const txn of monthlyTxns) {
                    const cat = txn.category || "other";
                    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(txn.amount);
                }

                // Alert on high-spending categories
                const avgBenchmarks: Record<string, number> = {
                    "food-delivery": 4000,
                    "shopping": 5000,
                    "entertainment": 1500,
                    "groceries": 7000,
                    "travel": 3000,
                };

                for (const [cat, total] of Object.entries(categoryTotals)) {
                    const benchmark = avgBenchmarks[cat];
                    if (benchmark && total > benchmark * 1.3) {
                        insights.push({
                            id: `spending-${cat}`,
                            type: "spending-alert",
                            title: `${cat} spending is 30%+ above average`,
                            description: `You've spent ₹${total.toFixed(0)} on ${cat} this month. Indian urban avg is ~₹${benchmark}. Let's optimize!`,
                            savingsAmount: Math.round((total - benchmark) * 0.15),
                            action: `Ask PayWise AI: "How to reduce ${cat} spending?"`,
                            actionLink: "/ask",
                            urgency: total > benchmark * 2 ? "high" : "medium",
                            category: cat,
                            icon: "📊",
                        });
                    }
                }

                // Calculate total potential savings
                const savingsEstimate = estimateMonthlySavings(categoryTotals, true, true);
                if (savingsEstimate.totalPotentialSavings > 200) {
                    insights.push({
                        id: "total-opportunity",
                        type: "optimization-tip",
                        title: `₹${savingsEstimate.totalPotentialSavings.toFixed(0)} savings opportunity this month`,
                        description: savingsEstimate.topTip,
                        savingsAmount: savingsEstimate.totalPotentialSavings,
                        action: "View personalized savings plan",
                        actionLink: "/savings",
                        urgency: "high",
                        icon: "🎯",
                    });
                }
            }
        } catch {
            // Table may not exist yet
        }

        // 3. EXPIRING OFFERS — High-value offers about to expire
        try {
            const twoDaysFromNow = new Date();
            twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

            const { data: expiringOffers } = await supabase
                .from("offers")
                .select("*")
                .eq("status", "active")
                .lte("valid_to", twoDaysFromNow.toISOString())
                .gte("valid_to", new Date().toISOString())
                .order("max_cashback", { ascending: false })
                .limit(3);

            if (expiringOffers) {
                for (const offer of expiringOffers) {
                    const expiryDate = new Date(offer.valid_to);
                    const hoursLeft = Math.round(
                        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60)
                    );

                    insights.push({
                        id: `expiring-${offer.id}`,
                        type: "offer-alert",
                        title: `${offer.title} expires in ${hoursLeft}h`,
                        description: `${offer.description}. Save up to ₹${offer.max_cashback || "?"}. Don't miss out!`,
                        savingsAmount: Number(offer.max_cashback || 0),
                        action: "View offer",
                        actionLink: "/offers",
                        urgency: hoursLeft < 12 ? "high" : "medium",
                        icon: "⏰",
                    });
                }
            }
        } catch {
            // Table may not exist yet
        }

        // 4. STREAK & MILESTONES
        try {
            const { data: stats } = await supabase
                .from("user_savings_stats")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (stats) {
                const totalSaved = Number(stats.total_saved || 0);

                // Milestone celebrations
                const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000];
                for (const milestone of milestones) {
                    if (totalSaved >= milestone && totalSaved < milestone * 1.5) {
                        insights.push({
                            id: `milestone-${milestone}`,
                            type: "milestone",
                            title: `🎉 You've saved ₹${milestone}+ with PayWise!`,
                            description: `Total savings: ₹${totalSaved.toFixed(0)}. That's real money back in your pocket. Keep going!`,
                            savingsAmount: totalSaved,
                            action: "View savings history",
                            actionLink: "/savings",
                            urgency: "low",
                            icon: "🏆",
                        });
                        break;
                    }
                }
            }
        } catch {
            // Table may not exist yet
        }

        // 5. OPTIMIZATION TIPS (always show at least one)
        const optimalStack = getOptimalAppStack();
        if (insights.length < 3) {
            const randomTipIndex = Math.floor(Date.now() / 86400000) % optimalStack.length;
            const tip = optimalStack[randomTipIndex];
            insights.push({
                id: `tip-daily`,
                type: "optimization-tip",
                title: `Daily tip: ${tip.useCase}`,
                description: `Best option: ${tip.app} — ${tip.reason}`,
                savingsAmount: 0,
                action: `Try using ${tip.app} next time`,
                urgency: "low",
                icon: "💡",
            });
        }

        // Add subscription tip (rotate daily)
        const dayOfMonth = new Date().getDate();
        const subTip = SUBSCRIPTION_OPTIMIZATION.tips[dayOfMonth % SUBSCRIPTION_OPTIMIZATION.tips.length];
        if (subTip) {
            insights.push({
                id: "sub-tip",
                type: "optimization-tip",
                title: "Subscription tip",
                description: subTip,
                savingsAmount: 0,
                action: "Review your subscriptions",
                urgency: "low",
                icon: "📱",
            });
        }

        // Sort by urgency and savings amount
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        insights.sort((a, b) => {
            const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            if (urgencyDiff !== 0) return urgencyDiff;
            return b.savingsAmount - a.savingsAmount;
        });

        return NextResponse.json({
            insights: insights.slice(0, 10),
            totalPotentialSavings: insights.reduce((s, i) => s + i.savingsAmount, 0),
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Insights API Error]", error);
        return NextResponse.json(
            { error: "Failed to generate insights" },
            { status: 500 }
        );
    }
}
