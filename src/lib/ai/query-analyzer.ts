/**
 * PayWise AI — Smart Query Analyzer
 * 
 * Analyzes user queries to detect intent, extract entities (merchants, amounts,
 * categories), and retrieve the RIGHT knowledge to inject into the AI context.
 * 
 * This is what transforms a generic LLM into a domain expert.
 * Instead of the LLM guessing, we FEED it verified, structured knowledge.
 */

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
    | "reward_maximization"     // "maximize rewards", "get more cashback"
    // Penalty/Charges intents:
    | "penalty_query"           // "what happens if I don't pay"
    | "late_fee"                // "what is the late fee"
    | "interest_charge"         // "interest rate", "apr"
    | "forex_cost";             // "forex markup", "international transaction"

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

    // Extract credit cards mentioned — DYNAMIC matching against live DB cards
    // This is injected by the context builder which passes liveCreditCards
    // For now, extract card name fragments that we'll fuzzy match later in context-builder
    const creditCards: string[] = [];
    
    // Extract bank + card name fragments from the query for fuzzy matching
    const bankCardPatterns = [
        // Bank name patterns — we extract these to match against DB cards dynamically
        { regex: /hdfc\s+(\w[\w\s]*?)(?:\s+card|\s+credit|\s+payment|$|\?|,)/i, bank: "HDFC" },
        { regex: /sbi\s+(\w[\w\s]*?)(?:\s+card|\s+credit|\s+payment|$|\?|,)/i, bank: "SBI" },
        { regex: /axis\s+(\w[\w\s]*?)(?:\s+card|\s+credit|\s+payment|$|\?|,)/i, bank: "Axis" },
        { regex: /icici\s+(\w[\w\s]*?)(?:\s+card|\s+credit|\s+payment|$|\?|,)/i, bank: "ICICI" },
    ];
    
    for (const pattern of bankCardPatterns) {
        const match = q.match(pattern.regex);
        if (match) {
            // Store as "BANK:cardname" so context-builder can fuzzy match against DB
            creditCards.push(`${pattern.bank}:${match[1].trim().toLowerCase()}`);
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
    } else if (q.match(/penalty/i) || q.match(/fine/i) || q.match(/don't pay/i) || q.match(/miss.*payment/i) || q.match(/late.*payment/i)) {
        intent = "penalty_query";
        confidence = 0.9;
    } else if (q.match(/late fee/i) || q.match(/late charge/i)) {
        intent = "late_fee";
        confidence = 0.95;
    } else if (q.match(/interest/i) || q.match(/apr/i) || q.match(/carry.*forward/i) || q.match(/minimum due/i) || q.match(/minimum payment/i)) {
        intent = "interest_charge";
        confidence = 0.95;
    } else if (q.match(/forex/i) || q.match(/international/i) || q.match(/foreign/i) || q.match(/abroad/i) || q.match(/markup/i)) {
        intent = "forex_cost";
        confidence = 0.9;
    } else if (q.match(/(this|every) month/i) || q.match(/routine/i) || q.match(/what should i do/i) || q.match(/monthly plan/i)) {
        intent = "monthly_routine";
        confidence = 0.8;
    } else if (merchants.length > 0) {
        intent = "merchant_specific";
        confidence = 0.75;
    }

    return { intent, merchants, categories, amount, paymentApps, creditCards, confidence };
}
