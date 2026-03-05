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
    loungeAccess?: string;
    fuelSurchargeWaiver: boolean;
    bestFor: string[]; // categories where this card shines
    affiliateLink?: string; // REVENUE: affiliate application link
    affiliatePayout?: number; // ₹ we earn per successful application
    incomeRequirement?: string;
    pros: string[];
    cons: string[];
}

/**
 * Comprehensive Indian Credit Card Database
 * This is what makes our AI actually USEFUL vs just ChatGPT
 */
export const CREDIT_CARDS: CreditCard[] = [
    // =====================================================
    // HDFC BANK CARDS
    // =====================================================
    {
        id: "hdfc-regalia",
        bank: "HDFC",
        name: "Regalia",
        annualFee: 2500,
        feeWaiver: "Waived on ₹3L annual spend",
        joiningFee: 2500,
        network: "Visa",
        tier: "premium",
        rewards: [
            { category: "travel", rewardRate: 5, rewardType: "points", pointsPerRupee: 4, pointValue: 0.50, notes: "4 points/₹150 on travel portals" },
            { category: "dining", rewardRate: 5, rewardType: "points", pointsPerRupee: 4, pointValue: 0.50, notes: "4 points/₹150 on dining" },
            { category: "general", rewardRate: 1.3, rewardType: "points", pointsPerRupee: 4, pointValue: 0.33, notes: "4 points/₹150, ₹0.33/point general" },
            { category: "international", rewardRate: 2.0, rewardType: "points", notes: "2% forex markup but good reward rate" },
        ],
        loungeAccess: "12 domestic + 6 international/year via Priority Pass",
        fuelSurchargeWaiver: true,
        bestFor: ["travel", "dining", "lounge-access"],
        incomeRequirement: "₹12L+ annual",
        pros: [
            "Excellent travel and dining rewards",
            "Complimentary lounge access worldwide",
            "Easy to get fee waiver with regular spending",
            "Strong reward redemption options via SmartBuy"
        ],
        cons: [
            "Poor reward rate on groceries and utility",
            "Points expire in 2 years",
            "Forex markup of 2%"
        ],
        affiliateLink: "", // TODO: Add after partnership
        affiliatePayout: 1500,
    },
    {
        id: "hdfc-millennia",
        bank: "HDFC",
        name: "Millennia",
        annualFee: 1000,
        feeWaiver: "Waived on ₹1L annual spend",
        joiningFee: 1000,
        network: "Visa",
        tier: "mid",
        rewards: [
            { category: "online-shopping", rewardRate: 2.5, rewardType: "cashback", cap: 750, notes: "2.5% on Amazon, Flipkart, Myntra, Swiggy, etc." },
            { category: "offline", rewardRate: 1.0, rewardType: "cashback", cap: 750, notes: "1% on offline/POS transactions" },
            { category: "upi", rewardRate: 1.0, rewardType: "cashback", cap: 500, notes: "1% on UPI via HDFC card linked to PhonePe/GPay" },
            { category: "general", rewardRate: 0.5, rewardType: "cashback" },
        ],
        fuelSurchargeWaiver: true,
        bestFor: ["online-shopping", "millennials", "upi-linked"],
        incomeRequirement: "₹4L+ annual",
        pros: [
            "Best entry card for online shopping cashback",
            "UPI rewards when linked via PhonePe/GPay",
            "Easy fee waiver at ₹1L",
            "Good for Swiggy/Zomato/BigBasket users"
        ],
        cons: [
            "Monthly cashback cap of ₹750 online",
            "No lounge access",
            "Cashback credited as points, not direct"
        ],
        affiliatePayout: 800,
    },
    {
        id: "hdfc-infinia",
        bank: "HDFC",
        name: "Infinia",
        annualFee: 12500,
        joiningFee: 12500,
        network: "Visa",
        tier: "super-premium",
        rewards: [
            { category: "travel", rewardRate: 3.3, rewardType: "points", pointsPerRupee: 5, pointValue: 1.0, notes: "5 points/₹150, each point = ₹1 via SmartBuy" },
            { category: "dining", rewardRate: 3.3, rewardType: "points", pointsPerRupee: 5, pointValue: 1.0 },
            { category: "general", rewardRate: 3.3, rewardType: "points", pointsPerRupee: 5, pointValue: 1.0, notes: "Best flat reward rate in India" },
            { category: "international", rewardRate: 3.3, rewardType: "points", notes: "3.3% reward rate, 2% forex markup" },
        ],
        loungeAccess: "Unlimited domestic + international via Priority Pass for 2 members",
        fuelSurchargeWaiver: true,
        bestFor: ["everything", "high-spenders", "travel", "lounge-access"],
        incomeRequirement: "₹30L+ or invite only",
        pros: [
            "Best overall reward rate in India (3.3% flat)",
            "Unlimited lounge access for cardholder + guest",
            "Points never expire when redeemed via SmartBuy",
            "Golf privileges, concierge service"
        ],
        cons: [
            "Very hard to get — mostly invite only",
            "₹12,500 annual fee with no waiver",
            "Requires very high income"
        ],
        affiliatePayout: 3000,
    },
    {
        id: "hdfc-swiggy",
        bank: "HDFC",
        name: "Swiggy HDFC",
        annualFee: 500,
        feeWaiver: "Waived on ₹2L annual spend",
        joiningFee: 500,
        network: "Visa",
        tier: "mid",
        rewards: [
            { category: "food-delivery", rewardRate: 10, rewardType: "cashback", cap: 1500, notes: "10% cashback on Swiggy (food + Instamart)" },
            { category: "dining", rewardRate: 5, rewardType: "cashback", cap: 500, notes: "5% on dining at restaurants" },
            { category: "online-shopping", rewardRate: 1.5, rewardType: "cashback" },
            { category: "general", rewardRate: 1, rewardType: "cashback" },
        ],
        fuelSurchargeWaiver: true,
        bestFor: ["food-delivery", "swiggy-users", "dining"],
        incomeRequirement: "₹3L+ annual",
        pros: [
            "10% on Swiggy is insane for regular users",
            "5% on all dining restaurants",
            "Very low fee, easy to waive",
        ],
        cons: [
            "Cashback cap of ₹1500/month on Swiggy",
            "Only useful if Swiggy is your primary food app",
        ],
        affiliatePayout: 600,
    },
    // =====================================================
    // SBI CARDS
    // =====================================================
    {
        id: "sbi-cashback",
        bank: "SBI",
        name: "Cashback",
        annualFee: 999,
        feeWaiver: "Waived on ₹2L annual spend",
        joiningFee: 999,
        network: "Visa",
        tier: "mid",
        rewards: [
            { category: "online-shopping", rewardRate: 5, rewardType: "cashback", cap: 5000, notes: "5% cashback on ALL online spends" },
            { category: "offline", rewardRate: 1, rewardType: "cashback", notes: "1% on offline spends" },
        ],
        fuelSurchargeWaiver: true,
        bestFor: ["online-shopping", "e-commerce", "subscriptions"],
        incomeRequirement: "₹5L+ annual",
        pros: [
            "Flat 5% on ALL online — best for Amazon, Flipkart, Netflix, etc.",
            "₹5000/month cap is generous",
            "Works on subscriptions (Netflix, Spotify, etc.)",
        ],
        cons: [
            "Only 1% offline — carry another card for restaurants",
            "No lounge access",
        ],
        affiliatePayout: 1000,
    },
    {
        id: "sbi-simplysave",
        bank: "SBI",
        name: "SimplySAVE",
        annualFee: 499,
        feeWaiver: "Waived on ₹1L annual spend",
        joiningFee: 499,
        network: "Visa",
        tier: "entry",
        rewards: [
            { category: "dining", rewardRate: 5, rewardType: "points", pointsPerRupee: 10, pointValue: 0.25, notes: "10 points/₹100 on dining" },
            { category: "groceries", rewardRate: 5, rewardType: "points", pointsPerRupee: 10, pointValue: 0.25, notes: "10 points/₹100 on groceries" },
            { category: "entertainment", rewardRate: 5, rewardType: "points", pointsPerRupee: 10, pointValue: 0.25, notes: "Movies, OTT, etc." },
            { category: "general", rewardRate: 1, rewardType: "points", pointsPerRupee: 2, pointValue: 0.25 },
        ],
        fuelSurchargeWaiver: true,
        bestFor: ["dining", "groceries", "entertainment", "budget-card"],
        incomeRequirement: "₹3L+ annual",
        pros: [
            "Great for everyday categories — food, groceries, movies",
            "Very low fee, easy entry",
        ],
        cons: [
            "Points redemption value can be poor",
            "Not great for online shopping",
        ],
        affiliatePayout: 500,
    },
    // =====================================================
    // ICICI CARDS
    // =====================================================
    {
        id: "icici-amazon-pay",
        bank: "ICICI",
        name: "Amazon Pay ICICI",
        annualFee: 0,
        joiningFee: 0,
        network: "Visa",
        tier: "entry",
        rewards: [
            { category: "amazon", rewardRate: 5, rewardType: "cashback", notes: "5% on Amazon for Prime members, 3% without" },
            { category: "bill-payments", rewardRate: 2, rewardType: "cashback", notes: "2% on utility bills via Amazon" },
            { category: "general", rewardRate: 1, rewardType: "cashback", notes: "1% on everything else" },
        ],
        fuelSurchargeWaiver: true,
        bestFor: ["amazon", "prime-members", "no-fee"],
        incomeRequirement: "₹3L+ annual",
        pros: [
            "ZERO annual fee forever",
            "5% on Amazon is unbeatable for Prime members",
            "1% on everything else — good default card",
            "Instant approval if ICICI customer",
        ],
        cons: [
            "Cashback only in Amazon Pay balance",
            "No lounge access",
            "Poor offline rewards",
        ],
        affiliatePayout: 700,
    },
    {
        id: "icici-emeralde",
        bank: "ICICI",
        name: "Emeralde",
        annualFee: 12000,
        joiningFee: 12000,
        network: "Visa",
        tier: "super-premium",
        rewards: [
            { category: "travel", rewardRate: 3.5, rewardType: "points", notes: "7 points/₹100, each ₹0.50" },
            { category: "dining", rewardRate: 3.5, rewardType: "points" },
            { category: "general", rewardRate: 2, rewardType: "points", notes: "4 points/₹100" },
        ],
        loungeAccess: "Unlimited domestic + international (2 guests)",
        fuelSurchargeWaiver: true,
        bestFor: ["travel", "lounge-access", "premium-lifestyle"],
        incomeRequirement: "₹25L+ annual",
        pros: [
            "Unlimited lounge access worldwide",
            "Strong travel and dining rewards",
            "Buy 1 Get 1 on BookMyShow",
        ],
        cons: [
            "High annual fee with no waiver",
            "Points redemption can be tricky",
        ],
        affiliatePayout: 2500,
    },
    // =====================================================
    // AXIS BANK CARDS
    // =====================================================
    {
        id: "axis-flipkart",
        bank: "Axis",
        name: "Flipkart Axis Bank",
        annualFee: 500,
        feeWaiver: "Waived on ₹2L annual spend",
        joiningFee: 500,
        network: "Visa",
        tier: "mid",
        rewards: [
            { category: "flipkart", rewardRate: 5, rewardType: "cashback", notes: "5% unlimited on Flipkart, Myntra, Cleartrip" },
            { category: "online-shopping", rewardRate: 4, rewardType: "cashback", notes: "4% on preferred online partners" },
            { category: "general", rewardRate: 1.5, rewardType: "cashback", notes: "1.5% on everything else" },
        ],
        fuelSurchargeWaiver: true,
        bestFor: ["flipkart", "myntra", "online-shopping"],
        incomeRequirement: "₹3.5L+ annual",
        pros: [
            "5% UNLIMITED on Flipkart ecosystem",
            "1.5% on everything else is very solid",
            "Good for Myntra fashion shoppers",
        ],
        cons: [
            "Cashback in Flipkart vouchers",
            "No lounge access",
        ],
        affiliatePayout: 700,
    },
    {
        id: "axis-ace",
        bank: "Axis",
        name: "ACE",
        annualFee: 499,
        feeWaiver: "Waived on ₹2L annual spend",
        joiningFee: 499,
        network: "Visa",
        tier: "mid",
        rewards: [
            { category: "bill-payments", rewardRate: 5, rewardType: "cashback", cap: 500, notes: "5% via Google Pay" },
            { category: "online-shopping", rewardRate: 4, rewardType: "cashback", cap: 500, notes: "Swiggy, Zomato, Ola" },
            { category: "general", rewardRate: 2, rewardType: "cashback", notes: "2% on everything else via Google Pay" },
        ],
        fuelSurchargeWaiver: true,
        bestFor: ["bill-payments", "google-pay-users", "all-rounder"],
        incomeRequirement: "₹3L+ annual",
        pros: [
            "2% on everything when paid via Google Pay",
            "5% on bill payments is great for monthly bills",
            "Best card for Google Pay power users",
        ],
        cons: [
            "Needs Google Pay for best rewards",
            "Monthly caps on bonus categories",
        ],
        affiliatePayout: 600,
    },
    // =====================================================
    // AU BANK
    // =====================================================
    {
        id: "au-lit",
        bank: "AU Small Finance",
        name: "LIT",
        annualFee: 0,
        joiningFee: 0,
        network: "Visa",
        tier: "mid",
        rewards: [
            { category: "customizable", rewardRate: 3.5, rewardType: "cashback", notes: "Choose 3 categories for 3.5% each" },
            { category: "general", rewardRate: 0.25, rewardType: "cashback" },
        ],
        fuelSurchargeWaiver: true,
        bestFor: ["customizable-rewards", "no-fee", "specific-spending"],
        incomeRequirement: "₹2.5L+ annual",
        pros: [
            "Zero annual fee forever",
            "Choose YOUR 3 bonus categories (change monthly)",
            "Great for targeted spending",
        ],
        cons: [
            "AU Bank app/service can be inconsistent",
            "Low general reward rate",
        ],
        affiliatePayout: 500,
    },
    // =====================================================
    // ONECARD
    // =====================================================
    {
        id: "onecard-metal",
        bank: "OneCard (Federal/BOB)",
        name: "Metal Card",
        annualFee: 0,
        joiningFee: 0,
        network: "Visa",
        tier: "mid",
        rewards: [
            { category: "general", rewardRate: 1, rewardType: "cashback", notes: "5X points = ~1% on everything" },
            { category: "top-brand", rewardRate: 5, rewardType: "cashback", notes: "Up to 5% on select brand offers" },
        ],
        fuelSurchargeWaiver: true,
        bestFor: ["no-fee", "general-spending", "metal-card-aesthetic"],
        incomeRequirement: "₹3L+ annual",
        pros: [
            "Zero fee metal card — great feel",
            "No hidden charges",
            "Good app experience",
            "Instant approval for many",
        ],
        cons: [
            "1% base reward is mediocre",
            "Brand-specific offers change frequently",
        ],
        affiliatePayout: 600,
    },
];

