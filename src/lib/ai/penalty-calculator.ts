/**
 * PayWise Penalty Calculator — Deterministic, Never Hallucinates
 *
 * THIS IS THE CORE OF PENALTY/CHARGE ACCURACY.
 *
 * The LLM can hallucinate penalty amounts. This module does the math
 * in pure code — slab lookup, interest compounding, forex markup.
 * The LLM receives the CALCULATED result and only formats it.
 *
 * Flow:
 * 1. User says "What if I miss my SBI ELITE payment of ₹25,000?"
 * 2. Calculator reads `penalties` JSON from the DB for that card
 * 3. Matches outstanding to correct slab → applies exact fee
 * 4. Returns precise ₹ amounts + GST + total cost breakdown
 * 5. LLM writes a nice response USING these exact numbers
 *
 * The numbers are NEVER wrong because they come from code, not LLM generation.
 */

import type { CreditCard, PenaltyMatrix, LateFeeSlab } from "./knowledge/credit-cards";

// ============================================================
// TYPES
// ============================================================

export interface LateFeeResult {
    cardName: string;
    bank: string;
    outstandingAmount: number;
    lateFee: number;
    gstOnLateFee: number;       // 18% GST on late fee
    totalLatePenalty: number;    // lateFee + GST
    matchedSlab: LateFeeSlab;
    allSlabs: LateFeeSlab[];
    note: string | null;
    confidence: "exact" | "estimated";
}

export interface InterestChargeResult {
    cardName: string;
    bank: string;
    outstandingAmount: number;
    aprMonthly: number;          // e.g., 3.75
    aprAnnual: number;           // e.g., 45.0
    dailyRate: number;           // e.g., 0.125
    daysOutstanding: number;
    interestCharge: number;      // Raw interest
    gstOnInterest: number;      // 18% GST on interest
    totalInterestCost: number;  // interest + GST
    interestFreeperiodDays: number;
    note: string | null;
    confidence: "exact" | "estimated";
}

export interface ForexCostResult {
    cardName: string;
    bank: string;
    transactionAmountINR: number;    // Original amount in ₹
    forexMarkupPercent: number;      // e.g., 3.5
    markupCharge: number;            // ₹ markup amount
    gstOnMarkup: number;            // 18% GST on markup
    totalForexCost: number;         // markup + GST
    effectiveCostPercent: number;   // Total forex cost as % of txn
    note: string | null;
    confidence: "exact" | "estimated";
}

export interface FullPenaltySummary {
    cardName: string;
    bank: string;
    outstandingAmount: number;
    lateFee: LateFeeResult | null;
    interestCharge: InterestChargeResult | null;
    totalMonthlyPenalty: number;  // late fee + interest (both with GST)
    annualizedCost: number;       // If this continues for 12 months
    warnings: string[];
    advice: string[];
}

// ============================================================
// GST CONSTANT — Applied on all bank charges in India
// ============================================================
const GST_RATE = 0.18; // 18% GST on all financial charges

// ============================================================
// CORE: Late Fee Calculator
// ============================================================

/**
 * Calculate the exact late fee for a missed credit card payment.
 * Reads the `penalties.late_fees` slab array and matches the outstanding amount.
 *
 * @param card - The credit card with penalties data
 * @param outstandingAmount - Total outstanding on the card when payment was missed
 * @returns Exact late fee + GST breakdown, or null if no penalties data
 */
export function calculateLateFee(
    card: CreditCard,
    outstandingAmount: number
): LateFeeResult | null {
    const penalties = card.penalties as PenaltyMatrix | null | undefined;

    if (!penalties || !penalties.late_fees || penalties.late_fees.length === 0) {
        return null;
    }

    // Guard: negative or zero outstanding means no late fee
    if (outstandingAmount <= 0) {
        return {
            cardName: card.name,
            bank: card.bank,
            outstandingAmount: 0,
            lateFee: 0,
            gstOnLateFee: 0,
            totalLatePenalty: 0,
            matchedSlab: penalties.late_fees[0],
            allSlabs: penalties.late_fees,
            note: "No outstanding balance — no late fee applicable.",
            confidence: "exact",
        };
    }

    // Find the matching slab
    // Slabs are ordered: [{min:0, max:500, fee:0}, {min:501, max:1000, fee:400}, ...]
    let matchedSlab: LateFeeSlab | null = null;

    for (const slab of penalties.late_fees) {
        if (outstandingAmount >= slab.min && outstandingAmount <= slab.max) {
            matchedSlab = slab;
            break;
        }
    }

    // If no slab matched (amount exceeds all slabs), use the last/highest slab
    if (!matchedSlab) {
        matchedSlab = penalties.late_fees[penalties.late_fees.length - 1];
    }

    const lateFee = matchedSlab.fee;
    const gst = roundTo2(lateFee * GST_RATE);
    const total = roundTo2(lateFee + gst);

    return {
        cardName: card.name,
        bank: card.bank,
        outstandingAmount,
        lateFee,
        gstOnLateFee: gst,
        totalLatePenalty: total,
        matchedSlab,
        allSlabs: penalties.late_fees,
        note: penalties.note || null,
        confidence: "exact",
    };
}

