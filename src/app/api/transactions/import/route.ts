/**
 * Transaction Import API — Parse bank statements & SMS
 * 
 * This is what makes PayWise REAL-TIME. Instead of manual entry,
 * users can paste their bank statement text, SMS messages, or
 * upload CSV files and we auto-categorize everything.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { z } from "zod";

const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

// ============================================================
// CATEGORY DETECTION ENGINE
// ============================================================

const MERCHANT_CATEGORY_MAP: Record<string, { merchant: string; category: string }> = {
    // Food Delivery
    "swiggy": { merchant: "Swiggy", category: "food-delivery" },
    "zomato": { merchant: "Zomato", category: "food-delivery" },
    "eatsure": { merchant: "EatSure", category: "food-delivery" },
    "dominos": { merchant: "Dominos", category: "food-delivery" },
    "mcdonalds": { merchant: "McDonalds", category: "food-delivery" },
    "kfc": { merchant: "KFC", category: "food-delivery" },
    "burger king": { merchant: "Burger King", category: "food-delivery" },
    "pizza hut": { merchant: "Pizza Hut", category: "food-delivery" },

    // Groceries
    "bigbasket": { merchant: "BigBasket", category: "groceries" },
    "blinkit": { merchant: "Blinkit", category: "groceries" },
    "zepto": { merchant: "Zepto", category: "groceries" },
    "instamart": { merchant: "Swiggy Instamart", category: "groceries" },
    "jiomart": { merchant: "JioMart", category: "groceries" },
    "dmart": { merchant: "DMart", category: "groceries" },
    "nature basket": { merchant: "Nature's Basket", category: "groceries" },
    "dunzo": { merchant: "Dunzo", category: "groceries" },
    "amazon fresh": { merchant: "Amazon Fresh", category: "groceries" },

    // Shopping
    "amazon": { merchant: "Amazon", category: "shopping" },
    "flipkart": { merchant: "Flipkart", category: "shopping" },
    "myntra": { merchant: "Myntra", category: "shopping" },
    "ajio": { merchant: "AJIO", category: "shopping" },
    "nykaa": { merchant: "Nykaa", category: "shopping" },
    "meesho": { merchant: "Meesho", category: "shopping" },
    "croma": { merchant: "Croma", category: "shopping" },
    "reliance digital": { merchant: "Reliance Digital", category: "shopping" },
    "tata cliq": { merchant: "Tata CliQ", category: "shopping" },

    // Travel
    "uber": { merchant: "Uber", category: "travel" },
    "ola": { merchant: "Ola", category: "travel" },
    "rapido": { merchant: "Rapido", category: "travel" },
    "makemytrip": { merchant: "MakeMyTrip", category: "travel" },
    "goibibo": { merchant: "Goibibo", category: "travel" },
    "cleartrip": { merchant: "Cleartrip", category: "travel" },
    "irctc": { merchant: "IRCTC", category: "travel" },
    "redbus": { merchant: "RedBus", category: "travel" },
    "yatra": { merchant: "Yatra", category: "travel" },

    // Entertainment
    "bookmyshow": { merchant: "BookMyShow", category: "entertainment" },
    "pvr": { merchant: "PVR INOX", category: "entertainment" },
    "netflix": { merchant: "Netflix", category: "entertainment" },
    "spotify": { merchant: "Spotify", category: "entertainment" },
    "youtube": { merchant: "YouTube Premium", category: "entertainment" },
    "hotstar": { merchant: "Disney+ Hotstar", category: "entertainment" },
    "prime video": { merchant: "Amazon Prime Video", category: "entertainment" },
    "jiocinema": { merchant: "JioCinema", category: "entertainment" },

    // Bills & Recharges
    "airtel": { merchant: "Airtel", category: "bills-recharges" },
    "jio": { merchant: "Jio", category: "bills-recharges" },
    "vodafone": { merchant: "Vodafone Idea", category: "bills-recharges" },
    "bsnl": { merchant: "BSNL", category: "bills-recharges" },
    "electricity": { merchant: "Electricity", category: "bills-recharges" },
    "bescom": { merchant: "BESCOM", category: "bills-recharges" },
    "tata power": { merchant: "Tata Power", category: "bills-recharges" },
    "broadband": { merchant: "Broadband", category: "bills-recharges" },
    "act fibernet": { merchant: "ACT Fibernet", category: "bills-recharges" },
    "gas bill": { merchant: "Gas", category: "bills-recharges" },

    // Fuel
    "hp petrol": { merchant: "HP", category: "fuel" },
    "indian oil": { merchant: "Indian Oil", category: "fuel" },
    "bharat petroleum": { merchant: "BP", category: "fuel" },
    "shell": { merchant: "Shell", category: "fuel" },
    "fuel": { merchant: "Fuel Station", category: "fuel" },
    "petrol": { merchant: "Petrol Pump", category: "fuel" },

    // Health
    "pharmeasy": { merchant: "PharmEasy", category: "health-pharmacy" },
    "1mg": { merchant: "1mg (Tata)", category: "health-pharmacy" },
    "apollo": { merchant: "Apollo Pharmacy", category: "health-pharmacy" },
    "netmeds": { merchant: "Netmeds", category: "health-pharmacy" },
    "practo": { merchant: "Practo", category: "health-pharmacy" },

    // Education
    "unacademy": { merchant: "Unacademy", category: "education" },
    "byju": { merchant: "Byju's", category: "education" },
    "upgrad": { merchant: "upGrad", category: "education" },
    "coursera": { merchant: "Coursera", category: "education" },
    "udemy": { merchant: "Udemy", category: "education" },
};

// Payment app detection patterns
const PAYMENT_APP_PATTERNS: Record<string, string> = {
    "phonepe": "PhonePe",
    "google pay": "Google Pay",
    "gpay": "Google Pay",
    "googlepay": "Google Pay",
    "paytm": "Paytm",
    "amazon pay": "Amazon Pay",
    "cred": "CRED",
    "whatsapp": "WhatsApp Pay",
    "bhim": "BHIM",
    "upi": "UPI",
};

interface ParsedTransaction {
    description: string;
    amount: number;
    type: "debit" | "credit";
    date: string;
    merchant: string;
    category: string;
    paymentApp: string;
    confidence: number;
}

/**
 * Parse a line from bank statement or SMS into a transaction
 */
