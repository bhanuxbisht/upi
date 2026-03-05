/**
 * PayWise AI — Smart Query Analyzer
 * 
 * Analyzes user queries to detect intent, extract entities (merchants, amounts,
 * categories), and retrieve the RIGHT knowledge to inject into the AI context.
 * 
 * This is what transforms a generic LLM into a domain expert.
 * Instead of the LLM guessing, we FEED it verified, structured knowledge.
 */

import {
    getBestCardForMerchant,
    getBestCardsForCategory,
    getCardRecommendation,
    getOptimalAppStack,
    getStrategiesForApps,
    getBestUPIAppForCategory,
    getRelevantStrategies,
    estimateMonthlySavings,
    SUBSCRIPTION_OPTIMIZATION,
    TAX_PAYMENT_TIPS,
    MONTHLY_ROUTINES,
    CREDIT_CARDS,
    UPI_APPS,
    type CreditCard,
} from "./knowledge";

// ============================================================
// INTENT DETECTION
// ============================================================

export type QueryIntent =
    | "payment_recommendation"   // "best way to pay at X"
    | "card_recommendation"      // "best credit card for X"
    | "spending_analysis"        // "analyze my spending"
    | "savings_check"           // "how much did I save"
    | "offer_stacking"          // "how to stack offers"
    | "subscription_optimize"   // "which subscriptions to cancel"
    | "tax_savings"             // "how to save on taxes via payments"
    | "compare_apps"            // "PhonePe vs Google Pay"
    | "budget_advice"           // "how to budget", "I'm overspending"
    | "merchant_specific"       // anything about a specific merchant
    | "general_advice"          // general payment tips
    | "monthly_routine"         // "what should I do this month"
    | "rent_payment"            // "how to pay rent", "rent via credit card"
    | "bill_optimization"       // "optimize my bills"
    | "reward_maximization";    // "maximize rewards", "get more cashback"

interface QueryAnalysis {
    intent: QueryIntent;
    merchants: string[];
    categories: string[];
    amount: number | null;
    paymentApps: string[];
    creditCards: string[];
    confidence: number;
}

// Known merchant patterns
const MERCHANT_PATTERNS: Record<string, { name: string; category: string }> = {
    "swiggy": { name: "Swiggy", category: "food-delivery" },
    "zomato": { name: "Zomato", category: "food-delivery" },
    "amazon": { name: "Amazon", category: "shopping" },
    "flipkart": { name: "Flipkart", category: "shopping" },
    "myntra": { name: "Myntra", category: "shopping" },
    "bigbasket": { name: "BigBasket", category: "groceries" },
    "blinkit": { name: "Blinkit", category: "groceries" },
    "zepto": { name: "Zepto", category: "groceries" },
    "bookmyshow": { name: "BookMyShow", category: "entertainment" },
    "pvr": { name: "PVR INOX", category: "entertainment" },
    "makemytrip": { name: "MakeMyTrip", category: "travel" },
    "goibibo": { name: "Goibibo", category: "travel" },
    "cleartrip": { name: "Cleartrip", category: "travel" },
    "ola": { name: "Ola", category: "travel" },
    "uber": { name: "Uber", category: "travel" },
    "rapido": { name: "Rapido", category: "travel" },
    "netflix": { name: "Netflix", category: "entertainment" },
    "spotify": { name: "Spotify", category: "entertainment" },
    "youtube": { name: "YouTube Premium", category: "entertainment" },
    "hotstar": { name: "Disney+ Hotstar", category: "entertainment" },
    "jiocinema": { name: "JioCinema", category: "entertainment" },
    "nykaa": { name: "Nykaa", category: "shopping" },
    "meesho": { name: "Meesho", category: "shopping" },
    "ajio": { name: "AJIO", category: "shopping" },
    "croma": { name: "Croma", category: "shopping" },
    "reliance": { name: "Reliance Digital/JioMart", category: "shopping" },
    "dunzo": { name: "Dunzo", category: "groceries" },
    "instamart": { name: "Swiggy Instamart", category: "groceries" },
    "airtel": { name: "Airtel", category: "bills-recharges" },
    "jio": { name: "Jio", category: "bills-recharges" },
    "vi": { name: "Vodafone Idea", category: "bills-recharges" },
    "bsnl": { name: "BSNL", category: "bills-recharges" },
    "petrol": { name: "Petrol Pump", category: "fuel" },
    "hp": { name: "HP Petrol", category: "fuel" },
    "ioc": { name: "Indian Oil", category: "fuel" },
    "bharatpe": { name: "BharatPe", category: "general" },
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    "food-delivery": ["food", "eat", "lunch", "dinner", "breakfast", "snack", "order food", "delivery", "restaurant"],
    "groceries": ["grocery", "groceries", "vegetables", "fruits", "milk", "atta", "rice", "daily needs", "kirana"],
    "shopping": ["shop", "shopping", "buy", "purchase", "clothes", "fashion", "electronics", "gadget"],
    "bills-recharges": ["bill", "recharge", "electricity", "water", "broadband", "wifi", "mobile plan", "dth", "gas bill"],
    "travel": ["travel", "flight", "hotel", "trip", "booking", "bus", "train", "cab", "ride", "vacation"],
    "entertainment": ["movie", "movies", "entertainment", "ott", "streaming", "subscription", "netflix", "concert"],
    "fuel": ["fuel", "petrol", "diesel", "gas station", "filling"],
    "rent": ["rent", "house rent", "hra", "landlord", "rental"],
    "health-pharmacy": ["medicine", "pharmacy", "health", "medical", "doctor", "hospital", "pharmeasy", "1mg"],
    "education": ["education", "course", "tuition", "school", "college", "exam", "books"],
};

