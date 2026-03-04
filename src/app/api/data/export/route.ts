/**
 * Data Export API — DPDP Act Compliance
 * GET: Export all user data as JSON
 */

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { exportUserData } from "@/services/profiles";
import { logAudit } from "@/lib/security/audit";
import { createRateLimiter } from "@/lib/rate-limit";

const rateLimiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 });

export async function GET() {
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

        const data = await exportUserData(user.id);

        await logAudit({
            userId: user.id,
            action: "export_data",
            resourceType: "account",
            metadata: {
                transactions_count: data.transactions.length,
                savings_count: data.savings.length,
            },
        });

        return NextResponse.json({ data });
    } catch (error) {
        console.error("[Data Export]", error);
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
    }
}