/**
 * Find the best credit cards for a given spending category
 */
export function getBestCardsForCategory(
    category: string,
    count: number = 3
): Array<{ card: CreditCard; reward: CreditCardReward; effectiveRate: number }> {
    const results: Array<{ card: CreditCard; reward: CreditCardReward; effectiveRate: number }> = [];

    for (const card of CREDIT_CARDS) {
        // Find the best matching reward for this category
        let bestReward: CreditCardReward | null = null;
        let bestRate = 0;

        for (const reward of card.rewards) {
            const categoryMatch =
                reward.category === category ||
                reward.category === "general" ||
                (category === "food-delivery" && reward.category === "dining") ||
                (category === "online-shopping" && ["amazon", "flipkart"].includes(reward.category)) ||
                (category === "bills-recharges" && reward.category === "bill-payments");

            if (categoryMatch && reward.rewardRate > bestRate) {
                bestRate = reward.rewardRate;
                bestReward = reward;
            }
        }

        if (bestReward) {
            results.push({
                card,
                reward: bestReward,
                effectiveRate: bestRate,
            });
        }
    }

    return results
        .sort((a, b) => b.effectiveRate - a.effectiveRate)
        .slice(0, count);
}

/**
 * Find the best card for a specific merchant
 */
export function getBestCardForMerchant(
    merchantName: string,
    amount: number
): Array<{ card: CreditCard; savings: number; method: string }> {
    const merchant = merchantName.toLowerCase();
    const results: Array<{ card: CreditCard; savings: number; method: string }> = [];

    for (const card of CREDIT_CARDS) {
        let bestSavings = 0;
        let method = "";

        for (const reward of card.rewards) {
            let matches = false;
            let rate = reward.rewardRate;

            // Direct merchant match
            if (merchant.includes("swiggy") && (reward.category === "food-delivery" || reward.category === "dining")) {
                matches = true;
            } else if (merchant.includes("zomato") && (reward.category === "food-delivery" || reward.category === "dining")) {
                matches = true;
            } else if (merchant.includes("amazon") && (reward.category === "amazon" || reward.category === "online-shopping")) {
                matches = true;
            } else if (merchant.includes("flipkart") && (reward.category === "flipkart" || reward.category === "online-shopping")) {
                matches = true;
            } else if (merchant.includes("myntra") && (reward.category === "flipkart" || reward.category === "online-shopping")) {
                matches = true;
            } else if (merchant.includes("bigbasket") && reward.category === "groceries") {
                matches = true;
            } else if (merchant.includes("blinkit") && reward.category === "groceries") {
                matches = true;
            } else if ((merchant.includes("bookmyshow") || merchant.includes("pvr") || merchant.includes("inox")) && reward.category === "entertainment") {
                matches = true;
            } else if ((merchant.includes("makemytrip") || merchant.includes("goibibo") || merchant.includes("cleartrip")) && reward.category === "travel") {
                matches = true;
            } else if ((merchant.includes("ola") || merchant.includes("uber")) && reward.category === "travel") {
                matches = true;
            } else if (reward.category === "general") {
                matches = true;
            }

            if (matches) {
                const savings = (amount * rate) / 100;
                const cappedSavings = reward.cap ? Math.min(savings, reward.cap) : savings;
                if (cappedSavings > bestSavings) {
                    bestSavings = cappedSavings;
                    method = `${card.bank} ${card.name} — ${reward.notes || `${rate}% ${reward.rewardType}`}`;
                }
            }
        }

        if (bestSavings > 0) {
            results.push({ card, savings: bestSavings, method });
        }
    }

    return results.sort((a, b) => b.savings - a.savings);
}

