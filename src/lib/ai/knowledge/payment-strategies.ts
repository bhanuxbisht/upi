/**
 * PayWise Knowledge Engine — Payment Optimization Strategies
 * 
 * This is the BRAIN of PayWise. Deep knowledge about how to actually
 * save money on payments — not generic "use cashback" advice, but
 * specific, actionable strategies that work in India right now.
 * 
 * This knowledge is what makes people COME BACK to PayWise.
 */

export interface Strategy {
    id: string;
    title: string;
    category: string;
    difficulty: "easy" | "medium" | "advanced";
    monthlySavingsPotential: { min: number; max: number };
    steps: string[];
    requirements?: string[];
    warnings?: string[];
    applicableTo: string[]; // user segments
}

/**
 * Offer Stacking — The core differentiator
 * Most people don't know you can combine multiple discounts
 */
export const OFFER_STACKING_STRATEGIES: Strategy[] = [
    {
        id: "food-stack",
        title: "Food Delivery Triple Stack",
        category: "food-delivery",
        difficulty: "easy",
        monthlySavingsPotential: { min: 500, max: 2000 },
        steps: [
            "Step 1: Open Swiggy/Zomato and add items to cart",
            "Step 2: Apply merchant promo code (SWIGGY50, ZOMFIRST, etc.)",
            "Step 3: Go to PhonePe Switch instead of paying directly",
            "Step 4: Pay via PhonePe using HDFC Swiggy card or SBI Cashback card",
            "Result: Merchant discount (₹50-100) + PhonePe coupon (₹50) + Credit card cashback (5-10%) = ₹150-300 saved on a single order"
        ],
        requirements: ["PhonePe installed", "Credit card with food/online rewards"],
        warnings: ["PhonePe Switch coupons reset monthly — use within first week"],
        applicableTo: ["swiggy-users", "zomato-users", "food-lovers"],
    },
    {
        id: "amazon-stack",
        title: "Amazon Shopping Mega Stack",
        category: "shopping",
        difficulty: "medium",
        monthlySavingsPotential: { min: 1000, max: 5000 },
        steps: [
            "Step 1: Load Amazon Pay balance using ICICI Amazon Pay credit card (instant 5% reward)",
            "Step 2: Check Amazon Pay offers section for extra cashback (often 10% up to ₹200)",
            "Step 3: Apply product coupon if available (check coupon section on product page)",
            "Step 4: Use Subscribe & Save for recurring items (extra 5-10% off)",
            "Step 5: Pay using Amazon Pay balance (loaded with ICICI card rewards)",
            "Result: Card rewards (5%) + Amazon Pay cashback (10%) + Coupons (variable) + Subscribe discount (5-10%) = 15-25% total savings"
        ],
        requirements: ["Amazon Prime membership", "ICICI Amazon Pay credit card"],
        warnings: ["Card cashback is in Amazon Pay balance, not bank credit"],
        applicableTo: ["amazon-shoppers", "prime-members"],
    },
    {
        id: "bill-stack",
        title: "Monthly Bills Optimization Stack",
        category: "bills-recharges",
        difficulty: "easy",
        monthlySavingsPotential: { min: 200, max: 800 },
        steps: [
            "Step 1: Pay electricity bill via Google Pay (50% chance of ₹50-500 scratch card)",
            "Step 2: Pay mobile recharge via PhonePe (40% chance of ₹10-100 scratch card)",
            "Step 3: Pay broadband via Amazon Pay (₹50 cashback on ₹100+ bills)",
            "Step 4: Pay credit card bill via CRED (earn CRED coins worth ₹50-200)",
            "Step 5: If you have Axis ACE card linked to GPay, you also get 5% cashback on bill payments",
            "Result: Scatter your bills across apps for maximum reward probability"
        ],
        requirements: ["Multiple UPI apps installed"],
        applicableTo: ["everyone"],
    },
    {
        id: "movie-stack",
        title: "Movie Night Savings",
        category: "entertainment",
        difficulty: "easy",
        monthlySavingsPotential: { min: 300, max: 600 },
        steps: [
            "Step 1: Book movie tickets via Paytm (₹150 off per booking)",
            "Step 2: If ICICI Emeralde holder, use Buy 1 Get 1 on BookMyShow instead (save up to ₹300)",
            "Step 3: Book snacks combo via the app (usually 20-30% cheaper than counter)",
            "Step 4: Pay via credit card with entertainment rewards (SBI SimplySAVE: 2.5%)",
            "Result: ₹150-300 saved per movie outing"
        ],
        applicableTo: ["movie-goers"],
    },
    {
        id: "rent-stack",
        title: "Rent Payment Credit Card Arbitrage",
        category: "rent",
        difficulty: "advanced",
        monthlySavingsPotential: { min: 200, max: 2000 },
        steps: [
            "Step 1: Pay rent via CRED RentPay using a reward credit card",
            "Step 2: CRED charges 1.5% processing fee on rent payment",
            "Step 3: If your card gives 2%+ rewards (HDFC Infinia 3.3%, SBI Cashback 5% online), you're net positive",
            "Step 4: Example: ₹25,000 rent → 1.5% fee = ₹375 cost, but 3.3% reward = ₹825 back. Net gain: ₹450",
            "Step 5: Plus you earn CRED coins worth ₹100-200 on the transaction",
            "Result: Turn rent from a dead expense into a reward-earning opportunity"
        ],
        requirements: ["Credit card with 2%+ reward rate", "CRED account"],
        warnings: [
            "ONLY profitable if card reward rate exceeds 1.5% — do the math first!",
            "Counts against your credit limit — ensure you have enough",
            "Always pay the credit card bill in full to avoid interest (which would destroy any benefit)"
        ],
        applicableTo: ["renters", "high-reward-card-holders"],
    },
    {
        id: "grocery-stack",
        title: "Grocery Savings System",
        category: "groceries",
        difficulty: "easy",
        monthlySavingsPotential: { min: 500, max: 1500 },
        steps: [
            "Step 1: Check PhonePe Switch for BigBasket/Blinkit coupons (₹75-100 off)",
            "Step 2: Compare prices between BigBasket, Blinkit, and Zepto (can vary 10-20%)",
            "Step 3: Use HDFC Millennia for 2.5% cashback on online grocery apps",
            "Step 4: For monthly staples, use Subscribe & Save on Amazon Fresh (5-10% extra off)",
            "Step 5: Time big purchases with sale events (BigBasket: Big Sale monthly, Amazon Fresh: Thursday deals)",
            "Result: ₹500-1500 saved on monthly grocery bill of ₹5000-10000"
        ],
        applicableTo: ["everyone"],
    },
    {
        id: "travel-stack",
        title: "Travel Booking Super Stack",
        category: "travel",
        difficulty: "medium",
        monthlySavingsPotential: { min: 1000, max: 10000 },
        steps: [
            "Step 1: Compare flight prices on Google Flights first (sets baseline)",
            "Step 2: Book via MakeMyTrip in Google Pay app (exclusive ₹500 off flights)",
            "Step 3: Pay with HDFC Regalia credit card (4x points on travel = 2.5-3.3% back)",
            "Step 4: For hotels, check HDFC SmartBuy portal (10x points = 6.6% back on HDFC cards)",
            "Step 5: Use MMT rewards points from previous bookings",
            "Result: Flight discount (₹500) + Card rewards (3.3%) + SmartBuy multiplier = ₹1000-3000 per trip"
        ],
        requirements: ["HDFC travel card", "Google Pay"],
        applicableTo: ["travelers", "frequent-flyers"],
    },
];

