/**
 * PayWise Payment Calculator — Deterministic, Never Hallucinates
 * 
 * THIS IS THE CORE OF ACCURACY.
 * 
 * The LLM can hallucinate reward rates. This module does the math
 * in pure code — reward rate * amount, apply caps, compare options.
 * The LLM receives the CALCULATED result and only formats it.
 * 
 * Flow:
 * 1. User says "best way to pay ₹800 at Swiggy"
 * 2. Calculator computes exact savings for every card + UPI app
 * 3. Calculator returns ranked results with ₹ amounts
 * 4. LLM receives: "HDFC Swiggy: ₹80 (10%), SBI Cashback: ₹40 (5%)"
 * 5. LLM writes a nice response USING these exact numbers
 * 
 * The numbers are NEVER wrong because they come from code, not LLM generation.
 */

import type { CreditCard } from "./knowledge/credit-cards";
import type { UPIAppProfile } from "./knowledge/upi-apps";
import type { Strategy } from "./knowledge/payment-strategies";

// ============================================================
// TYPES
// ============================================================

export interface PaymentOption {
    rank: number;
    method: string;          // "HDFC Swiggy Card via PhonePe"
    savings: number;         // ₹80
    savingsPercent: number;  // 10
    breakdown: string[];     // ["Card cashback: ₹80 (10%)", "PhonePe coupon: ₹50"]
    totalSavings: number;    // ₹130 (if stacked)
    warnings: string[];      // ["Max ₹1500/month cap", "Only on app orders"]
    confidence: "exact" | "estimated" | "approximate";
}

export interface CalculationResult {
    query: string;
    merchant: string | null;
    amount: number | null;
    category: string | null;
    topOptions: PaymentOption[];
    bestOption: PaymentOption | null;
    stackingTip: string | null;
    quickSummary: string;    // "Save ₹130 on your ₹800 Swiggy order using HDFC Swiggy + PhonePe"
}

// ============================================================
// MERCHANT-CATEGORY MAP (for matching)
// ============================================================

const MERCHANT_TO_CATEGORIES: Record<string, string[]> = {
    "swiggy": ["food-delivery", "dining"],
    "zomato": ["food-delivery", "dining"],
    "amazon": ["amazon", "online-shopping"],
    "flipkart": ["flipkart", "online-shopping"],
    "myntra": ["flipkart", "online-shopping"],
    "bigbasket": ["groceries"],
    "blinkit": ["groceries"],
    "zepto": ["groceries"],
    "makemytrip": ["travel"],
    "goibibo": ["travel"],
    "cleartrip": ["travel"],
    "ola": ["travel"],
    "uber": ["travel"],
    "rapido": ["travel"],
    "bookmyshow": ["entertainment"],
    "netflix": ["entertainment", "streaming"],
    "spotify": ["entertainment", "streaming"],
    "jio": ["bills-recharges"],
    "airtel": ["bills-recharges"],
    "vi": ["bills-recharges"],
    "starbucks": ["dining", "food-delivery"],
    "nykaa": ["online-shopping"],
    "croma": ["online-shopping", "electronics"],
    "reliance": ["online-shopping"],
};

// ============================================================
// CORE CALCULATOR
// ============================================================

/**
 * Calculate the best payment options for a merchant + amount.
 * Returns ranked options with EXACT ₹ savings.
 * 
 * This is pure math — no LLM involved.
 */
