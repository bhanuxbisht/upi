import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin-auth";
import { publishOutboxEvent } from "@/lib/events/outbox";
import { z } from "zod";

const upiAppSchema = z.object({
    id: z.string().trim().min(1, "id is required").max(100),
    name: z.string().trim().min(1, "name is required").max(120),
    slug: z.string().trim().min(1, "slug is required").max(120).regex(/^[a-z0-9-]+$/, "slug can only contain lowercase letters, numbers, and hyphens"),
    market_share: z.number().min(0).max(100).nullable().optional(),
    monthly_active_users: z.string().max(80).nullable().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "color must be a valid hex value").optional(),
    strength_categories: z.array(z.string().trim().min(1).max(100)).max(60).optional(),
    weak_categories: z.array(z.string().trim().min(1).max(100)).max(60).optional(),
    reward_tiers: z.array(z.record(z.string(), z.unknown())).max(100).optional(),
    linked_card_benefits: z.array(z.string().trim().min(1).max(300)).max(100).optional(),
    strategies: z.array(z.string().trim().min(1).max(300)).max(100).optional(),
    recurring_payment_support: z.boolean().optional(),
    auto_pay_support: z.boolean().optional(),
    credit_card_link_support: z.boolean().optional(),
    split_bill_support: z.boolean().optional(),
    is_active: z.boolean().optional(),
    confidence_level: z.enum(["verified", "community", "unverified"]).optional(),
    source_url: z.string().url().nullable().optional(),
    last_verified_date: z.string().datetime().optional(),
});

function revalidateKnowledgePaths() {
    revalidatePath("/admin");
    revalidatePath("/ask");
}

/** GET — List all UPI apps */
export async function GET() {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase } = auth;

        const { data, error } = await supabase
            .from("knowledge_upi_apps")
            .select("*")
            .order("market_share", { ascending: false });

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

/** POST — Create or update a UPI app */
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase, user } = auth;

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        const parsed = upiAppSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const { data: existingRecord } = await supabase
            .from("knowledge_upi_apps")
            .select("last_verified_date")
            .eq("id", data.id)
            .maybeSingle();

        const resolvedLastVerifiedDate =
            data.last_verified_date ?? existingRecord?.last_verified_date ?? new Date().toISOString();

        const record = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            market_share: data.market_share ?? null,
            monthly_active_users: data.monthly_active_users ?? null,
            color: data.color || "#000000",
            strength_categories: data.strength_categories || [],
            weak_categories: data.weak_categories || [],
            reward_tiers: data.reward_tiers || [],
            linked_card_benefits: data.linked_card_benefits || [],
            strategies: data.strategies || [],
            recurring_payment_support: data.recurring_payment_support ?? false,
            auto_pay_support: data.auto_pay_support ?? false,
            credit_card_link_support: data.credit_card_link_support ?? false,
            split_bill_support: data.split_bill_support ?? false,
            is_active: data.is_active ?? true,
            confidence_level: data.confidence_level || "verified",
            source_url: data.source_url ?? null,
            last_verified_date: resolvedLastVerifiedDate,
            verified_by: user.email || "admin",
        };

        const { data: upsertedApp, error } = await supabase
            .from("knowledge_upi_apps")
            .upsert(record, { onConflict: "id" })
            .select("id, slug, name, updated_at, is_active, confidence_level, last_verified_date")
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        revalidateKnowledgePaths();

        try {
            await publishOutboxEvent(
                {
                    eventType: "knowledge.upi-app.upserted",
                    aggregateType: "knowledge_upi_apps",
                    aggregateId: upsertedApp.id,
                    userId: user.id,
                    idempotencyKey: `knowledge-upi-app:${upsertedApp.id}:upsert:${upsertedApp.updated_at}`,
                    payload: {
                        slug: upsertedApp.slug,
                        is_active: upsertedApp.is_active,
                        confidence_level: upsertedApp.confidence_level,
                        last_verified_date: upsertedApp.last_verified_date,
                    },
                },
                { supabase }
            );
        } catch (eventError) {
            console.warn("[Admin Knowledge UPI Apps] Failed to enqueue event:", eventError);
        }

        return NextResponse.json({ success: true, data: upsertedApp }, { status: 201 });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

/** DELETE — Delete a UPI app by ID */
export async function DELETE(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase, user } = auth;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing id parameter" },
                { status: 400 }
            );
        }

        const { data: deletedApp, error } = await supabase
            .from("knowledge_upi_apps")
            .delete()
            .eq("id", id)
            .select("id, slug")
            .maybeSingle();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        if (!deletedApp) {
            return NextResponse.json(
                { success: false, error: "UPI app not found" },
                { status: 404 }
            );
        }

        revalidateKnowledgePaths();

        try {
            await publishOutboxEvent(
                {
                    eventType: "knowledge.upi-app.deleted",
                    aggregateType: "knowledge_upi_apps",
                    aggregateId: deletedApp.id,
                    userId: user.id,
                    idempotencyKey: `knowledge-upi-app:${deletedApp.id}:deleted:${Date.now()}`,
                    payload: {
                        slug: deletedApp.slug,
                        deleted_at: new Date().toISOString(),
                    },
                },
                { supabase }
            );
        } catch (eventError) {
            console.warn("[Admin Knowledge UPI Apps] Failed to enqueue delete event:", eventError);
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