/**
 * Get card recommendation for a user's spending profile
 */
export function getCardRecommendation(
    monthlySpending: Record<string, number>
): Array<{
    card: CreditCard;
    monthlySavings: number;
    annualSavings: number;
    netAnnualBenefit: number; // savings minus annual fee
    breakdown: Array<{ category: string; savings: number }>;
}> {
    const results = [];

    for (const card of CREDIT_CARDS) {
        let totalMonthlySavings = 0;
        const breakdown: Array<{ category: string; savings: number }> = [];

        for (const [category, amount] of Object.entries(monthlySpending)) {
            const bestMatch = card.rewards
                .filter(
                    (r) =>
                        r.category === category ||
                        r.category === "general" ||
                        (category === "food" && r.category === "dining") ||
                        (category === "food" && r.category === "food-delivery")
                )
                .sort((a, b) => b.rewardRate - a.rewardRate)[0];

            if (bestMatch) {
                const savings = (amount * bestMatch.rewardRate) / 100;
                const cappedSavings = bestMatch.cap
                    ? Math.min(savings, bestMatch.cap)
                    : savings;
                totalMonthlySavings += cappedSavings;
                breakdown.push({ category, savings: cappedSavings });
            }
        }

        const annualSavings = totalMonthlySavings * 12;
        const netBenefit = annualSavings - card.annualFee;

        results.push({
            card,
            monthlySavings: totalMonthlySavings,
            annualSavings,
            netAnnualBenefit: netBenefit,
            breakdown,
        });
    }

    return results.sort((a, b) => b.netAnnualBenefit - a.netAnnualBenefit);
}