/**
 * Monthly savings routines — the "set it and forget it" approach
 */
export const MONTHLY_ROUTINES: Array<{
    week: number;
    tasks: Array<{ action: string; platform: string; estimatedSaving: number }>;
}> = [
    {
        week: 1,
        tasks: [
            { action: "Pay credit card bill via CRED", platform: "CRED", estimatedSaving: 100 },
            { action: "Mobile recharge via PhonePe", platform: "PhonePe", estimatedSaving: 30 },
            { action: "Check PhonePe Switch for food delivery coupons", platform: "PhonePe", estimatedSaving: 75 },
        ],
    },
    {
        week: 2,
        tasks: [
            { action: "Pay electricity bill via Google Pay", platform: "Google Pay", estimatedSaving: 50 },
            { action: "Broadband bill via Amazon Pay", platform: "Amazon Pay", estimatedSaving: 50 },
            { action: "Check CRED Mint for flash deal vouchers", platform: "CRED", estimatedSaving: 100 },
        ],
    },
    {
        week: 3,
        tasks: [
            { action: "Order groceries via PhonePe Switch (BigBasket coupon)", platform: "PhonePe", estimatedSaving: 75 },
            { action: "Redeem GPay scratch cards if accumulated", platform: "Google Pay", estimatedSaving: 50 },
        ],
    },
    {
        week: 4,
        tasks: [
            { action: "Review subscriptions — cancel unused ones", platform: "PayWise", estimatedSaving: 200 },
            { action: "Check if any saved offers are expiring", platform: "PayWise", estimatedSaving: 100 },
            { action: "Review monthly spending vs budget", platform: "PayWise", estimatedSaving: 0 },
        ],
    },
];

