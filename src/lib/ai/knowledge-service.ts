/**
 * Knowledge Service — Reads from Supabase knowledge tables
 * 
 * Phase 3: Supabase-first, TypeScript fallback.
 * This service provides the same data the query-analyzer uses,
 * but reads from the database first so admin edits take effect immediately.
 * 
 * The TypeScript files remain as a safety net until we verify
 * the database is fully seeded and stable.
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";

// Import TypeScript data as fallback
import { CREDIT_CARDS, type CreditCard } from "./knowledge/credit-cards";
import { UPI_APPS, type UPIAppProfile } from "./knowledge/upi-apps";
import {
    OFFER_STACKING_STRATEGIES,
    type Strategy,
} from "./knowledge/payment-strategies";

// ============================================================
// CREDIT CARDS
// ============================================================

interface DBCreditCard {
    id: string;
    bank: string;
    name: string;
    annual_fee: number;
    fee_waiver: string | null;
    joining_fee: number;
    network: string;
    tier: string;
    rewards: Array<{
        category: string;
        rewardRate: number;
        rewardType: string;
        pointsPerRupee?: number;
        pointValue?: number;
        cap?: number;
        minSpend?: number;
        notes?: string;
    }>;
    lounge_access: string | null;
    fuel_surcharge_waiver: boolean;
    best_for: string[];
    affiliate_link: string | null;
    affiliate_payout: number | null;
    income_requirement: string | null;
    pros: string[];
    cons: string[];
    is_active: boolean;
}

/**
 * Convert DB row to the CreditCard interface the query analyzer expects
 */
function dbToCreditCard(row: DBCreditCard): CreditCard {
    return {
        id: row.id,
        bank: row.bank,
        name: row.name,
        annualFee: Number(row.annual_fee),
        feeWaiver: row.fee_waiver || undefined,
        joiningFee: Number(row.joining_fee),
        network: row.network as CreditCard["network"],
        tier: row.tier as CreditCard["tier"],
        rewards: (row.rewards || []).map((r) => ({
            category: r.category,
            rewardRate: r.rewardRate,
            rewardType: r.rewardType as "cashback" | "points" | "miles",
            pointsPerRupee: r.pointsPerRupee,
            pointValue: r.pointValue,
            cap: r.cap,
            minSpend: r.minSpend,
            notes: r.notes,
        })),
        loungeAccess: row.lounge_access || undefined,
        fuelSurchargeWaiver: row.fuel_surcharge_waiver,
        bestFor: row.best_for || [],
        affiliateLink: row.affiliate_link || undefined,
        affiliatePayout: row.affiliate_payout || undefined,
        incomeRequirement: row.income_requirement || undefined,
        pros: row.pros || [],
        cons: row.cons || [],
    };
}

/**
 * Get all active credit cards from Supabase, fallback to TypeScript
 */
export async function getCreditCards(): Promise<CreditCard[]> {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from("knowledge_credit_cards")
            .select("*")
            .eq("is_active", true)
            .order("bank");

        if (error || !data || data.length === 0) {
            console.warn("[KnowledgeService] Falling back to TypeScript credit cards:", error?.message || "no data");
            return CREDIT_CARDS;
        }

        return data.map((row: DBCreditCard) => dbToCreditCard(row));
    } catch {
        console.warn("[KnowledgeService] DB unavailable, using TypeScript credit cards");
        return CREDIT_CARDS;
    }
}

// ============================================================
// UPI APPS
// ============================================================

interface DBUPIApp {
    id: string;
    name: string;
    slug: string;
    market_share: number;
    monthly_active_users: string;
    color: string;
    strength_categories: string[];
    weak_categories: string[];
    reward_tiers: UPIAppProfile["rewardTiers"];
    linked_card_benefits: string[];
    strategies: string[];
    recurring_payment_support: boolean;
    auto_pay_support: boolean;
    credit_card_link_support: boolean;
    split_bill_support: boolean;
    is_active: boolean;
}

function dbToUPIApp(row: DBUPIApp): UPIAppProfile {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        marketShare: Number(row.market_share),
        monthlyActiveUsers: row.monthly_active_users || "",
        color: row.color,
        strengthCategories: row.strength_categories || [],
        weakCategories: row.weak_categories || [],
        rewardTiers: row.reward_tiers || [],
        linkedCardBenefits: row.linked_card_benefits || [],
        strategies: row.strategies || [],
        recurringPaymentSupport: row.recurring_payment_support,
        autoPaySupport: row.auto_pay_support,
        creditCardLinkSupport: row.credit_card_link_support,
        splitBillSupport: row.split_bill_support,
    };
}

/**
 * Get all active UPI apps from Supabase, fallback to TypeScript
 */
export async function getUPIApps(): Promise<UPIAppProfile[]> {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from("knowledge_upi_apps")
            .select("*")
            .eq("is_active", true)
            .order("market_share", { ascending: false });

        if (error || !data || data.length === 0) {
            console.warn("[KnowledgeService] Falling back to TypeScript UPI apps:", error?.message || "no data");
            return UPI_APPS;
        }

        return data.map((row: DBUPIApp) => dbToUPIApp(row));
    } catch {
        console.warn("[KnowledgeService] DB unavailable, using TypeScript UPI apps");
        return UPI_APPS;
    }
}

