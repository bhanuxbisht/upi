/**
 * Data Deletion API — DPDP Act Right to Erasure
 * DELETE: Permanently delete all user data
 */

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { deleteAllUserData } from "@/services/profiles";
import { logAudit } from "@/lib/security/audit";
import { createRateLimiter } from "@/lib/rate-limit";

const rateLimiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });

export async function DELETE() {
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

        // Log before deletion (audit must capture this)
        await logAudit({
            userId: user.id,
            action: "delete_account",
            resourceType: "account",
            metadata: { reason: "user_requested" },
        });

        await deleteAllUserData(user.id);

        return NextResponse.json({
            message: "All your data has been permanently deleted.",
            deleted_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Data Delete]", error);
        return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
    }
}
