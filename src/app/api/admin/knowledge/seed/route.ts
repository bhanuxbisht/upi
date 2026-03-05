import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { CREDIT_CARDS } from "@/lib/ai/knowledge/credit-cards";
import { UPI_APPS } from "@/lib/ai/knowledge/upi-apps";
import { OFFER_STACKING_STRATEGIES } from "@/lib/ai/knowledge/payment-strategies";

/**
 * POST — Seed all knowledge tables from hardcoded TypeScript data.
 * This is a one-time migration endpoint. Uses upsert to be idempotent.
 */
export async function POST() {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase, user } = auth;

        const results = { creditCards: 0, upiApps: 0, strategies: 0, errors: [] as string[] };

        // 1. Seed Credit Cards
        for (const card of CREDIT_CARDS) {
            const { error } = await supabase
                .from("knowledge_credit_cards")
                .upsert({
                    id: card.id,
                    bank: card.bank,
                    name: card.name,
                    annual_fee: card.annualFee,
                    fee_waiver: card.feeWaiver || null,
                    joining_fee: card.joiningFee,
                    network: card.network,
                    tier: card.tier,
                    rewards: card.rewards,
                    lounge_access: card.loungeAccess || null,
                    fuel_surcharge_waiver: card.fuelSurchargeWaiver,
                    best_for: card.bestFor,
                    affiliate_link: card.affiliateLink || null,
                    affiliate_payout: card.affiliatePayout || null,
                    income_requirement: card.incomeRequirement || null,
                    pros: card.pros,
                    cons: card.cons,
                    is_active: true,
                    confidence_level: "verified",
                    last_verified_date: new Date().toISOString(),
                    verified_by: user.email || "seed-migration",
                }, { onConflict: "id" });

            if (error) {
                results.errors.push(`Credit Card ${card.id}: ${error.message}`);
            } else {
                results.creditCards++;
            }
        }

        // 2. Seed UPI Apps
        for (const app of UPI_APPS) {
            const { error } = await supabase
                .from("knowledge_upi_apps")
                .upsert({
                    id: app.id,
                    name: app.name,
                    slug: app.slug,
                    market_share: app.marketShare,
                    monthly_active_users: app.monthlyActiveUsers,
                    color: app.color,
                    strength_categories: app.strengthCategories,
                    weak_categories: app.weakCategories,
                    reward_tiers: app.rewardTiers,
                    linked_card_benefits: app.linkedCardBenefits,
                    strategies: app.strategies,
                    recurring_payment_support: app.recurringPaymentSupport,
                    auto_pay_support: app.autoPaySupport,
                    credit_card_link_support: app.creditCardLinkSupport,
                    split_bill_support: app.splitBillSupport,
                    is_active: true,
                    confidence_level: "verified",
                    last_verified_date: new Date().toISOString(),
                    verified_by: user.email || "seed-migration",
                }, { onConflict: "id" });

            if (error) {
                results.errors.push(`UPI App ${app.id}: ${error.message}`);
            } else {
                results.upiApps++;
            }
        }

        // 3. Seed Strategies
        for (const strategy of OFFER_STACKING_STRATEGIES) {
            const { error } = await supabase
                .from("knowledge_strategies")
                .upsert({
                    id: strategy.id,
                    title: strategy.title,
                    category: strategy.category,
                    difficulty: strategy.difficulty,
                    monthly_savings_min: strategy.monthlySavingsPotential.min,
                    monthly_savings_max: strategy.monthlySavingsPotential.max,
                    steps: strategy.steps,
                    requirements: strategy.requirements || [],
                    warnings: strategy.warnings || [],
                    applicable_to: strategy.applicableTo,
                    is_active: true,
                    confidence_level: "verified",
                    last_verified_date: new Date().toISOString(),
                    verified_by: user.email || "seed-migration",
                }, { onConflict: "id" });

            if (error) {
                results.errors.push(`Strategy ${strategy.id}: ${error.message}`);
            } else {
                results.strategies++;
            }
        }

        return NextResponse.json({
            success: results.errors.length === 0,
            message: `Seeded: ${results.creditCards} credit cards, ${results.upiApps} UPI apps, ${results.strategies} strategies`,
            results,
        });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