// ============================================================
// STRATEGIES
// ============================================================

interface DBStrategy {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    monthly_savings_min: number;
    monthly_savings_max: number;
    steps: string[];
    requirements: string[];
    warnings: string[];
    applicable_to: string[];
    is_active: boolean;
}

function dbToStrategy(row: DBStrategy): Strategy {
    return {
        id: row.id,
        title: row.title,
        category: row.category,
        difficulty: row.difficulty as "easy" | "medium" | "advanced",
        monthlySavingsPotential: {
            min: Number(row.monthly_savings_min),
            max: Number(row.monthly_savings_max),
        },
        steps: row.steps || [],
        requirements: row.requirements || [],
        warnings: row.warnings || [],
        applicableTo: row.applicable_to || [],
    };
}

/**
 * Get all active strategies from Supabase, fallback to TypeScript
 */
export async function getStrategies(): Promise<Strategy[]> {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from("knowledge_strategies")
            .select("*")
            .eq("is_active", true)
            .order("category");

        if (error || !data || data.length === 0) {
            console.warn("[KnowledgeService] Falling back to TypeScript strategies:", error?.message || "no data");
            return OFFER_STACKING_STRATEGIES;
        }

        return data.map((row: DBStrategy) => dbToStrategy(row));
    } catch {
        console.warn("[KnowledgeService] DB unavailable, using TypeScript strategies");
        return OFFER_STACKING_STRATEGIES;
    }
}

// ============================================================
// AGGREGATED CONTEXT — Build rich knowledge for AI
// ============================================================

/**
 * Build a complete knowledge context from Supabase data.
 * This gives the LLM ALL knowledge to work with, not just query-specific.
 * The LLM can then pick what's relevant — better than our regex-based routing.
 */
export async function buildDatabaseKnowledgeContext(
    intent: string,
    categories: string[],
    merchants: string[]
): Promise<string> {
    const parts: string[] = [];

    try {
        // Fetch all knowledge in parallel
        const [creditCards, upiApps, strategies] = await Promise.all([
            getCreditCards(),
            getUPIApps(),
            getStrategies(),
        ]);

        // Credit card summary
        if (intent === "card_recommendation" || intent === "payment_recommendation" || intent === "reward_maximization" || intent === "rent_payment" || intent === "merchant_specific") {
            parts.push("[CREDIT CARD DATABASE — Latest verified data:]");
            for (const card of creditCards) {
                const topReward = card.rewards.sort((a, b) => b.rewardRate - a.rewardRate)[0];
                const rewardSummary = card.rewards.map((r) => `${r.category}: ${r.rewardRate}% ${r.rewardType}`).join(", ");
                parts.push(`- ${card.bank} ${card.name} (${card.tier}, ${card.network}): Fee ₹${card.annualFee}${card.feeWaiver ? ` (${card.feeWaiver})` : ""}. Best rate: ${topReward?.rewardRate || 0}% ${topReward?.rewardType || ""}. Categories: ${rewardSummary}. Best for: ${card.bestFor.join(", ")}`);
            }
        }

        // UPI app summary
        if (intent === "payment_recommendation" || intent === "compare_apps" || intent === "bill_optimization" || intent === "reward_maximization" || intent === "merchant_specific") {
            parts.push("\n[UPI APP DATABASE — Latest verified data:]");
            for (const app of upiApps) {
                parts.push(`- ${app.name} (${app.marketShare}% share): Strong in ${app.strengthCategories.join(", ")}. CC link: ${app.creditCardLinkSupport ? "Yes" : "No"}. Tips: ${app.strategies.slice(0, 2).join(" | ")}`);
            }
        }

        // Strategies
        if (intent === "offer_stacking" || intent === "payment_recommendation" || intent === "bill_optimization" || intent === "rent_payment" || intent === "reward_maximization" || intent === "monthly_routine" || intent === "general_advice") {
            const relevantStrategies = categories.length > 0
                ? strategies.filter((s) => categories.includes(s.category))
                : strategies;

            if (relevantStrategies.length > 0) {
                parts.push("\n[PAYMENT STRATEGIES — Tested & verified:]");
                for (const strat of relevantStrategies.slice(0, 5)) {
                    parts.push(`\n${strat.title} (${strat.difficulty}, saves ₹${strat.monthlySavingsPotential.min}-${strat.monthlySavingsPotential.max}/mo):`);
                    strat.steps.forEach((step) => parts.push(`  ${step}`));
                    if (strat.warnings?.length) parts.push(`  ⚠️ ${strat.warnings.join("; ")}`);
                }
            }
        }

        if (parts.length === 0) {
            parts.push("[Knowledge database is available but no specific data matched this query intent.]");
        }
    } catch (err) {
        console.warn("[KnowledgeService] Failed to build DB knowledge context:", err);
        parts.push("[Knowledge database unavailable — using fallback data.]");
    }

    return parts.join("\n");
}