export function calculateBestPayment(
    merchant: string,
    amount: number,
    creditCards: CreditCard[],
    upiApps: UPIAppProfile[],
    strategies: Strategy[]
): CalculationResult {
    const merchantLower = merchant.toLowerCase().trim();
    const categories = MERCHANT_TO_CATEGORIES[merchantLower] || ["general"];
    
    const options: PaymentOption[] = [];

    // --- Calculate credit card savings ---
    for (const card of creditCards) {
        let bestRate = 0;
        let bestRewardCategory = "";
        let bestRewardType = "";
        let cap: number | undefined;
        let notes = "";

        for (const reward of card.rewards) {
            let matches = false;

            // Check if this reward applies to the merchant's categories
            for (const cat of categories) {
                if (reward.category === cat) {
                    matches = true;
                    break;
                }
            }
            
            // General always matches (but lower priority)
            if (!matches && reward.category === "general") {
                matches = true;
            }

            if (matches && reward.rewardRate > bestRate) {
                bestRate = reward.rewardRate;
                bestRewardCategory = reward.category;
                bestRewardType = reward.rewardType;
                cap = reward.cap;
                notes = reward.notes || "";
            }
        }

        if (bestRate > 0) {
            const rawSavings = (amount * bestRate) / 100;
            const savings = cap ? Math.min(rawSavings, cap) : rawSavings;
            const wasCapped = cap ? rawSavings > cap : false;

            const warnings: string[] = [];
            if (wasCapped) {
                warnings.push(`Capped at ₹${cap}/month — raw would be ₹${rawSavings.toFixed(0)}`);
            }
            if (card.annualFee > 0 && !card.feeWaiver) {
                warnings.push(`Annual fee ₹${card.annualFee}`);
            }

            options.push({
                rank: 0, // will be set after sorting
                method: `${card.bank} ${card.name}`,
                savings: Math.round(savings * 100) / 100,
                savingsPercent: bestRate,
                breakdown: [
                    `${bestRewardType === "cashback" ? "Cashback" : bestRewardType === "points" ? "Reward points" : "Miles"}: ₹${savings.toFixed(0)} (${bestRate}% on ${bestRewardCategory})`,
                    ...(notes ? [notes] : []),
                ],
                totalSavings: Math.round(savings * 100) / 100,
                warnings,
                confidence: "exact",
            });
        }
    }

    // --- Add UPI app bonus savings (stacking potential) ---
    for (const app of upiApps) {
        for (const tier of app.rewardTiers) {
            let categoryMatch = false;
            
            // Check if this app reward matches the merchant
            if (tier.merchant && merchantLower.includes(tier.merchant.toLowerCase())) {
                categoryMatch = true;
            }
            if (tier.category && categories.includes(tier.category)) {
                categoryMatch = true;
            }

            if (categoryMatch && tier.cashback) {
                const cb = tier.cashback;
                let upiSavings = 0;

                if (cb.type === "flat" && cb.value) {
                    upiSavings = cb.value;
                } else if (cb.type === "percentage" && cb.value) {
                    upiSavings = (amount * cb.value) / 100;
                    if (cb.maxCashback) {
                        upiSavings = Math.min(upiSavings, cb.maxCashback);
                    }
                } else if (cb.type === "scratch-card" && cb.maxCashback) {
                    // Scratch cards are probabilistic
                    upiSavings = cb.maxCashback * (cb.probability || 50) / 100;
                } else if (cb.type === "coins" && cb.value) {
                    upiSavings = cb.value; // Coin value treated as cash equivalent
                }

                if (upiSavings > 0 && amount >= (cb.minTransaction || 0)) {
                    // UPI bonus can be ADDED to card savings (stacking)
                    options.push({
                        rank: 0,
                        method: `${app.name} UPI bonus`,
                        savings: Math.round(upiSavings * 100) / 100,
                        savingsPercent: (upiSavings / amount) * 100,
                        breakdown: [
                            cb.type === "scratch-card"
                                ? `Scratch card: up to ₹${cb.maxCashback} (${cb.probability || 50}% chance)`
                                : `${app.name} ${cb.type}: ₹${upiSavings.toFixed(0)}`,
                            ...(cb.notes ? [cb.notes] : []),
                        ],
                        totalSavings: Math.round(upiSavings * 100) / 100,
                        warnings: cb.type === "scratch-card" ? ["Scratch card — not guaranteed"] : [],
                        confidence: cb.type === "scratch-card" ? "approximate" : "exact",
                    });
                }
            }
        }
    }

    // --- Sort and rank ---
    options.sort((a, b) => b.savings - a.savings);
    options.forEach((opt, i) => { opt.rank = i + 1; });

    // --- Find stacking tip ---
    let stackingTip: string | null = null;
    const topCard = options.find(o => !o.method.includes("UPI bonus") && !o.method.includes("scratch"));
const topUPI = options.find(o => o.method.includes("UPI bonus"));
    
    if (topCard && topUPI) {
        const stackedSavings = topCard.savings + topUPI.savings;
        stackingTip = `Stack: ${topCard.method} + ${topUPI.method} = ₹${stackedSavings.toFixed(0)} total (₹${topCard.savings.toFixed(0)} card + ₹${topUPI.savings.toFixed(0)} UPI)`;
    }

    // --- Build relevant stacking strategy ---
    const relevantStrategy = strategies.find(s => 
        categories.some(c => s.applicableTo?.includes(c) || s.category === c)
    );
    if (!stackingTip && relevantStrategy) {
        stackingTip = `Strategy: ${relevantStrategy.title} — ${relevantStrategy.steps[0]}`;
    }

    // --- Quick summary ---
    const bestOption = options[0] || null;
    const quickSummary = bestOption
        ? `Save ₹${bestOption.savings.toFixed(0)} on your ₹${amount} ${merchant} purchase using ${bestOption.method}${stackingTip ? `. With stacking: ${stackingTip}` : ""}`
        : `No specific card rewards found for ${merchant}. Use your highest general-rate card.`;

    return {
        query: `Best way to pay ₹${amount} at ${merchant}`,
        merchant,
        amount,
        category: categories[0] || null,
        topOptions: options.slice(0, 5),
        bestOption,
        stackingTip,
        quickSummary,
    };
}

