/**
 * PayWise Knowledge Engine — UPI App Intelligence
 * 
 * Deep knowledge about UPI app cashback patterns, reward cycles,
 * and optimal usage strategies. This is what makes our AI actually
 * useful vs a generic chatbot.
 */

export interface UPICashbackRule {
    type: "flat" | "percentage" | "scratch-card" | "coins";
    value: number; // ₹ for flat, % for percentage, max for scratch
    minTransaction: number;
    maxCashback?: number;
    frequency: "per-transaction" | "daily" | "weekly" | "monthly";
    probability?: number; // for scratch cards, % chance of winning
    notes?: string;
}

export interface UPIRewardTier {
    merchant?: string;
    category?: string;
    cashback: UPICashbackRule;
    validDays?: string[]; // e.g., ["Monday", "Wednesday"]
    validHours?: { start: number; end: number };
}

export interface UPIAppProfile {
    id: string;
    name: string;
    slug: string;
    marketShare: number; // % of UPI transactions
    monthlyActiveUsers: string; // e.g., "450M+"
    color: string;
    strengthCategories: string[];
    weakCategories: string[];
    rewardTiers: UPIRewardTier[];
    linkedCardBenefits: string[];
    strategies: string[]; // HOW to maximize savings — this is the gold
    recurringPaymentSupport: boolean;
    autoPaySupport: boolean;
    creditCardLinkSupport: boolean;
    splitBillSupport: boolean;
}

/**
 * Comprehensive UPI App Intelligence Database
 */
