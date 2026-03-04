/**
 * Profile API Route
 * GET: Fetch user profile
 * PATCH: Update user profile
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getProfile, updateProfile } from "@/services/profiles";
import { logAudit } from "@/lib/security/audit";
import { createRateLimiter } from "@/lib/rate-limit";
import { z } from "zod";

const rateLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60_000 });

const profileUpdateSchema = z.object({
    preferred_apps: z.array(z.string().max(50)).max(20).optional(),
    cards: z
        .array(
            z.object({
                bank: z.string().max(100),
                type: z.enum(["credit", "debit"]),
                name: z.string().max(100),
                last4: z.string().max(4).optional(),
            })
        )
        .max(20)
        .optional(),
    wallets: z
        .array(
            z.object({
                app: z.string().max(50),
                balance: z.number().min(0).max(10_000_000),
            })
        )
        .max(20)
        .optional(),
    monthly_budget: z.number().positive().max(10_000_000).nullable().optional(),
    category_budgets: z.record(z.string(), z.number().positive().max(10_000_000)).optional(),
    notification_preferences: z
        .object({
            email_alerts: z.boolean().optional(),
            push_alerts: z.boolean().optional(),
            weekly_report: z.boolean().optional(),
            deal_expiry: z.boolean().optional(),
        })
        .optional(),
    spending_goals: z.record(z.string(), z.number()).optional(),
    onboarding_completed: z.boolean().optional(),
});

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

        const profile = await getProfile(user.id);

        return NextResponse.json({ data: profile });
    } catch (error) {
        console.error("[Profile GET]", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
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

        const body = await request.json();
        const parsed = profileUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const profile = await updateProfile(user.id, parsed.data);

        await logAudit({
            userId: user.id,
            action: "update_profile",
            resourceType: "profile",
            metadata: { fields_updated: Object.keys(parsed.data) },
        });

        return NextResponse.json({ data: profile });
    } catch (error) {
        console.error("[Profile PATCH]", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