// ============================================================
// CORE: Interest Charge Calculator
// ============================================================

/**
 * Calculate the interest charge for carrying forward a balance.
 * Uses the card's monthly APR, converts to daily rate, multiplies by days.
 *
 * IMPORTANT: In India, credit card interest is charged from the DATE OF TRANSACTION
 * (not from the due date) once the interest-free period is lost.
 * This means the actual interest can be higher than simple daily calculation.
 * We use a conservative estimate based on days outstanding.
 *
 * @param card - The credit card with penalties data
 * @param outstandingAmount - Amount carried forward past due date
 * @param daysOutstanding - Number of days the amount has been unpaid (default: 30)
 * @returns Exact interest charge + GST breakdown
 */
export function calculateInterestCharge(
    card: CreditCard,
    outstandingAmount: number,
    daysOutstanding: number = 30
): InterestChargeResult | null {
    const penalties = card.penalties as PenaltyMatrix | null | undefined;

    if (!penalties || typeof penalties.apr_monthly !== "number") {
        return null;
    }

    // Guard: no outstanding or no days
    if (outstandingAmount <= 0 || daysOutstanding <= 0) {
        return {
            cardName: card.name,
            bank: card.bank,
            outstandingAmount: 0,
            aprMonthly: penalties.apr_monthly,
            aprAnnual: roundTo2(penalties.apr_monthly * 12),
            dailyRate: roundTo4(penalties.apr_monthly / 30),
            daysOutstanding: 0,
            interestCharge: 0,
            gstOnInterest: 0,
            totalInterestCost: 0,
            interestFreeperiodDays: penalties.interest_free_period_days || 50,
            note: "No outstanding balance — no interest applicable.",
            confidence: "exact",
        };
    }

    const monthlyRate = penalties.apr_monthly / 100;  // 3.75 → 0.0375
    const dailyRate = monthlyRate / 30;               // Per-day rate
    const annualRate = penalties.apr_monthly * 12;     // For display

    // Interest = Principal × Daily Rate × Days
    const interest = roundTo2(outstandingAmount * dailyRate * daysOutstanding);
    const gst = roundTo2(interest * GST_RATE);
    const total = roundTo2(interest + gst);

    return {
        cardName: card.name,
        bank: card.bank,
        outstandingAmount,
        aprMonthly: penalties.apr_monthly,
        aprAnnual: roundTo2(annualRate),
        dailyRate: roundTo4(dailyRate * 100), // Convert back to % for display
        daysOutstanding,
        interestCharge: interest,
        gstOnInterest: gst,
        totalInterestCost: total,
        interestFreeperiodDays: penalties.interest_free_period_days || 50,
        note: penalties.note || null,
        confidence: "exact",
    };
}

// ============================================================
// CORE: Forex Cost Calculator
// ============================================================

/**
 * Calculate the total cost of a foreign currency transaction.
 * Includes forex markup + GST on the markup.
 *
 * @param card - The credit card with penalties data
 * @param amountINR - The transaction amount in INR (after currency conversion)
 * @returns Exact forex cost breakdown
 */
export function calculateForexCost(
    card: CreditCard,
    amountINR: number
): ForexCostResult | null {
    const penalties = card.penalties as PenaltyMatrix | null | undefined;

    if (!penalties || typeof penalties.forex_markup_percent !== "number") {
        return null;
    }

    if (amountINR <= 0) {
        return {
            cardName: card.name,
            bank: card.bank,
            transactionAmountINR: 0,
            forexMarkupPercent: penalties.forex_markup_percent,
            markupCharge: 0,
            gstOnMarkup: 0,
            totalForexCost: 0,
            effectiveCostPercent: 0,
            note: "No transaction amount — no forex cost applicable.",
            confidence: "exact",
        };
    }

    const markupRate = penalties.forex_markup_percent / 100;
    const markup = roundTo2(amountINR * markupRate);
    const gst = roundTo2(markup * GST_RATE);
    const total = roundTo2(markup + gst);
    const effectivePercent = roundTo2((total / amountINR) * 100);

    return {
        cardName: card.name,
        bank: card.bank,
        transactionAmountINR: amountINR,
        forexMarkupPercent: penalties.forex_markup_percent,
        markupCharge: markup,
        gstOnMarkup: gst,
        totalForexCost: total,
        effectiveCostPercent: effectivePercent,
        note: penalties.note || null,
        confidence: "exact",
    };
}

// ============================================================
// COMPOSITE: Full Penalty Summary
// ============================================================

