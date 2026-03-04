/**
 * Spending Analytics API Route
 * GET: Fetch user's spending analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSpendingAnalytics } from "@/services/transactions";
import { createRateLimiter } from "@/lib/rate-limit";

const rateLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

export async function GET(request: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const rl = rateLimiter.check(user.id);
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { searchParams } = new URL(request.url);
        const months = Math.min(Number(searchParams.get("months") || 3), 12);

        const analytics = await getSpendingAnalytics(user.id, months);

        return NextResponse.json({ data: analytics });
    } catch (error) {
        console.error("[Analytics]", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