/**
 * Subscription optimization knowledge
 */
export const SUBSCRIPTION_OPTIMIZATION = {
    streamingBundles: [
        {
            bundle: "Paytm First (₹299/year)",
            includes: ["Zee5", "Sony LIV", "Paytm benefits"],
            savings: "₹2000+ vs buying separately",
            recommendation: "Best if you watch Hindi content on 2+ platforms",
        },
        {
            bundle: "Vi Movies & TV (with Vi plan)",
            includes: ["Disney+ Hotstar Mobile", "Amazon Prime Video Mobile", "SunNXT"],
            savings: "₹1500+/year included in recharge",
            recommendation: "If you're a Vi subscriber, you probably don't need separate subscriptions",
        },
        {
            bundle: "Airtel Xstream (₹149/month plan)",
            includes: ["Disney+ Hotstar", "Amazon Prime Video Mobile", "SunNXT", "ErosNow"],
            savings: "₹3000+/year included in recharge",
            recommendation: "Airtel's ₹299+ plans include massive entertainment bundles",
        },
        {
            bundle: "Jio (₹349/month plan)",
            includes: ["JioCinema Premium", "Netflix Mobile", "Amazon Prime Lite"],
            savings: "₹2500+/year included in recharge",
            recommendation: "Jio's higher-tier plans include Netflix and Prime at no extra cost",
        },
    ],
    commonWaste: [
        "Paying for Netflix separately when Jio ₹349 plan includes it",
        "Paying for Disney+ Hotstar when it's included in Airtel/Vi plan",
        "Having both Amazon Prime and Flipkart Plus (one is usually enough)",
        "Paying for cloud storage on both Google and iCloud (consolidate to one)",
        "Annual gym membership unused after Feb (switch to monthly or pay-per-visit)",
    ],
    tips: [
        "Always check if your mobile recharge plan includes OTT subscriptions before buying separately",
        "Family plans: Netflix, YouTube Premium, Spotify — split with family to save 50-75%",
        "Annual plans are 20-40% cheaper than monthly — commit if you'll use for 6+ months",
        "Student plans: Spotify, Apple Music, YouTube Premium offer 50% student discounts",
        "Credit card statements often show forgotten subscriptions — review quarterly",
    ],
};

/**
 * Tax-relevant payment knowledge (India-specific)
 */
