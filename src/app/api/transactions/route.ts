/**
 * Transactions API Route
 * GET: Fetch user's transactions (filtered, paginated)
 * POST: Log a new transaction
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createTransaction, getTransactions } from "@/services/transactions";
import { logAudit } from "@/lib/security/audit";
import { createRateLimiter } from "@/lib/rate-limit";
import { z } from "zod";

const readLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60_000 });
const writeLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

const transactionSchema = z.object({
    merchant_name: z.string().min(1).max(200, "Merchant name too long"),
    category: z.string().min(1).max(100, "Category too long"),
    amount: z.number().positive("Amount must be positive").max(10_000_000, "Amount too large"),
    payment_app: z.string().min(1).max(100, "Payment app name too long"),
    payment_method: z.enum(["upi", "credit_card", "debit_card", "wallet", "bnpl", "net_banking"]).optional(),
    card_used: z.string().max(200).optional(),
    cashback_received: z.number().min(0).max(100_000).optional(),
    offer_used_id: z.string().uuid().optional(),
    notes: z.string().max(500).optional(),
    transaction_date: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const rl = readLimiter.check(user.id);
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { searchParams } = new URL(request.url);
        const filters = {
            category: searchParams.get("category") || undefined,
            payment_app: searchParams.get("payment_app") || undefined,
            from_date: searchParams.get("from_date") || undefined,
            to_date: searchParams.get("to_date") || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
        };

        const result = await getTransactions(user.id, filters);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[Transactions GET]", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const rl = writeLimiter.check(user.id);
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await request.json();
        const parsed = transactionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const transaction = await createTransaction(user.id, parsed.data);

        await logAudit({
            userId: user.id,
            action: "track_saving",
            resourceType: "transaction",
            resourceId: transaction.id,
            metadata: { amount: parsed.data.amount, merchant: parsed.data.merchant_name },
        });

        return NextResponse.json({ data: transaction }, { status: 201 });
    } catch (error) {
        console.error("[Transactions POST]", error);
        return NextResponse.json({ error: "Failed to log transaction" }, { status: 500 });
    }
}