export const UPI_APPS: UPIAppProfile[] = [
    {
        id: "phonepe",
        name: "PhonePe",
        slug: "phonepe",
        marketShare: 48,
        monthlyActiveUsers: "450M+",
        color: "#5F259F",
        strengthCategories: ["food-delivery", "bills-recharges", "insurance", "mutual-funds"],
        weakCategories: ["travel"],
        rewardTiers: [
            {
                category: "food-delivery",
                cashback: {
                    type: "flat",
                    value: 50,
                    minTransaction: 199,
                    maxCashback: 50,
                    frequency: "monthly",
                    notes: "Flat ₹50 on first Swiggy order via PhonePe each month"
                }
            },
            {
                category: "bills-recharges",
                cashback: {
                    type: "scratch-card",
                    value: 100,
                    minTransaction: 50,
                    frequency: "per-transaction",
                    probability: 40,
                    notes: "Scratch card up to ₹100 on mobile recharge"
                }
            },
            {
                category: "groceries",
                cashback: {
                    type: "flat",
                    value: 75,
                    minTransaction: 299,
                    frequency: "monthly",
                    notes: "₹75 off on BigBasket/Blinkit via PhonePe Switch"
                }
            },
            {
                merchant: "general",
                cashback: {
                    type: "scratch-card",
                    value: 200,
                    minTransaction: 100,
                    frequency: "per-transaction",
                    probability: 30,
                    notes: "Get scratch cards on merchant payments"
                }
            }
        ],
        linkedCardBenefits: [
            "HDFC cards on PhonePe get additional merchant cashback",
            "RuPay Credit on UPI gives reward points on PhonePe",
            "ICICI credit card linked payments sometimes get double rewards"
        ],
        strategies: [
            "ALWAYS check PhonePe Switch before ordering directly — it often has exclusive ₹50-100 off coupons for Swiggy, BigBasket, Myntra",
            "Pay electricity and water bills via PhonePe to earn scratch cards (₹100+ value, 40% win rate)",
            "Link your RuPay Credit card on PhonePe UPI — you get credit card rewards + UPI cashback stacked",
            "PhonePe's insurance section has the cheapest term plans — check before buying elsewhere",
            "Use PhonePe for mutual fund SIP — it's free and earns scratch cards on each SIP",
            "Set up autopay for recurring bills — you still earn scratch cards but never miss a payment",
        ],
        recurringPaymentSupport: true,
        autoPaySupport: true,
        creditCardLinkSupport: true,
        splitBillSupport: true,
    },
    {
        id: "gpay",
        name: "Google Pay",
        slug: "google-pay",
        marketShare: 37,
        monthlyActiveUsers: "300M+",
        color: "#4285F4",
        strengthCategories: ["general-p2p", "bills-recharges", "travel"],
        weakCategories: ["food-delivery"],
        rewardTiers: [
            {
                category: "general",
                cashback: {
                    type: "scratch-card",
                    value: 1000,
                    minTransaction: 150,
                    frequency: "per-transaction",
                    probability: 35,
                    notes: "Scratch card up to ₹1000 on peer payments (₹150+)"
                }
            },
            {
                category: "bills-recharges",
                cashback: {
                    type: "scratch-card",
                    value: 500,
                    minTransaction: 50,
                    frequency: "per-transaction",
                    probability: 50,
                    notes: "High-probability scratch cards on bill payments"
                }
            },
            {
                merchant: "makemytrip",
                cashback: {
                    type: "flat",
                    value: 500,
                    minTransaction: 2000,
                    frequency: "monthly",
                    notes: "₹500 off flights via GPay in-app booking"
                }
            }
        ],
        linkedCardBenefits: [
            "Axis ACE card on GPay gives 2% cashback on EVERYTHING",
            "RuPay credit cards work seamlessly on GPay UPI",
            "HDFC Millennia gives 1% on GPay UPI transactions"
        ],
        strategies: [
            "CRITICAL: Link Axis ACE credit card on Google Pay — you get flat 2% cashback on ALL transactions",
            "Pay friends via GPay (₹150+) to earn scratch cards — even splitting dinner bills counts",
            "GPay's in-app MakeMyTrip booking often has exclusive flight/hotel offers not on MMT directly",
            "Do mobile recharges via GPay — 50% chance of getting a scratch card worth ₹10-500",
            "Use GPay for all bill payments — electricity, water, broadband — 50% scratch card probability",
            "GPay Rewards section has daily tasks that earn extra scratch cards (easy ₹10-20/day)",
        ],
        recurringPaymentSupport: true,
        autoPaySupport: true,
        creditCardLinkSupport: true,
        splitBillSupport: true,
    },
    {
        id: "paytm",
        name: "Paytm",
        slug: "paytm",
        marketShare: 8,
        monthlyActiveUsers: "100M+",
        color: "#00BAF2",
        strengthCategories: ["entertainment", "travel", "bills-recharges"],
        weakCategories: ["food-delivery", "groceries"],
        rewardTiers: [
            {
                merchant: "bookmyshow",
                cashback: {
                    type: "flat",
                    value: 150,
                    minTransaction: 300,
                    frequency: "weekly",
                    notes: "₹150 off movie tickets via Paytm"
                }
            },
            {
                category: "travel",
                cashback: {
                    type: "percentage",
                    value: 10,
                    minTransaction: 500,
                    maxCashback: 800,
                    frequency: "monthly",
                    notes: "Up to 10% off bus/train bookings"
                }
            },
            {
                category: "bills-recharges",
                cashback: {
                    type: "flat",
                    value: 30,
                    minTransaction: 100,
                    frequency: "monthly",
                    notes: "₹30 cashback on first recharge each month"
                }
            }
        ],
        linkedCardBenefits: [
            "Paytm HDFC co-branded card gives extra benefits",
            "SBI cards sometimes get Paytm-specific offers"
        ],
        strategies: [
            "Best for movie tickets — ₹150 off is hard to beat. Always book movies via Paytm, not BookMyShow directly",
            "Paytm's bus booking has the cheapest prices — compares well with RedBus and often has extra discounts",
            "Paytm First subscription (₹299/year) gives free Zee5, Sony LIV, and ₹3000+ in coupons — worth it if you use 2+ streaming services",
            "Use Paytm for insurance premium payments — often has promo codes for ₹200-500 cashback",
            "Paytm Postpaid gives short-term credit (pay next month) — useful for managing cash flow but DON'T miss payments",
        ],
        recurringPaymentSupport: true,
        autoPaySupport: true,
        creditCardLinkSupport: false,
        splitBillSupport: false,
    },
    {
        id: "amazon-pay",
        name: "Amazon Pay",
        slug: "amazon-pay",
        marketShare: 3,
        monthlyActiveUsers: "60M+",
        color: "#FF9900",
        strengthCategories: ["amazon", "shopping", "bills-recharges"],
        weakCategories: ["food-delivery", "travel"],
        rewardTiers: [
            {
                merchant: "amazon",
                cashback: {
                    type: "percentage",
                    value: 10,
                    minTransaction: 200,
                    maxCashback: 200,
                    frequency: "monthly",
                    notes: "Up to 10% Amazon Pay balance cashback on Amazon orders"
                }
            },
            {
                category: "bills-recharges",
                cashback: {
                    type: "flat",
                    value: 50,
                    minTransaction: 100,
                    frequency: "monthly",
                    notes: "₹50 cashback on recharges via Amazon"
                }
            }
        ],
        linkedCardBenefits: [
            "ICICI Amazon Pay card: 5% back on Amazon (Prime), 2% on bills, 1% everywhere",
            "Stack Amazon Pay balance cashback + ICICI card reward = 6-7% effective savings"
        ],
        strategies: [
            "STACK rewards: Load Amazon Pay wallet with ICICI Amazon card → Pay for Amazon order = 5% card + up to 10% cashback = up to 15% off",
            "Amazon Pay Balance + auto-reload gives extra ₹50/month if you shop on Amazon regularly",
            "Always check Amazon Pay offers section before paying electricity/mobile bills — often ₹50-100 cashback",
            "Amazon pay ICICI card is the BEST no-fee card in India — get it if you shop on Amazon even once a month",
            "During sale events (Great Indian Festival etc.), Amazon Pay offers go up to 20% super cashback",
        ],
        recurringPaymentSupport: true,
        autoPaySupport: true,
        creditCardLinkSupport: false,
        splitBillSupport: false,
    },
    {
        id: "cred",
        name: "CRED",
        slug: "cred",
        marketShare: 2,
        monthlyActiveUsers: "30M+",
        color: "#1A1A2E",
        strengthCategories: ["credit-card-bills", "premium-brands", "rent"],
        weakCategories: ["groceries", "low-value"],
        rewardTiers: [
            {
                category: "credit-card-bills",
                cashback: {
                    type: "coins",
                    value: 1000,
                    minTransaction: 1000,
                    frequency: "per-transaction",
                    notes: "CRED coins on every credit card bill payment — redeemable for brand vouchers"
                }
            },
            {
                category: "rent",
                cashback: {
                    type: "coins",
                    value: 5000,
                    minTransaction: 10000,
                    frequency: "monthly",
                    notes: "CRED coins on rent payment via credit card (1.5% processing fee applies)"
                }
            }
        ],
        linkedCardBenefits: [
            "ALL credit cards get CRED coins when bills paid via CRED",
            "Premium cardholders get CRED Max — higher coin rates",
            "CRED UPI works with linked bank accounts for additional rewards"
        ],
        strategies: [
            "Pay ALL credit card bills via CRED — free CRED coins worth ₹50-200/month depending on bill size",
            "CRED Mint section has flash deals — brand vouchers at 50-80% off using CRED coins",
            "If paying rent, use CRED RentPay with a rewards credit card — you earn card rewards + CRED coins (net positive even after 1.5% fee if card gives 2%+ rewards)",
            "CRED Store has exclusive deals on D2C brands — often better than brand website prices",
            "Stack: Pay credit card bill via CRED → earn coins → use coins in CRED Store for more savings",
        ],
        recurringPaymentSupport: true,
        autoPaySupport: false,
        creditCardLinkSupport: false,
        splitBillSupport: false,
    },
    {
        id: "whatsapp-pay",
        name: "WhatsApp Pay",
        slug: "whatsapp-pay",
        marketShare: 1,
        monthlyActiveUsers: "100M+",
        color: "#25D366",
        strengthCategories: ["p2p", "small-merchants"],
        weakCategories: ["bills-recharges", "shopping"],
        rewardTiers: [
            {
                category: "general",
                cashback: {
                    type: "flat",
                    value: 33,
                    minTransaction: 1,
                    maxCashback: 33,
                    frequency: "weekly",
                    notes: "₹33 cashback on 3 payments/week during promotional periods"
                }
            }
        ],
        linkedCardBenefits: [
            "Uses linked bank account only — no credit card support",
        ],
        strategies: [
            "WhatsApp Pay frequently runs promotional cashback campaigns — ₹33 per payment, up to 3/week",
            "Best for small local payments (chai, kirana) where WhatsApp is already open",
            "Lower chance of scratch card wins compared to PhonePe/GPay but guaranteed cashback during promos",
            "Good as a secondary UPI app for promo-based savings — switch to it when promos are active",
        ],
        recurringPaymentSupport: false,
        autoPaySupport: false,
        creditCardLinkSupport: false,
        splitBillSupport: false,
    },
];

