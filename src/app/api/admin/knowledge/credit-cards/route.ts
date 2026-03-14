import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin-auth";
import { publishOutboxEvent } from "@/lib/events/outbox";
import { z } from "zod";

const creditCardSchema = z.object({
    id: z.string().trim().min(1, "id is required").max(100),
    bank: z.string().trim().min(1, "bank is required").max(120),
    name: z.string().trim().min(1, "name is required").max(160),
    annual_fee: z.number().min(0).max(1_000_000).optional(),
    fee_waiver: z.string().max(300).nullable().optional(),
    joining_fee: z.number().min(0).max(1_000_000).optional(),
    network: z.enum(["Visa", "Mastercard", "RuPay", "Amex", "Diners"]),
    tier: z.enum(["entry", "mid", "premium", "super-premium"]),
    rewards: z.array(z.object({
        category: z.string().trim().min(1).max(120),
        rewardRate: z.number().min(0).max(100),
        rewardType: z.enum(["cashback", "points", "miles"]),
        pointsPerRupee: z.number().min(0).optional(),
        pointValue: z.number().min(0).optional(),
        cap: z.number().min(0).optional(),
        minSpend: z.number().min(0).optional(),
        notes: z.string().max(300).optional(),
    }).passthrough()).max(50).optional(),
    lounge_access: z.string().max(300).nullable().optional(),
    fuel_surcharge_waiver: z.boolean().optional(),
    best_for: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
    affiliate_link: z.string().url().nullable().optional(),
    affiliate_payout: z.number().min(0).max(1_000_000).nullable().optional(),
    income_requirement: z.string().max(200).nullable().optional(),
    pros: z.array(z.string().trim().min(1).max(240)).max(50).optional(),
    cons: z.array(z.string().trim().min(1).max(240)).max(50).optional(),
    is_active: z.boolean().optional(),
    confidence_level: z.enum(["verified", "community", "unverified"]).optional(),
    source_url: z.string().url().nullable().optional(),
    last_verified_date: z.string().datetime().optional(),
});

function revalidateKnowledgePaths() {
    revalidatePath("/admin");
    revalidatePath("/ask");
}

/** GET — List all credit cards (admin sees all, including inactive) */
export async function GET() {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase } = auth;

        const { data, error } = await supabase
            .from("knowledge_credit_cards")
            .select("*")
            .order("bank", { ascending: true })
            .order("name", { ascending: true });

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

/** POST — Create or update a credit card */
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

        const parsed = creditCardSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
                { status: 400 }
            );
        }

        const payload = parsed.data;

        const { data: existingRecord } = await supabase
            .from("knowledge_credit_cards")
            .select("last_verified_date")
            .eq("id", payload.id)
            .maybeSingle();

        const resolvedLastVerifiedDate =
            payload.last_verified_date ?? existingRecord?.last_verified_date ?? new Date().toISOString();

        const record = {
            id: payload.id,
            bank: payload.bank,
            name: payload.name,
            annual_fee: payload.annual_fee ?? 0,
            fee_waiver: payload.fee_waiver ?? null,
            joining_fee: payload.joining_fee ?? 0,
            network: payload.network,
            tier: payload.tier,
            rewards: payload.rewards || [],
            lounge_access: payload.lounge_access ?? null,
            fuel_surcharge_waiver: payload.fuel_surcharge_waiver ?? false,
            best_for: payload.best_for || [],
            affiliate_link: payload.affiliate_link ?? null,
            affiliate_payout: payload.affiliate_payout ?? null,
            income_requirement: payload.income_requirement ?? null,
            pros: payload.pros || [],
            cons: payload.cons || [],
            is_active: payload.is_active ?? true,
            confidence_level: payload.confidence_level || "verified",
            source_url: payload.source_url ?? null,
            last_verified_date: resolvedLastVerifiedDate,
            verified_by: user.email || "admin",
        };

        const { data, error } = await supabase
            .from("knowledge_credit_cards")
            .upsert(record, { onConflict: "id" })
            .select("id, bank, name, updated_at, is_active, confidence_level, last_verified_date")
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
                    eventType: "knowledge.credit-card.upserted",
                    aggregateType: "knowledge_credit_cards",
                    aggregateId: data.id,
                    userId: user.id,
                    idempotencyKey: `knowledge-credit-card:${data.id}:upsert:${data.updated_at}`,
                    payload: {
                        is_active: data.is_active,
                        confidence_level: data.confidence_level,
                        last_verified_date: data.last_verified_date,
                    },
                },
                { supabase }
            );
        } catch (eventError) {
            console.warn("[Admin Knowledge Credit Cards] Failed to enqueue event:", eventError);
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

/** DELETE — Delete a credit card by ID */
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

        const { data: deletedCard, error } = await supabase
            .from("knowledge_credit_cards")
            .delete()
            .eq("id", id)
            .select("id")
            .maybeSingle();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        if (!deletedCard) {
            return NextResponse.json(
                { success: false, error: "Credit card not found" },
                { status: 404 }
            );
        }

        revalidateKnowledgePaths();

        try {
            await publishOutboxEvent(
                {
                    eventType: "knowledge.credit-card.deleted",
                    aggregateType: "knowledge_credit_cards",
                    aggregateId: deletedCard.id,
                    userId: user.id,
                    idempotencyKey: `knowledge-credit-card:${deletedCard.id}:deleted:${Date.now()}`,
                    payload: {
                        deleted_at: new Date().toISOString(),
                    },
                },
                { supabase }
            );
        } catch (eventError) {
            console.warn("[Admin Knowledge Credit Cards] Failed to enqueue delete event:", eventError);
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