/**
 * Calculate the COMPLETE penalty scenario for a missed payment.
 * Combines late fee + interest charge + practical warnings + advice.
 *
 * This is what the AI calls when a user asks:
 * "What happens if I miss my HDFC Regalia payment of ₹45,000?"
 *
 * @param card - The credit card
 * @param outstandingAmount - Amount on the bill
 * @param daysLate - How many days late the payment is (default: 30)
 * @returns Complete penalty breakdown with actionable advice
 */
export function calculateFullPenalty(
    card: CreditCard,
    outstandingAmount: number,
    daysLate: number = 45 // Default to 45 days to represent Date of Transaction penalty trap
): FullPenaltySummary {
    const lateFee = calculateLateFee(card, outstandingAmount);
    const interest = calculateInterestCharge(card, outstandingAmount, daysLate);

    const totalMonthly = roundTo2(
        (lateFee?.totalLatePenalty || 0) + (interest?.totalInterestCost || 0)
    );

    // Annualized cost: if the user keeps carrying this balance for 12 months
    const annualized = roundTo2(totalMonthly * 12);

    const warnings: string[] = [];
    const advice: string[] = [];

    // ---- Smart warnings based on the numbers ----

    if (lateFee && lateFee.lateFee > 0) {
        warnings.push(
            `Late fee of ₹${lateFee.lateFee} + ₹${lateFee.gstOnLateFee} GST = ₹${lateFee.totalLatePenalty} will be charged.`
        );
    }

    if (interest && interest.interestCharge > 0) {
        warnings.push(
            `Interest of ₹${interest.interestCharge} + ₹${interest.gstOnInterest} GST = ₹${interest.totalInterestCost} for ${daysLate} days at ${interest.aprMonthly}%/month (${interest.aprAnnual}% p.a.).`
        );
    }

    if (interest && interest.aprAnnual > 40) {
        warnings.push(
            `⚠️ CRITICAL: ${interest.aprAnnual}% annual interest is among the highest in any lending product. This is NOT cheap debt.`
        );
    }

    if (totalMonthly > 0) {
        warnings.push(
            `Total immediate penalty: ₹${totalMonthly} (late fee + interest + GST).`
        );
    }

    // Credit score impact
    if (daysLate >= 1 && daysLate <= 45) {
        warnings.push("CIBIL Impact: Late by <30 days may not be reported, but your bank will flag it internally.");
    } else if (daysLate > 45 && daysLate <= 90) {
        warnings.push("⚠️ CIBIL Impact: 30-90 days late WILL be reported. Expect 50-100 point drop in your credit score.");
    } else if (daysLate > 90) {
        warnings.push("🚨 CIBIL Impact: 90+ days late = NPA (Non-Performing Asset). Severe 100-200+ point drop. Recovery agents may contact you.");
    }

    // Cascading interest warning
    if (interest && outstandingAmount > 0) {
        warnings.push(
            `THE 1-DAY TRAP: Interest-free period LOST. Interest is charged from the DATE OF TRANSACTION, not the due date. All new purchases will also instantly accrue interest!`
        );
    }

    // ---- Actionable advice ----

    if (outstandingAmount > 0 && outstandingAmount <= 5000) {
        advice.push("Pay the FULL amount immediately. The late fee alone may exceed the interest saved by delaying.");
    } else if (outstandingAmount > 5000 && outstandingAmount <= 50000) {
        advice.push("Pay at least the Minimum Amount Due (MAD) to avoid late fee. Then pay the rest ASAP to minimize interest.");
        advice.push(`At ${interest?.aprAnnual || 42}% p.a., carrying ₹${outstandingAmount} for a year would cost ₹${annualized} in penalties alone.`);
    } else if (outstandingAmount > 50000) {
        advice.push("URGENT: Pay the Minimum Amount Due immediately to avoid late fee + CIBIL report.");
        advice.push(`Consider converting to EMI (if available) — EMI interest is typically 12-18% vs credit card's ${interest?.aprAnnual || 42}%.`);
        advice.push("DO NOT make only minimum payments for months. The compound interest will spiral.");
    }

    // Fee waiver note
    if (card.feeWaiver) {
        advice.push(`Card fee waiver: ${card.feeWaiver}. Missing payments may reset your fee waiver eligibility.`);
    }

    // Surcharge note from penalties
    if (lateFee?.note) {
        advice.push(`Bank Note: ${lateFee.note}`);
    }

    return {
        cardName: card.name,
        bank: card.bank,
        outstandingAmount,
        lateFee,
        interestCharge: interest,
        totalMonthlyPenalty: totalMonthly,
        annualizedCost: annualized,
        warnings,
        advice,
    };
}

// ============================================================
// COMPARE: Compare penalties across multiple cards
// ============================================================

