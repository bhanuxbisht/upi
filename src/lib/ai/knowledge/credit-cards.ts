/**
 * PayWise Knowledge Engine — Indian Credit Card Intelligence
 * 
 * This is our MOAT. Deep, structured knowledge about every major Indian
 * credit card's reward structure, so the AI can give specific, actionable
 * advice instead of generic "use a credit card" suggestions.
 * 
 * Data sources: Bank websites, card comparison sites, community forums
 * Last updated: March 2026
 * 
 * UPDATE STRATEGY: This data should be refreshed monthly. In production,
 * move to Supabase table with admin CRUD and community verification.
 */

export interface CreditCardReward {
    category: string;
    rewardRate: number; // percentage cashback or points value
    rewardType: "cashback" | "points" | "miles";
    pointsPerRupee?: number;
    pointValue?: number; // ₹ value per point
    cap?: number; // monthly/quarterly cap in ₹
    minSpend?: number;
    notes?: string;
}

export interface CreditCard {
    id: string;
    bank: string;
    name: string;
    annualFee: number;
    feeWaiver?: string; // e.g., "Waived on ₹2L annual spend"
    joiningFee: number;
    network: "Visa" | "Mastercard" | "RuPay" | "Amex" | "Diners";
    tier: "entry" | "mid" | "premium" | "super-premium";
    rewards: CreditCardReward[];
    rewardMath?: RewardMath | null; // Deterministic calculator rules from DB
    penalties?: PenaltyMatrix | null; // Deterministic penalty/charge rules from DB
    loungeAccess?: string;
    fuelSurchargeWaiver: boolean;
    bestFor: string[]; // categories where this card shines
    affiliateLink?: string; // REVENUE: affiliate application link
    affiliatePayout?: number; // ₹ we earn per successful application
    incomeRequirement?: string;
    pros: string[];
    cons: string[];
}

// Strict deterministic math engine types — used by payment-calculator.ts
export interface RewardMathCategory {
    keywords: string[];
    rate: number;
    cashback_rate?: number; // For mixed type cards (e.g. Titan)
    max_cap_points_monthly?: number;
    max_cap_points_yearly?: number;
}

export interface RewardMath {
    type: "cashback" | "points" | "mixed";
    point_value_rupees?: number;  // ₹ per point (e.g. 0.25 for SBI points, 1.0 for IRCTC)
    spend_divisor?: number;       // How much spend = 1 point (usually 100)
    default_rate: number;         // Default multiplier or % for unmatched categories
    categories: RewardMathCategory[];
    exclusions?: string[];        // Categories that earn NOTHING
}

// ============================================================
// PENALTY MATRIX — Deterministic penalty/charge calculator types
// Used by penalty-calculator.ts to compute exact ₹ amounts
// ============================================================

/** A single late fee slab — if outstanding is between min and max, apply this fee */
export interface LateFeeSlab {
    min: number;   // Minimum outstanding amount (inclusive)
    max: number;   // Maximum outstanding amount (inclusive)
    fee: number;   // Exact ₹ penalty for this slab
}

/**
 * Complete penalty matrix for a credit card.
 * Stored as JSONB in the `penalties` column of knowledge_credit_cards.
 * Every field is machine-readable — no AI interpretation needed.
 */
export interface PenaltyMatrix {
    apr_monthly: number;                // Monthly interest rate (e.g., 3.75 = 3.75%)
    interest_free_period_days: number;  // Days before interest kicks in (typically 20-50)
    forex_markup_percent: number;       // Forex markup on international transactions
    late_fees: LateFeeSlab[];           // Ordered slabs from lowest to highest outstanding
    note?: string;                      // Bank-specific surcharge policies, edge cases
}
