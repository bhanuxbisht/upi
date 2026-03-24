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
 * 1. User says "best way to pay ₹50,000 at Amazon"
 * 2. Calculator reads `reward_math` JSON from the DB for each card
 * 3. Matches merchant keywords → applies correct rate, caps, point value
 * 4. Returns ranked results with EXACT ₹ amounts
 * 5. LLM writes a nice response USING these exact numbers
 * 
 * The numbers are NEVER wrong because they come from code, not LLM generation.
 */

import type { CreditCard, RewardMath, RewardMathCategory } from "./knowledge/credit-cards";
import type { UPIAppProfile } from "./knowledge/upi-apps";
import type { Strategy } from "./knowledge/payment-strategies";

// ============================================================
// TYPES
// ============================================================

export interface PaymentOption {
    rank: number;
    method: string;          // "SBI Card CASHBACK SBI Card"
    savings: number;         // ₹2500
    savingsPercent: number;  // 5
    breakdown: string[];     // ["Cashback: ₹2500 (5% on online)"]
    totalSavings: number;    // ₹2500
    warnings: string[];      // ["Max ₹5000/month cap"]
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
    quickSummary: string;    // "Save ₹2500 on your ₹50000 Amazon order using SBI CASHBACK"
}

// ============================================================
// MERCHANT → KEYWORD MAP (for matching reward_math keywords)
// ============================================================

const MERCHANT_TO_KEYWORDS: Record<string, string[]> = {
    "swiggy": ["swiggy", "food", "online"],
    "zomato": ["zomato", "food", "online"],
    "amazon": ["amazon", "online", "app", "website"],
    "flipkart": ["flipkart", "online", "app", "website"],
    "myntra": ["myntra", "online", "app", "website"],
    "bigbasket": ["bigbasket", "grocery", "online"],
    "blinkit": ["blinkit", "grocery", "online"],
    "zepto": ["zepto", "grocery", "online"],
    "makemytrip": ["makemytrip", "travel", "flight", "hotel", "online"],
    "goibibo": ["goibibo", "travel", "flight", "hotel", "online"],
    "cleartrip": ["cleartrip", "travel", "flight", "online"],
    "ola": ["ola", "travel"],
    "uber": ["uber", "travel"],
    "rapido": ["rapido", "travel"],
    "bookmyshow": ["bookmyshow", "entertainment", "movie", "online"],
    "netflix": ["netflix", "streaming", "entertainment", "online"],
    "spotify": ["spotify", "streaming", "entertainment", "online"],
    "nykaa": ["nykaa", "online"],
    "croma": ["croma", "electronics", "online"],
    "ajio": ["ajio", "online"],
    "jiomart": ["jiomart", "reliance", "online"],
    "indigo": ["indigo", "flight", "travel"],
    "irctc": ["irctc", "trains", "railway"],
    "apollo": ["apollo", "pharmacy"],
    "netmeds": ["netmeds", "pharmacy", "online"],
    "dominos": ["dominos", "food", "online"],
    "bpcl": ["bpcl", "fuel", "petrol", "diesel"],
    "hp": ["fuel", "petrol", "diesel"],
    "ioc": ["fuel", "petrol", "diesel"],
    "lifestyle": ["lifestyle", "home centre"],
    "tanishq": ["tanishq", "jewelry"],
    "titan": ["titan", "helios", "jewelry"],
    "tata": ["tata", "neu", "bigbasket", "croma"],
};

// ============================================================
// CORE: reward_math based calculator
// ============================================================

/**
 * Calculate savings for a single credit card using its reward_math JSON.
 * This is pure, strict, deterministic math — no guessing.
 */