export const TAX_PAYMENT_TIPS = [
    "Section 80C: Pay LIC premiums, PPF, ELSS via UPI — same tax benefit, earn cashback too",
    "Section 80D: Health insurance premiums paid via credit card earn card rewards + tax deduction",
    "NPS: Invest via PhonePe/GPay for extra ₹50k deduction under 80CCD(1B) + earn scratch cards",
    "Education loan interest: Section 80E — no limit. Pay EMI via card for rewards if bank allows",
    "Rent receipts: If paying via CRED RentPay, you get automatic digital receipt for HRA claiming",
    "Home loan: Never pay via credit card (banks don't allow), but use UPI for EMI to earn scratch cards where enabled",
    "Advance tax: Pay via income tax portal — some cards give tax payment rewards (HDFC: 2 RP/₹150)",
];

/**
 * Category-specific saving potential calculator
 */
export function estimateMonthlySavings(
    monthlySpending: Record<string, number>,
    hasRewardCard: boolean,
    usesMultipleApps: boolean
): {
    totalPotentialSavings: number;
    breakdown: Array<{ category: string; spending: number; potentialSaving: number; method: string }>;
    topTip: string;
} {
    const breakdown: Array<{ category: string; spending: number; potentialSaving: number; method: string }> = [];
    let total = 0;

    const savingRates: Record<string, { rate: number; method: string }> = {
        "food-delivery": { rate: hasRewardCard ? 0.15 : 0.08, method: "PhonePe Switch coupon + Card cashback + Promo code" },
        "groceries": { rate: hasRewardCard ? 0.10 : 0.05, method: "PhonePe Switch + Compare prices + Card cashback" },
        "shopping": { rate: hasRewardCard ? 0.08 : 0.03, method: "Amazon stack / Flipkart Axis + Sale timing" },
        "bills-recharges": { rate: usesMultipleApps ? 0.05 : 0.02, method: "Split bills across GPay, PhonePe, Amazon for scratch cards" },
        "travel": { rate: hasRewardCard ? 0.12 : 0.05, method: "HDFC SmartBuy + GPay MakeMyTrip + Card rewards" },
        "entertainment": { rate: 0.20, method: "Paytm movie discount + card rewards" },
        "fuel": { rate: hasRewardCard ? 0.025 : 0.01, method: "Fuel surcharge waiver + card rewards" },
        "rent": { rate: hasRewardCard ? 0.02 : 0, method: "CRED RentPay + high-reward card arbitrage" },
    };

    for (const [category, spending] of Object.entries(monthlySpending)) {
        const rateInfo = savingRates[category] || { rate: 0.02, method: "General UPI cashback" };
        const saving = Math.round(spending * rateInfo.rate);
        breakdown.push({ category, spending, potentialSaving: saving, method: rateInfo.method });
        total += saving;
    }

    breakdown.sort((a, b) => b.potentialSaving - a.potentialSaving);

    const topCategory = breakdown[0];
    const topTip = topCategory
        ? `Your biggest savings opportunity is in ${topCategory.category}: ₹${topCategory.potentialSaving}/month via ${topCategory.method}`
        : "Start tracking your spending to unlock personalized savings!";

    return { totalPotentialSavings: total, breakdown, topTip };
}

/**
 * Get contextual strategy based on user's question intent
 */
export function getRelevantStrategies(
    intent: "food" | "shopping" | "bills" | "travel" | "entertainment" | "rent" | "groceries" | "general",
    userApps: string[] = [],
    userCards: string[] = []
): Strategy[] {
    const categoryMap: Record<string, string[]> = {
        food: ["food-delivery"],
        shopping: ["shopping"],
        bills: ["bills-recharges"],
        travel: ["travel"],
        entertainment: ["entertainment"],
        rent: ["rent"],
        groceries: ["groceries"],
        general: ["food-delivery", "shopping", "bills-recharges", "groceries"],
    };

    const targetCategories = categoryMap[intent] || ["food-delivery", "shopping", "bills-recharges"];

    return OFFER_STACKING_STRATEGIES.filter((s) =>
        targetCategories.includes(s.category)
    );
}