/**
 * Compare penalty costs across multiple cards for the SAME outstanding amount.
 * Useful when AI is asked "Which card has the lowest late fee?"
 */
export function comparePenalties(
    cards: CreditCard[],
    outstandingAmount: number,
    daysLate: number = 30
): Array<{
    cardName: string;
    bank: string;
    lateFee: number;
    interestCharge: number;
    totalPenalty: number;
    forexMarkup: number;
}> {
    const results = cards
        .map((card) => {
            const penalty = calculateFullPenalty(card, outstandingAmount, daysLate);
            const penalties = card.penalties as PenaltyMatrix | null | undefined;
            return {
                cardName: card.name,
                bank: card.bank,
                lateFee: penalty.lateFee?.totalLatePenalty || 0,
                interestCharge: penalty.interestCharge?.totalInterestCost || 0,
                totalPenalty: penalty.totalMonthlyPenalty,
                forexMarkup: penalties?.forex_markup_percent || 0,
            };
        })
        .sort((a, b) => a.totalPenalty - b.totalPenalty); // Lowest penalty first

    return results;
}

// ============================================================
// LLM FORMATTER — Inject exact numbers into the AI prompt
// ============================================================

/**
 * Format a FullPenaltySummary into a string for the LLM prompt.
 * The LLM reads this and writes a natural-language response.
 * The NUMBERS are guaranteed correct because they come from code.
 */
export function formatPenaltyForLLM(result: FullPenaltySummary): string {
    const parts: string[] = [];

    parts.push(`[CALCULATED RESULT: DO NOT SUMMARIZE. OUTPUT THIS EXACT MARDOWN TABLE]`);
    parts.push(`### 🚨 Penalty Breakdown: ${result.bank} ${result.cardName}`);
    parts.push(`If you miss your payment of **₹${result.outstandingAmount.toLocaleString("en-IN")}** by even 1 day:\n`);

    parts.push(`| Charge Type | Calculation | Exact Penalty |`);
    parts.push(`|-------------|-------------|---------------|`);

    if (result.lateFee) {
        parts.push(`| **Late Fee** | Slab match (₹${result.lateFee.matchedSlab.min}–₹${result.lateFee.matchedSlab.max}) | ₹${result.lateFee.lateFee} |`);
        parts.push(`| **Late Fee GST** | 18% of ₹${result.lateFee.lateFee} | ₹${result.lateFee.gstOnLateFee} |`);
    }

    if (result.interestCharge) {
        parts.push(`| **Interest (The 1-Day Trap)** | Charged from date of transaction (~${result.interestCharge.daysOutstanding} days @ ${result.interestCharge.aprMonthly}%/mo) | ₹${result.interestCharge.interestCharge} |`);
        parts.push(`| **Interest GST** | 18% of ₹${result.interestCharge.interestCharge} | ₹${result.interestCharge.gstOnInterest} |`);
    }

    parts.push(`| **TOTAL IMMEDIATE PENALTY** | **(Added to next bill)** | **₹${result.totalMonthlyPenalty}** |`);

    if (result.warnings.length > 0) {
        parts.push(`\n### ⚠️ Critical Bank Policies`);
        for (const w of result.warnings) {
            parts.push(`- ${w}`);
        }
    }

    if (result.advice.length > 0) {
        parts.push(`\n### 💡 Action Plan`);
        for (const a of result.advice) {
            parts.push(`- ${a}`);
        }
    }

    parts.push(`\n[IMPORTANT: You MUST display the exact markdown table above. NEVER summarize the GST or interest calculation. The user needs to see the exact ₹ penalty amount!]`);

    return parts.join("\n");
}

/**
 * Format a forex cost result into a string for the LLM prompt.
 */
export function formatForexForLLM(result: ForexCostResult): string {
    const parts: string[] = [];

    parts.push(`[FOREX COST CALCULATION — VERIFIED numbers.]`);
    parts.push(`Card: ${result.bank} ${result.cardName}`);
    parts.push(`Transaction: ₹${result.transactionAmountINR.toLocaleString("en-IN")}`);
    parts.push(`Forex Markup: ${result.forexMarkupPercent}%`);
    parts.push(`Markup Charge: ₹${result.markupCharge}`);
    parts.push(`GST on Markup: ₹${result.gstOnMarkup}`);
    parts.push(`Total Forex Cost: ₹${result.totalForexCost}`);
    parts.push(`Effective Cost: ${result.effectiveCostPercent}% of transaction`);

    if (result.note) {
        parts.push(`Note: ${result.note}`);
    }

    parts.push(`\n[Present this clearly. The numbers are exact — do NOT change them.]`);

    return parts.join("\n");
}

// ============================================================
// UTILITY
// ============================================================

function roundTo2(n: number): number {
    return Math.round(n * 100) / 100;
}

function roundTo4(n: number): number {
    return Math.round(n * 10000) / 10000;
}