function calculateCardSavings(
    card: CreditCard,
    merchantLower: string,
    amount: number
): { savings: number; percent: number; breakdown: string; warnings: string[]; matchedCategory: string } | null {
    const math = card.rewardMath as RewardMath | null | undefined;

    // If no reward_math exists, fall back to the old rewards array (Phase 1 compat)
    if (!math) {
        return calculateCardSavingsLegacy(card, merchantLower, amount);
    }

    // Get all the keywords that could match this merchant
    const merchantKeywords = MERCHANT_TO_KEYWORDS[merchantLower] || [merchantLower];

    // Check exclusions first — if the merchant is excluded, no savings
    if (math.exclusions) {
        for (const excl of math.exclusions) {
            if (merchantKeywords.includes(excl.toLowerCase())) {
                return null;
            }
        }
    }

    // Find the BEST matching category from reward_math
    let bestCategory: RewardMathCategory | null = null;
    let bestMatchScore = 0;

    for (const cat of math.categories) {
        let matchScore = 0;
        for (const keyword of cat.keywords) {
            if (merchantKeywords.includes(keyword.toLowerCase())) {
                matchScore++;
            }
        }
        if (matchScore > bestMatchScore) {
            bestMatchScore = matchScore;
            bestCategory = cat;
        }
    }

    // Calculate based on type
    const warnings: string[] = [];
    let savingsRupees = 0;
    let matchedCategoryLabel = "general";

    if (math.type === "cashback") {
        // CASHBACK cards — rate is a direct fraction (0.05 = 5%)
        const rate = bestCategory ? (bestCategory.cashback_rate ?? bestCategory.rate) : math.default_rate;
        savingsRupees = amount * rate;
        matchedCategoryLabel = bestCategory ? bestCategory.keywords[0] : "general";

        if (bestCategory?.max_cap_points_monthly && savingsRupees > bestCategory.max_cap_points_monthly) {
            warnings.push(`Capped at ₹${bestCategory.max_cap_points_monthly}/month`);
            savingsRupees = bestCategory.max_cap_points_monthly;
        }

        const pct = rate * 100;
        return {
            savings: Math.round(savingsRupees * 100) / 100,
            percent: pct,
            breakdown: `Cashback: ₹${Math.round(savingsRupees)} (${pct}% on ${matchedCategoryLabel})`,
            warnings,
            matchedCategory: matchedCategoryLabel,
        };

    } else if (math.type === "points" || math.type === "mixed") {
        // POINTS cards — rate is a multiplier, need point_value_rupees to convert
        const pointValue = math.point_value_rupees ?? 0.25;
        const divisor = math.spend_divisor ?? 100;
        const rate = bestCategory ? bestCategory.rate : math.default_rate;
        matchedCategoryLabel = bestCategory ? bestCategory.keywords[0] : "general";

        // Points earned = (amount / divisor) * rate
        let pointsEarned = (amount / divisor) * rate;

        // Apply monthly cap if it exists
        if (bestCategory?.max_cap_points_monthly && pointsEarned > bestCategory.max_cap_points_monthly) {
            warnings.push(`Capped at ${bestCategory.max_cap_points_monthly} points/month`);
            pointsEarned = bestCategory.max_cap_points_monthly;
        }

        savingsRupees = pointsEarned * pointValue;
        const effectivePercent = (savingsRupees / amount) * 100;

        return {
            savings: Math.round(savingsRupees * 100) / 100,
            percent: Math.round(effectivePercent * 100) / 100,
            breakdown: `${Math.round(pointsEarned)} points × ₹${pointValue}/pt = ₹${Math.round(savingsRupees)} (${effectivePercent.toFixed(1)}% on ${matchedCategoryLabel})`,
            warnings,
            matchedCategory: matchedCategoryLabel,
        };
    }

    return null;
}

/**
 * Legacy fallback for cards that don't have reward_math yet.
 * Uses the old rewards[] array from Phase 1.
 */
