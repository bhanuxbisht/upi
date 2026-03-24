import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

/**
 * ⛔ DISABLED — Seed from Code endpoint is intentionally blocked.
 *
 * WHY: This endpoint previously seeded old, unverified hardcoded TypeScript
 * mock data (HDFC Millennia, Axis ACE, ICICI Amazon Pay, etc.) directly into
 * Supabase, overwriting verified data every time it was clicked.
 *
 * HOW TO SEED CORRECTLY: Use the verified SQL migration files located in
 * supabase/seed_sbi_knowledge.sql and run them directly in the Supabase SQL Editor.
 * These files contain accurate, CTO-verified card data with deterministic reward_math.
 *
 * DO NOT re-enable this endpoint without replacing the hardcoded TypeScript
 * knowledge files with Supabase-sourced data first.
 */
export async function POST() {
    // Verify admin to prevent unauthenticated access even to the error message
    const auth = await verifyAdmin();
    if ("error" in auth) return auth.error;

    return NextResponse.json(
        {
            success: false,
            error: "⛔ Seed from Code is disabled. All knowledge data must be inserted via verified SQL files in supabase/seed_sbi_knowledge.sql. Run that file directly in the Supabase SQL Editor.",
            action: "Use the Supabase SQL Editor → paste supabase/seed_sbi_knowledge.sql → Run",
        },
        { status: 410 } // 410 Gone — intentionally removed
    );
}