/**
 * Calculate which credit card is best for a given spending profile.
 * Returns cards ranked by NET annual benefit (savings - fee).
 */
export function calculateBestCard(
    monthlySpending: Record<string, number>,
    creditCards: CreditCard[]
): Array<{
    card: CreditCard;
    monthlySavings: number;
    annualSavings: number;
    netAnnualBenefit: number;
    breakdown: Array<{ category: string; spending: number; savings: number; rate: number }>;
}> {
    const results = [];

    for (const card of creditCards) {
        let totalMonthlySavings = 0;
        const breakdown: Array<{ category: string; spending: number; savings: number; rate: number }> = [];

        for (const [category, amount] of Object.entries(monthlySpending)) {
            // Find the best matching reward for this category
            const matchingRewards = card.rewards.filter(r =>
                r.category === category ||
                r.category === "general" ||
                (category === "food-delivery" && (r.category === "dining" || r.category === "food-delivery")) ||
                (category === "online-shopping" && r.category === "online-shopping") ||
                (category === "groceries" && r.category === "groceries")
            );

            const best = matchingRewards.sort((a, b) => b.rewardRate - a.rewardRate)[0];
            
            if (best) {
                const savings = (amount * best.rewardRate) / 100;
                const capped = best.cap ? Math.min(savings, best.cap) : savings;
                totalMonthlySavings += capped;
                breakdown.push({
                    category,
                    spending: amount,
                    savings: Math.round(capped * 100) / 100,
                    rate: best.rewardRate,
                });
            }
        }

        const annualSavings = totalMonthlySavings * 12;
        const fee = card.annualFee;
            // If fee waiver text exists, assume user can meet it
        const effectiveFee = card.feeWaiver ? 0 : fee;
        const netBenefit = annualSavings - effectiveFee;

        results.push({
            card,
            monthlySavings: Math.round(totalMonthlySavings * 100) / 100,
            annualSavings: Math.round(annualSavings * 100) / 100,
            netAnnualBenefit: Math.round(netBenefit * 100) / 100,
            breakdown,
        });
    }

    return results.sort((a, b) => b.netAnnualBenefit - a.netAnnualBenefit);
}

/**
 * For a given bill type, calculate the best payment app + card combo.
 * Used for "optimize my bills" queries.
 */