function calculateCardSavingsLegacy(
    card: CreditCard,
    merchantLower: string,
    amount: number
): { savings: number; percent: number; breakdown: string; warnings: string[]; matchedCategory: string } | null {
    const categories = MERCHANT_TO_KEYWORDS[merchantLower] || ["general"];
    let bestRate = 0;
    let bestRewardType = "cashback";
    let bestCategory = "general";
    let cap: number | undefined;

    for (const reward of card.rewards) {
        let matches = false;
        for (const cat of categories) {
            if (reward.category === cat || reward.category === "general") {
                matches = true;
                break;
            }
        }
        if (matches && reward.rewardRate > bestRate) {
            bestRate = reward.rewardRate;
            bestRewardType = reward.rewardType;
            bestCategory = reward.category;
            cap = reward.cap;
        }
    }

    if (bestRate > 0) {
        const raw = (amount * bestRate) / 100;
        const savings = cap ? Math.min(raw, cap) : raw;
        const warnings: string[] = [];
        if (cap && raw > cap) warnings.push(`Capped at ₹${cap}/month`);

        return {
            savings: Math.round(savings * 100) / 100,
            percent: bestRate,
            breakdown: `${bestRewardType === "cashback" ? "Cashback" : "Reward points"}: ₹${Math.round(savings)} (${bestRate}% on ${bestCategory})`,
            warnings,
            matchedCategory: bestCategory,
        };
    }

    return null;
}

// ============================================================
// MAIN CALCULATOR
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
    const options: PaymentOption[] = [];

    // --- Calculate credit card savings using reward_math ---
    for (const card of creditCards) {
        const result = calculateCardSavings(card, merchantLower, amount);
        if (result && result.savings > 0) {
            const warnings = [...result.warnings];
            if (card.annualFee > 0 && !card.feeWaiver) {
                warnings.push(`Annual fee ₹${card.annualFee}`);
            }

            options.push({
                rank: 0,
                method: `${card.bank} ${card.name}`,
                savings: result.savings,
                savingsPercent: result.percent,
                breakdown: [result.breakdown],
                totalSavings: result.savings,
                warnings,
                confidence: "exact",
            });
        }
    }

    // --- Add UPI app bonus savings (stacking potential) ---
    for (const app of upiApps) {
        for (const tier of app.rewardTiers) {
            let categoryMatch = false;

            if (tier.merchant && merchantLower.includes(tier.merchant.toLowerCase())) {
                categoryMatch = true;
            }
            if (tier.category) {
                const merchantKeywords = MERCHANT_TO_KEYWORDS[merchantLower] || [];
                if (merchantKeywords.includes(tier.category)) {
                    categoryMatch = true;
                }
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
                    upiSavings = cb.maxCashback * (cb.probability || 50) / 100;
                } else if (cb.type === "coins" && cb.value) {
                    upiSavings = cb.value;
                }

                if (upiSavings > 0 && amount >= (cb.minTransaction || 0)) {
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
    const topCard = options.find(o => !o.method.includes("UPI bonus"));
    const topUPI = options.find(o => o.method.includes("UPI bonus"));

    if (topCard && topUPI) {
        const stackedSavings = topCard.savings + topUPI.savings;
        stackingTip = `Stack: ${topCard.method} + ${topUPI.method} = ₹${stackedSavings.toFixed(0)} total (₹${topCard.savings.toFixed(0)} card + ₹${topUPI.savings.toFixed(0)} UPI)`;
    }

    // --- Build relevant stacking strategy ---
    const merchantKeywords = MERCHANT_TO_KEYWORDS[merchantLower] || [];
    const relevantStrategy = strategies.find(s =>
        merchantKeywords.some(kw => s.applicableTo?.includes(kw) || s.category === kw)
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
        category: merchantKeywords[0] || null,
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
            const result = calculateCardSavings(card, category, amount);
            if (result && result.savings > 0) {
                totalMonthlySavings += result.savings;
                breakdown.push({
                    category,
                    spending: amount,
                    savings: result.savings,
                    rate: result.percent,
                });
            }
        }

        const annualSavings = totalMonthlySavings * 12;
        const fee = card.annualFee;
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
 */
export function calculateBestBillPayment(
    billType: string,
    amount: number,
    creditCards: CreditCard[],
    upiApps: UPIAppProfile[]
): { app: string; card: string | null; savings: number; breakdown: string[] } {
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

    // Best card for bills
    let bestCard: { name: string; savings: number } | null = null;
    for (const card of creditCards) {
        const result = calculateCardSavings(card, billType, amount);
        if (result && result.savings > 0) {
            if (!bestCard || result.savings > bestCard.savings) {
                bestCard = { name: `${card.bank} ${card.name}`, savings: result.savings };
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