/**
 * Analyze a user query to detect intent and extract entities
 */
export function analyzeQuery(query: string): QueryAnalysis {
    const q = query.toLowerCase().trim();
    
    // Extract merchants
    const merchants: string[] = [];
    for (const [pattern, info] of Object.entries(MERCHANT_PATTERNS)) {
        if (q.includes(pattern)) {
            merchants.push(info.name);
        }
    }

    // Extract categories
    const categories: string[] = [];
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((kw) => q.includes(kw))) {
            categories.push(category);
        }
    }

    // Also add categories from matched merchants
    for (const [pattern, info] of Object.entries(MERCHANT_PATTERNS)) {
        if (q.includes(pattern) && !categories.includes(info.category)) {
            categories.push(info.category);
        }
    }

    // Extract amount
    const amountMatch = q.match(/₹?\s*(\d{1,7}(?:,\d{3})*(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;

    // Extract payment apps mentioned
    const paymentApps: string[] = [];
    const appPatterns = ["phonepe", "google pay", "gpay", "paytm", "amazon pay", "cred", "whatsapp pay", "bhim", "freecharge", "mobikwik"];
    for (const app of appPatterns) {
        if (q.includes(app)) {
            paymentApps.push(app === "gpay" ? "google-pay" : app.replace(" ", "-"));
        }
    }

    // Extract credit cards mentioned
    const creditCards: string[] = [];
    const cardPatterns: Record<string, string> = {
        "hdfc regalia": "hdfc-regalia",
        "hdfc millennia": "hdfc-millennia",
        "hdfc infinia": "hdfc-infinia",
        "hdfc swiggy": "hdfc-swiggy",
        "sbi cashback": "sbi-cashback",
        "sbi simplysave": "sbi-simplysave",
        "icici amazon": "icici-amazon-pay",
        "amazon pay card": "icici-amazon-pay",
        "flipkart axis": "axis-flipkart",
        "axis ace": "axis-ace",
        "onecard": "onecard-metal",
        "au lit": "au-lit",
    };
    for (const [pattern, id] of Object.entries(cardPatterns)) {
        if (q.includes(pattern)) {
            creditCards.push(id);
        }
    }

    // Detect intent
    let intent: QueryIntent = "general_advice";
    let confidence = 0.5;

    if (q.match(/best (way|method|app|option) to pay/i) || q.match(/how (should|do|to) (i )?pay/i) || (merchants.length > 0 && amount)) {
        intent = "payment_recommendation";
        confidence = 0.95;
    } else if (q.match(/best (credit )?card/i) || q.match(/which card/i) || q.match(/recommend.*card/i) || q.match(/card for/i)) {
        intent = "card_recommendation";
        confidence = 0.9;
    } else if (q.match(/analy[sz]e.*spend/i) || q.match(/spending (pattern|habit|analysis)/i) || q.match(/where.*money.*go/i) || q.match(/how much.*spend/i)) {
        intent = "spending_analysis";
        confidence = 0.9;
    } else if (q.match(/how much.*(save|saved)/i) || q.match(/saving(s)?/i) || q.match(/my savings/i)) {
        intent = "savings_check";
        confidence = 0.85;
    } else if (q.match(/stack/i) || q.match(/combine.*(offer|discount|cashback)/i) || q.match(/multiple.*discount/i)) {
        intent = "offer_stacking";
        confidence = 0.9;
    } else if (q.match(/subscription/i) || q.match(/cancel.*subscription/i) || q.match(/ott/i) || q.match(/streaming/i)) {
        intent = "subscription_optimize";
        confidence = 0.85;
    } else if (q.match(/tax/i) || q.match(/80[cde]/i) || q.match(/deduction/i) || q.match(/itr/i)) {
        intent = "tax_savings";
        confidence = 0.85;
    } else if (q.match(/(compare|vs|versus|better|difference)/i) && paymentApps.length >= 1) {
        intent = "compare_apps";
        confidence = 0.85;
    } else if (q.match(/budget/i) || q.match(/overspend/i) || q.match(/save more/i) || q.match(/cut.*cost/i) || q.match(/reduce.*spend/i)) {
        intent = "budget_advice";
        confidence = 0.8;
    } else if (q.match(/rent/i) && (q.match(/pay/i) || q.match(/card/i) || q.match(/cred/i))) {
        intent = "rent_payment";
        confidence = 0.9;
    } else if (q.match(/bill/i) && (q.match(/optim/i) || q.match(/save/i) || q.match(/reduce/i) || q.match(/best/i))) {
        intent = "bill_optimization";
        confidence = 0.85;
    } else if (q.match(/maxim/i) || q.match(/more cashback/i) || q.match(/more rewards/i) || q.match(/earn more/i)) {
        intent = "reward_maximization";
        confidence = 0.85;
    } else if (q.match(/(this|every) month/i) || q.match(/routine/i) || q.match(/what should i do/i) || q.match(/monthly plan/i)) {
        intent = "monthly_routine";
        confidence = 0.8;
    } else if (merchants.length > 0) {
        intent = "merchant_specific";
        confidence = 0.75;
    }

    return { intent, merchants, categories, amount, paymentApps, creditCards, confidence };
}

// ============================================================
// KNOWLEDGE INJECTION — The Magic
// ============================================================

/**
 * Based on analyzed query, build a rich knowledge context
 * that transforms the LLM from generic chatbot to domain expert.
 * 
 * This is our COMPETITIVE ADVANTAGE. The AI doesn't have to guess —
 * we feed it verified, structured data about cards, apps, and strategies.
 */
export function buildKnowledgeContext(analysis: QueryAnalysis): string {
    const parts: string[] = [];
    
    parts.push(`[DETECTED INTENT: ${analysis.intent} (confidence: ${(analysis.confidence * 100).toFixed(0)}%)]`);

    switch (analysis.intent) {
        case "payment_recommendation":
            parts.push(buildPaymentRecommendationKnowledge(analysis));
            break;
        case "card_recommendation":
            parts.push(buildCardRecommendationKnowledge(analysis));
            break;
        case "spending_analysis":
            parts.push(buildSpendingAnalysisKnowledge(analysis));
            break;
        case "offer_stacking":
            parts.push(buildOfferStackingKnowledge(analysis));
            break;
        case "subscription_optimize":
            parts.push(buildSubscriptionKnowledge());
            break;
        case "tax_savings":
            parts.push(buildTaxKnowledge());
            break;
        case "compare_apps":
            parts.push(buildAppComparisonKnowledge(analysis));
            break;
        case "rent_payment":
            parts.push(buildRentPaymentKnowledge());
            break;
        case "bill_optimization":
            parts.push(buildBillOptimizationKnowledge());
            break;
        case "monthly_routine":
            parts.push(buildMonthlyRoutineKnowledge());
            break;
        case "reward_maximization":
            parts.push(buildRewardMaxKnowledge(analysis));
            break;
        case "merchant_specific":
            parts.push(buildMerchantKnowledge(analysis));
            break;
        case "budget_advice":
            parts.push(buildBudgetKnowledge(analysis));
            break;
        case "savings_check":
            // This uses user context from DB, no extra knowledge needed
            parts.push("[Use the user's savings data from context. If no data, encourage them to start tracking via the 'I Used This' button on offers.]");
            break;
        default:
            parts.push(buildGeneralKnowledge());
    }

    return parts.join("\n\n");
}

function buildPaymentRecommendationKnowledge(analysis: QueryAnalysis): string {
    const parts: string[] = [];
    
    if (analysis.merchants.length > 0 && analysis.amount) {
        const merchant = analysis.merchants[0];
        const results = getBestCardForMerchant(merchant, analysis.amount);
        
        if (results.length > 0) {
            parts.push(`[VERIFIED CARD DATA for ${merchant} (₹${analysis.amount}):]`);
            results.slice(0, 5).forEach((r, i) => {
                parts.push(`${i + 1}. ${r.method} — Save ₹${r.savings.toFixed(0)}`);
            });
        }
    }

    // Add UPI app recommendations for the category
    if (analysis.categories.length > 0) {
        const category = analysis.categories[0];
        const upiResults = getBestUPIAppForCategory(category);
        if (upiResults.length > 0) {
            parts.push(`\n[BEST UPI APPS for ${category}:]`);
            upiResults.forEach((r) => {
                parts.push(`- ${r.app.name}: ${r.reasoning}`);
            });
        }

        // Add stacking strategies
        const strategies = getRelevantStrategies(
            category as "food" | "shopping" | "bills" | "travel" | "entertainment" | "rent" | "groceries" | "general"
        );
        if (strategies.length > 0) {
            parts.push(`\n[OFFER STACKING STRATEGY:]`);
            strategies[0].steps.forEach((step) => parts.push(step));
        }
    }

    // Add optimal app stack
    parts.push(`\n[OPTIMAL APP FOR EACH USE CASE:]`);
    const stack = getOptimalAppStack();
    const relevantStack = analysis.categories.length > 0
        ? stack.filter((s) => analysis.categories.some((c) => s.useCase.toLowerCase().includes(c.split("-")[0])))
        : stack.slice(0, 5);
    relevantStack.forEach((s) => {
        parts.push(`- ${s.useCase}: ${s.app} (${s.reason})`);
    });

    return parts.join("\n");
}

function buildCardRecommendationKnowledge(analysis: QueryAnalysis): string {
    const parts: string[] = [];
    
    if (analysis.categories.length > 0) {
        const category = analysis.categories[0];
        const results = getBestCardsForCategory(category, 5);
        
        parts.push(`[TOP CREDIT CARDS for ${category}:]`);
        results.forEach((r, i) => {
            const card = r.card;
            parts.push(`${i + 1}. ${card.bank} ${card.name} — ${r.effectiveRate}% ${r.reward.rewardType}`);
            parts.push(`   Annual fee: ₹${card.annualFee}${card.feeWaiver ? ` (${card.feeWaiver})` : ""}`);
            parts.push(`   Best for: ${card.bestFor.join(", ")}`);
            parts.push(`   Pros: ${card.pros.join("; ")}`);
            parts.push(`   Cons: ${card.cons.join("; ")}`);
        });
    } else {
        // General card recommendation — show top cards across categories
        parts.push("[TOP CREDIT CARDS BY CATEGORY:]");
        
        const categories = ["food-delivery", "online-shopping", "travel", "groceries", "general"];
        for (const cat of categories) {
            const best = getBestCardsForCategory(cat, 1);
            if (best.length > 0) {
                parts.push(`- ${cat}: ${best[0].card.bank} ${best[0].card.name} (${best[0].effectiveRate}%)`);
            }
        }

        // Also show best all-rounder cards
        parts.push("\n[BEST ALL-ROUNDER CARDS:]");
        const allRounders = CREDIT_CARDS
            .filter((c) => c.bestFor.includes("everything") || c.bestFor.includes("general-spending") || c.bestFor.includes("all-rounder"))
            .slice(0, 3);
        allRounders.forEach((card) => {
            parts.push(`- ${card.bank} ${card.name}: ₹${card.annualFee}/year, ${card.rewards.find(r => r.category === "general")?.rewardRate || "varies"}% general`);
        });
    }

    return parts.join("\n");
}

function buildSpendingAnalysisKnowledge(analysis: QueryAnalysis): string {
    return `[ANALYSIS FRAMEWORK — Use this structure for the response:]
1. Current spending summary (use user context data)
2. Top 3 categories where they overspend vs Indian average:
   - Food delivery: Indian avg ₹3000-5000/month for urban professional
   - Groceries: ₹5000-8000/month for small family
   - Shopping: ₹3000-7000/month
   - Bills: ₹2000-4000/month
   - Travel: ₹1000-5000/month
   - Entertainment: ₹500-2000/month
3. Specific saving actions for their top spending categories
4. Which payment apps/cards they should use more and why
5. Monthly saving target (realistic: 5-15% of total spending)

[IMPORTANT: If user has no transaction data, suggest they start by logging their last week's transactions manually, or import a bank statement.]`;
}

function buildOfferStackingKnowledge(analysis: QueryAnalysis): string {
    const parts: string[] = [];
    parts.push("[OFFER STACKING STRATEGIES — These are TESTED and VERIFIED:]");
    
    const strategies = analysis.categories.length > 0
        ? getRelevantStrategies(analysis.categories[0] as "food" | "shopping" | "bills" | "travel" | "entertainment" | "rent" | "groceries" | "general")
        : getRelevantStrategies("general");

    if (strategies.length > 0) {
        for (const strategy of strategies.slice(0, 3)) {
            parts.push(`\n${strategy.title} (Saves ₹${strategy.monthlySavingsPotential.min}-${strategy.monthlySavingsPotential.max}/month):`);
            strategy.steps.forEach((step) => parts.push(`  ${step}`));
            if (strategy.warnings) {
                parts.push(`  Warnings: ${strategy.warnings.join("; ")}`);
            }
        }
    }

    parts.push("\n[KEY STACKING RULE: Merchant discount + UPI app coupon + Credit card cashback can all be combined. The trick is the ORDER you apply them.]");
    
    return parts.join("\n");
}

function buildSubscriptionKnowledge(): string {
    const parts: string[] = [];
    parts.push("[SUBSCRIPTION OPTIMIZATION DATA:]");
    
    parts.push("\nSmart Bundles (save by consolidating):");
    SUBSCRIPTION_OPTIMIZATION.streamingBundles.forEach((bundle) => {
        parts.push(`- ${bundle.bundle}: Includes ${bundle.includes.join(", ")}. Saves ${bundle.savings}. ${bundle.recommendation}`);
    });

    parts.push("\nCommon Money Wasters:");
    SUBSCRIPTION_OPTIMIZATION.commonWaste.forEach((w) => parts.push(`- ${w}`));

    parts.push("\nPro Tips:");
    SUBSCRIPTION_OPTIMIZATION.tips.forEach((t) => parts.push(`- ${t}`));

    return parts.join("\n");
}

function buildTaxKnowledge(): string {
    const parts: string[] = [];
    parts.push("[TAX-SAVING PAYMENT TIPS — India-Specific:]");
    TAX_PAYMENT_TIPS.forEach((tip) => parts.push(`- ${tip}`));
    parts.push("\n[DISCLAIMER: This is general awareness only. Consult a CA/tax advisor for tax planning specific to your situation.]");
    return parts.join("\n");
}

function buildAppComparisonKnowledge(analysis: QueryAnalysis): string {
    const parts: string[] = [];
    
    const apps = analysis.paymentApps.length > 0 
        ? UPI_APPS.filter((a) => analysis.paymentApps.some((p) => a.slug.includes(p.replace("-", ""))))
        : UPI_APPS.slice(0, 3);

    parts.push("[UPI APP COMPARISON DATA:]");
    for (const app of apps) {
        parts.push(`\n${app.name} (${app.marketShare}% market share, ${app.monthlyActiveUsers} users):`);
        parts.push(`  Strong in: ${app.strengthCategories.join(", ")}`);
        parts.push(`  Weak in: ${app.weakCategories.join(", ")}`);
        parts.push(`  CC link: ${app.creditCardLinkSupport ? "Yes" : "No"} | Split bill: ${app.splitBillSupport ? "Yes" : "No"} | AutoPay: ${app.autoPaySupport ? "Yes" : "No"}`);
        parts.push(`  Top strategies:`);
        app.strategies.slice(0, 3).forEach((s) => parts.push(`    - ${s}`));
    }

    return parts.join("\n");
}

function buildRentPaymentKnowledge(): string {
    const rentStrategy = getRelevantStrategies("rent");
    const parts: string[] = [];
    
    parts.push("[RENT PAYMENT INTELLIGENCE:]");
    if (rentStrategy.length > 0) {
        rentStrategy[0].steps.forEach((step) => parts.push(step));
        if (rentStrategy[0].warnings) {
            parts.push("\nWarnings:");
            rentStrategy[0].warnings.forEach((w) => parts.push(`- ${w}`));
        }
    }

    parts.push("\n[PROFITABLE CARDS FOR RENT (>1.5% reward to beat CRED fee):]");
    const profitableCards = CREDIT_CARDS.filter((c) => {
        const generalReward = c.rewards.find((r) => r.category === "general");
        return generalReward && generalReward.rewardRate > 1.5;
    });
    profitableCards.forEach((card) => {
        const rate = card.rewards.find((r) => r.category === "general")?.rewardRate || 0;
        parts.push(`- ${card.bank} ${card.name}: ${rate}% general → NET GAIN of ${(rate - 1.5).toFixed(1)}% on rent`);
    });

    return parts.join("\n");
}

function buildBillOptimizationKnowledge(): string {
    const billStrategy = getRelevantStrategies("bills");
    const parts: string[] = [];
    
    parts.push("[BILL OPTIMIZATION STRATEGY:]");
    if (billStrategy.length > 0) {
        billStrategy[0].steps.forEach((step) => parts.push(step));
    }

    parts.push("\n[BEST APP PER BILL TYPE:]");
    parts.push("- Electricity: Google Pay (50% scratch card probability)");
    parts.push("- Mobile recharge: PhonePe (40% scratch card, up to ₹100)");
    parts.push("- Broadband: Amazon Pay (₹50 cashback monthly)");
    parts.push("- DTH: PhonePe or GPay (compare scratch card offers)");
    parts.push("- Water bill: Google Pay (scratch card)");
    parts.push("- Gas bill: PhonePe (scratch card)");
    parts.push("- Credit card bill: CRED (CRED coins worth ₹50-200)");
    parts.push("- Insurance premium: Amazon Pay (₹200-500 cashback promos)");

    parts.push("\n[KEY INSIGHT: Don't pay all bills from one app — spread across GPay, PhonePe, Amazon for maximum scratch card/cashback probability]");
    
    return parts.join("\n");
}

function buildMonthlyRoutineKnowledge(): string {
    const parts: string[] = [];
    parts.push("[MONTHLY SAVINGS ROUTINE — Follow this calendar:]");
    
    MONTHLY_ROUTINES.forEach((week) => {
        parts.push(`\nWeek ${week.week}:`);
        week.tasks.forEach((task) => {
            parts.push(`  - ${task.action} via ${task.platform} → Save ~₹${task.estimatedSaving}`);
        });
    });

    const totalMonthly = MONTHLY_ROUTINES.reduce(
        (sum, week) => sum + week.tasks.reduce((s, t) => s + t.estimatedSaving, 0),
        0
    );
    parts.push(`\n[TOTAL ESTIMATED MONTHLY SAVINGS: ₹${totalMonthly}+ just from following this routine]`);
    
    return parts.join("\n");
}

function buildRewardMaxKnowledge(analysis: QueryAnalysis): string {
    const parts: string[] = [];
    parts.push("[REWARD MAXIMIZATION SYSTEM:]");
    
    parts.push("\n1. OPTIMAL CARD-APP COMBOS:");
    parts.push("   - Axis ACE + Google Pay = 2% on EVERYTHING");
    parts.push("   - ICICI Amazon Pay + Amazon = 5% on Amazon (Prime), 1% everywhere");
    parts.push("   - Flipkart Axis + Flipkart/Myntra = 5% unlimited");
    parts.push("   - HDFC Swiggy + Swiggy = 10% cashback");
    parts.push("   - RuPay CC + PhonePe UPI = Card rewards + UPI cashback stacked");

    parts.push("\n2. STACKING ORDER (always apply in this sequence):");
    parts.push("   a) Apply merchant promo code FIRST");
    parts.push("   b) Use UPI app's in-app portal (PhonePe Switch) for extra coupon");
    parts.push("   c) Pay with the BEST credit card for that category");
    parts.push("   d) Earn UPI app scratch cards on top");

    parts.push("\n3. BONUS MULTIPLIER EVENTS:");
    parts.push("   - Amazon Great Indian Festival: 10-20% extra cashback");
    parts.push("   - Flipkart Big Billion Days: Extra card discounts");
    parts.push("   - HDFC SmartBuy: 10x reward points on travel");
    parts.push("   - CRED Flash deals: 50-80% off brand vouchers");

    const stack = getOptimalAppStack();
    parts.push("\n4. OPTIMAL APP FOR EACH USE CASE:");
    stack.forEach((s) => parts.push(`   - ${s.useCase}: ${s.app} (${s.reason})`));

    return parts.join("\n");
}

function buildMerchantKnowledge(analysis: QueryAnalysis): string {
    const parts: string[] = [];
    
    for (const merchant of analysis.merchants) {
        parts.push(`[MERCHANT INTELLIGENCE: ${merchant}]`);
        
        // Get best cards for this merchant (with ₹500 default amount)
        const amount = analysis.amount || 500;
        const cardResults = getBestCardForMerchant(merchant, amount);
        if (cardResults.length > 0) {
            parts.push(`\nBest payment methods for ₹${amount} at ${merchant}:`);
            cardResults.slice(0, 5).forEach((r, i) => {
                parts.push(`${i + 1}. ${r.method} — Save ₹${r.savings.toFixed(0)}`);
            });
        }

        // Get UPI app recommendations
        const merchantCategory = Object.values(MERCHANT_PATTERNS).find(
            (m) => m.name === merchant
        )?.category;
        
        if (merchantCategory) {
            const upiResults = getBestUPIAppForCategory(merchantCategory);
            if (upiResults.length > 0) {
                parts.push(`\nBest UPI apps:`);
                upiResults.forEach((r) => {
                    parts.push(`- ${r.app.name}: ${r.reasoning}`);
                    // Add specific strategies for used apps
                    r.app.strategies.slice(0, 2).forEach((s) => {
                        if (s.toLowerCase().includes(merchant.toLowerCase().split(" ")[0])) {
                            parts.push(`  PRO TIP: ${s}`);
                        }
                    });
                });
            }
        }
    }

    return parts.join("\n");
}

function buildBudgetKnowledge(analysis: QueryAnalysis): string {
    return `[BUDGET ADVICE FRAMEWORK:]
1. 50-30-20 Rule adapted for Indian digital payments:
   - 50% Needs: Rent, groceries, bills, fuel, insurance
   - 30% Wants: Food delivery, shopping, entertainment, subscriptions
   - 20% Savings: Investments, emergency fund, goals

2. QUICK WINS to reduce spending:
   - Switch to annual billing for subscriptions you use (save 20-40%)
   - Check if mobile plan already includes OTT (most ₹299+ plans do)
   - Use PhonePe Switch / GPay in-app for coupons before ordering
   - Cancel unused subscriptions (average Indian wastes ₹500/month)
   - Set spending alerts on credit cards at 80% of budget
   - Use different cards for different categories to maximize rewards

3. TRACKING SYSTEM:
   - Log every transaction in PayWise (even small ₹50 ones)
   - Review weekly instead of monthly — catch problems early
   - Compare this month vs last month for each category
   - Set category-wise budgets, not just a total budget

[Use the user's actual spending data from context to give specific advice. If no data, ask them to start tracking or import their bank statement.]`;
}

function buildGeneralKnowledge(): string {
    const parts: string[] = [];
    parts.push("[GENERAL PAYMENT SAVINGS KNOWLEDGE:]");
    
    parts.push("\nTop 5 Money-Saving Rules for Indian Digital Payments:");
    parts.push("1. Never pay full price — always check for a promo code first");
    parts.push("2. Use the RIGHT card for each category (not the same card everywhere)");
    parts.push("3. Stack rewards: Merchant discount + UPI coupon + Card cashback");
    parts.push("4. Split bills across apps — don't put all bills in one app");
    parts.push("5. Pay credit card bills on time via CRED — earn coins and maintain credit score");

    parts.push("\n[OPTIMAL APP STACK:]");
    const stack = getOptimalAppStack();
    stack.slice(0, 6).forEach((s) => {
        parts.push(`- ${s.useCase}: ${s.app} (${s.reason})`);
    });

    return parts.join("\n");
}