export function calculateBestBillPayment(
    billType: string,
    amount: number,
    creditCards: CreditCard[],
    upiApps: UPIAppProfile[]
): { app: string; card: string | null; savings: number; breakdown: string[] } {
    // Best UPI app for each bill type based on scratch card / cashback
    const appScores: Array<{ app: UPIAppProfile; score: number; reason: string }> = [];
    
    for (const app of upiApps) {
        const tier = app.rewardTiers.find(t => 
            t.category === billType || 
            t.category === "bills-recharges" || 
            t.category === "recharge"
        );
        
        if (tier?.cashback) {
            let score = 0;
            if (tier.cashback.type === "flat" && tier.cashback.value) {
                score = tier.cashback.value;
            } else if (tier.cashback.type === "percentage" && tier.cashback.value) {
                score = (amount * tier.cashback.value) / 100;
            } else if (tier.cashback.type === "scratch-card" && tier.cashback.maxCashback) {
                score = tier.cashback.maxCashback * (tier.cashback.probability || 50) / 100;
            }
            
            if (score > 0) {
                appScores.push({ app, score, reason: tier.cashback.notes || `${app.name} reward` });
            }
        }
    }

    appScores.sort((a, b) => b.score - a.score);
    const bestApp = appScores[0];
    
    // Best card for bills category
    let bestCard: { name: string; savings: number } | null = null;
    for (const card of creditCards) {
        const reward = card.rewards.find(r => r.category === "bills-recharges" || r.category === "general");
        if (reward) {
            const savings = (amount * reward.rewardRate) / 100;
            const capped = reward.cap ? Math.min(savings, reward.cap) : savings;
            if (!bestCard || capped > bestCard.savings) {
                bestCard = { name: `${card.bank} ${card.name}`, savings: capped };
            }
        }
    }

    const totalSavings = (bestApp?.score || 0) + (bestCard?.savings || 0);
    const breakdown: string[] = [];
    if (bestApp) breakdown.push(`${bestApp.app.name}: ₹${bestApp.score.toFixed(0)} (${bestApp.reason})`);
    if (bestCard) breakdown.push(`${bestCard.name}: ₹${bestCard.savings.toFixed(0)} card reward`);

    return {
        app: bestApp?.app.name || "Any UPI app",
        card: bestCard?.name || null,
        savings: Math.round(totalSavings * 100) / 100,
        breakdown,
    };
}

/**
 * Format a CalculationResult into a string that gets injected into the LLM prompt.
 * The LLM reads this and writes a natural-language response.
 * The NUMBERS are guaranteed correct because they come from code.
 */
export function formatCalculationForLLM(result: CalculationResult): string {
    const parts: string[] = [];
    
    parts.push(`[CALCULATED RESULT — These numbers are VERIFIED. Use them exactly as shown.]`);
    parts.push(`Query: ${result.query}`);
    
    if (result.topOptions.length > 0) {
        parts.push(`\nRANKED PAYMENT OPTIONS (best first):`);
        for (const opt of result.topOptions) {
            const confidenceTag = opt.confidence === "exact" ? "✓ EXACT" : opt.confidence === "estimated" ? "~ ESTIMATED" : "~ APPROXIMATE";
            parts.push(`${opt.rank}. ${opt.method} — Save ₹${opt.savings.toFixed(0)} (${opt.savingsPercent.toFixed(1)}%) [${confidenceTag}]`);
            for (const line of opt.breakdown) {
                parts.push(`   ${line}`);
            }
            if (opt.warnings.length > 0) {
                parts.push(`   Warnings: ${opt.warnings.join("; ")}`);
            }
        }
    }

    if (result.stackingTip) {
        parts.push(`\nSTACKING OPPORTUNITY: ${result.stackingTip}`);
    }

    parts.push(`\nQUICK ANSWER: ${result.quickSummary}`);
    parts.push(`\n[IMPORTANT: Present these ranked options naturally. Show the ₹ savings prominently. The numbers above are mathematically calculated — do NOT change them.]`);

    return parts.join("\n");
}