/**
 * Find the best UPI app for a specific merchant/category
 */
export function getBestUPIAppForCategory(
    category: string
): Array<{ app: UPIAppProfile; tier: UPIRewardTier | null; reasoning: string }> {
    const results: Array<{ app: UPIAppProfile; tier: UPIRewardTier | null; reasoning: string }> = [];

    for (const app of UPI_APPS) {
        const matchingTier = app.rewardTiers.find(
            (t) => t.category === category || t.merchant === category
        );

        if (matchingTier) {
            results.push({
                app,
                tier: matchingTier,
                reasoning: matchingTier.cashback.notes || `${app.name} offers rewards for ${category}`,
            });
        } else if (app.strengthCategories.includes(category)) {
            results.push({
                app,
                tier: null,
                reasoning: `${app.name} is known for good ${category} offers`,
            });
        }
    }

    return results;
}

/**
 * Get all strategies for a user based on their app usage
 */
export function getStrategiesForApps(appSlugs: string[]): string[] {
    const strategies: string[] = [];

    for (const slug of appSlugs) {
        const app = UPI_APPS.find((a) => a.slug === slug);
        if (app) {
            strategies.push(...app.strategies);
        }
    }

    return strategies;
}

/**
 * Get the optimal app stack for a user
 */
export function getOptimalAppStack(): Array<{
    useCase: string;
    app: string;
    reason: string;
}> {
    return [
        { useCase: "Food delivery (Swiggy/Zomato)", app: "PhonePe", reason: "₹50-75 monthly coupons via PhonePe Switch" },
        { useCase: "Online shopping", app: "Google Pay", reason: "Link Axis ACE for 2% on everything" },
        { useCase: "Amazon orders", app: "Amazon Pay", reason: "Stack ICICI card 5% + Amazon Pay cashback" },
        { useCase: "Movie tickets", app: "Paytm", reason: "₹150 off per booking, unbeatable" },
        { useCase: "Credit card bills", app: "CRED", reason: "Free CRED coins worth ₹50-200/month" },
        { useCase: "Rent payment", app: "CRED", reason: "Card rewards + CRED coins offset 1.5% fee" },
        { useCase: "Mobile recharge", app: "PhonePe/GPay", reason: "Best scratch card probability (40-50%)" },
        { useCase: "Electricity bills", app: "Google Pay", reason: "50% scratch card probability + high value" },
        { useCase: "Groceries (BigBasket/Blinkit)", app: "PhonePe", reason: "₹75 off via PhonePe Switch" },
        { useCase: "Small daily payments", app: "WhatsApp Pay", reason: "Promotional cashback when active" },
        { useCase: "Flipkart/Myntra shopping", app: "Flipkart Axis card", reason: "5% unlimited cashback" },
        { useCase: "P2P transfers", app: "Google Pay", reason: "Scratch cards on ₹150+ transfers" },
    ];
}
