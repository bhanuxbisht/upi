import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { savingsTrackLimiter } from "@/lib/rate-limit";

/**
 * POST /api/savings/track
 * Track a new saving event when user uses a recommended offer
 */

const trackSavingSchema = z.object({
    offer_id: z.string().uuid().optional(),
    amount_saved: z.number().positive("Amount saved must be positive").max(100000, "Amount saved too large"),
    transaction_amount: z.number().positive("Transaction amount must be positive").max(10000000, "Transaction amount too large").optional(),
    merchant_name: z.string().min(1, "Merchant name is required").max(200, "Merchant name too long"),
    payment_app_name: z.string().min(1, "Payment app name is required").max(200, "Payment app name too long"),
    category: z.string().max(100, "Category too long").optional(),
    notes: z.string().max(500, "Notes too long").optional(),
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        // Rate limiting — max 20 saves per minute per user
        const rateLimit = savingsTrackLimiter.check(user.id);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(rateLimit.resetAt),
                    },
                }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const parsed = trackSavingSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: parsed.error.issues[0]?.message ?? "Validation failed",
                    details: parsed.error.issues
                },
                { status: 400 }
            );
        }

        const data = parsed.data;

        // Insert saving record
        const { data: saving, error: insertError } = await supabase
            .from("user_savings")
            .insert({
                user_id: user.id,
                offer_id: data.offer_id ?? null,
                amount_saved: data.amount_saved,
                transaction_amount: data.transaction_amount ?? null,
                merchant_name: data.merchant_name,
                payment_app_name: data.payment_app_name,
                category: data.category ?? null,
                notes: data.notes ?? null,
            })
            .select()
            .single();

        if (insertError) {
            console.error("[Track Saving Error]", insertError);
            return NextResponse.json(
                { success: false, error: "Failed to track saving" },
                { status: 500 }
            );
        }

        // Fetch updated stats
        const { data: stats } = await supabase
            .from("user_savings_stats")
            .select("*")
            .eq("user_id", user.id)
            .single();

        return NextResponse.json({
            success: true,
            data: {
                saving,
                stats: stats ?? null,
            },
        });
    } catch (error) {
        console.error("[Track Saving Error]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