function parseTransactionLine(line: string): ParsedTransaction | null {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 10) return null;

    // Try to extract amount — various formats
    const amountPatterns = [
        /(?:Rs\.?|INR|₹)\s*([0-9,]+(?:\.\d{1,2})?)/i,
        /(?:debited|credited|paid|received)\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+(?:\.\d{1,2})?)/i,
        /([0-9,]+(?:\.\d{1,2})?)\s*(?:debited|credited)/i,
    ];

    let amount = 0;
    for (const pattern of amountPatterns) {
        const match = trimmed.match(pattern);
        if (match) {
            amount = parseFloat(match[1].replace(/,/g, ""));
            break;
        }
    }

    if (amount <= 0) return null;

    // Detect debit/credit
    const isCredit = /credited|received|refund|cashback/i.test(trimmed);
    const type = isCredit ? "credit" : "debit";

    // Try to extract date
    const datePatterns = [
        /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
        /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})/i,
    ];

    let date = new Date().toISOString().split("T")[0];
    for (const pattern of datePatterns) {
        const match = trimmed.match(pattern);
        if (match) {
            try {
                const parsed = new Date(match[1]);
                if (!isNaN(parsed.getTime())) {
                    date = parsed.toISOString().split("T")[0];
                }
            } catch {
                // Keep default date
            }
            break;
        }
    }

    // Detect merchant and category
    const lowerLine = trimmed.toLowerCase();
    let merchant = "Unknown";
    let category = "other";
    let confidence = 0.4; // default

    for (const [pattern, info] of Object.entries(MERCHANT_CATEGORY_MAP)) {
        if (lowerLine.includes(pattern)) {
            merchant = info.merchant;
            category = info.category;
            confidence = 0.9;
            break;
        }
    }

    // If no merchant match, try to extract from UPI reference
    if (merchant === "Unknown") {
        const upiMatch = lowerLine.match(/(?:to|from|paid to|transferred to)\s+([a-zA-Z\s]+?)(?:\s+(?:via|through|upi|ref|a\/c))/i);
        if (upiMatch) {
            merchant = upiMatch[1].trim();
            confidence = 0.6;
        }
    }

    // Detect payment app
    let paymentApp = "Unknown";
    for (const [pattern, appName] of Object.entries(PAYMENT_APP_PATTERNS)) {
        if (lowerLine.includes(pattern)) {
            paymentApp = appName;
            break;
        }
    }

    return {
        description: trimmed.slice(0, 200),
        amount,
        type,
        date,
        merchant,
        category,
        paymentApp,
        confidence,
    };
}

// ============================================================
// API ROUTE
// ============================================================

const importSchema = z.object({
    text: z.string().min(10, "Text too short").max(50000, "Text too long — paste one month at a time"),
    source: z.enum(["sms", "bank-statement", "manual-paste"]).default("manual-paste"),
});

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await getSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Rate limit
        const rateLimitResult = rateLimiter.check(user.id);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please wait." },
                { status: 429 }
            );
        }

        // Parse input
        const body = await request.json();
        const parsed = importSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { text, source } = parsed.data;

        // Split into lines and parse each
        const lines = text.split(/\n|\r\n/).filter((l: string) => l.trim().length > 0);
        const parsedTransactions: ParsedTransaction[] = [];
        const failedLines: string[] = [];

        for (const line of lines) {
            const txn = parseTransactionLine(line);
            if (txn && txn.type === "debit") { // Only track spending
                parsedTransactions.push(txn);
            } else if (line.trim().length > 20) {
                failedLines.push(line.trim().slice(0, 100));
            }
        }

        // Insert into database
        let insertedCount = 0;
        const errors: string[] = [];

        for (const txn of parsedTransactions) {
            try {
                const parsedDate = new Date(txn.date);
                const transactionDate = Number.isNaN(parsedDate.getTime())
                    ? new Date().toISOString()
                    : parsedDate.toISOString();

                const { error: insertError } = await supabase
                    .from("user_transactions")
                    .insert({
                        user_id: user.id,
                        amount: txn.amount,
                        merchant_name: txn.merchant,
                        category: txn.category,
                        payment_app: txn.paymentApp,
                        transaction_date: transactionDate,
                        description: txn.description,
                        source: source,
                    });

                if (insertError) {
                    errors.push(`Failed to import: ${txn.merchant} ₹${txn.amount}`);
                } else {
                    insertedCount++;
                }
            } catch {
                errors.push(`Error importing: ${txn.merchant} ₹${txn.amount}`);
            }
        }

        // Calculate quick insights
        const totalSpend = parsedTransactions.reduce((s, t) => s + t.amount, 0);
        const categoryBreakdown: Record<string, number> = {};
        for (const txn of parsedTransactions) {
            categoryBreakdown[txn.category] = (categoryBreakdown[txn.category] || 0) + txn.amount;
        }

        const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

        return NextResponse.json({
            success: true,
            imported: insertedCount,
            total: parsedTransactions.length,
            failed: failedLines.length,
            failedLines: failedLines.slice(0, 5), // Show first 5 failed lines
            errors: errors.slice(0, 5),
            quickInsight: {
                totalSpend: totalSpend,
                transactionCount: parsedTransactions.length,
                topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
                categoryBreakdown,
                tip: topCategory 
                    ? `Your biggest spend is ${topCategory[0]} (₹${topCategory[1].toFixed(0)}). Ask PayWise AI how to save on ${topCategory[0]}!`
                    : "Start tracking to get personalized savings tips!",
            },
            reviewTransactions: parsedTransactions.slice(0, 20).map((t) => ({
                merchant: t.merchant,
                amount: t.amount,
                category: t.category,
                paymentApp: t.paymentApp,
                date: t.date,
                confidence: t.confidence,
            })),
        });
    } catch (error) {
        console.error("[Transaction Import Error]", error);
        return NextResponse.json(
            { error: "Failed to import transactions" },
            { status: 500 }
        );
    }
}
