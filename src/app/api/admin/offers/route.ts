import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin-auth";
import { adminOfferSchema } from "@/lib/validations";
import { publishOutboxEvent } from "@/lib/events/outbox";

function revalidateOfferDependentPaths() {
    // Keep customer-facing offer data fresh after admin mutations.
    revalidatePath("/offers");
    revalidatePath("/recommend");
    revalidatePath("/admin");
}

/** POST — Create a new offer (admin only) */
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase, user } = auth;

        const body = await request.json();
        const parsed = adminOfferSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const { data: offer, error } = await supabase
            .from("offers")
            .insert({
                merchant_id: data.merchant_id,
                payment_app_id: data.payment_app_id,
                type: data.type,
                title: data.title,
                description: data.description,
                cashback_amount: data.cashback_amount ?? null,
                cashback_percent: data.cashback_percent ?? null,
                max_cashback: data.max_cashback ?? null,
                min_transaction: data.min_transaction ?? null,
                promo_code: data.promo_code ?? null,
                valid_from: data.valid_from || new Date().toISOString(),
                valid_to: data.valid_to,
                terms: data.terms ?? null,
                source_url: data.source_url || null,
                status: data.status,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        try {
            await publishOutboxEvent(
                {
                    eventType: "offer.created",
                    aggregateType: "offer",
                    aggregateId: offer.id,
                    userId: user.id,
                    idempotencyKey: `offer:${offer.id}:created`,
                    payload: {
                        status: offer.status,
                        valid_to: offer.valid_to,
                        verified_count: offer.verified_count,
                    },
                },
                { supabase }
            );
        } catch (eventError) {
            console.warn("[Admin Offers] Failed to enqueue offer.created event:", eventError);
        }

        revalidateOfferDependentPaths();

        return NextResponse.json({ success: true, data: offer }, { status: 201 });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

/** GET — List all offers including expired/pending (admin only) */
export async function GET() {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase } = auth;

        const { data, error } = await supabase
            .from("offers")
            .select(`*, merchant:merchants(id, name, slug), payment_app:payment_apps(id, name, slug, color)`)
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: data ?? [] });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

/** PATCH — Update offer status (admin only) */
export async function PATCH(request: NextRequest) {
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

        const { id, status } = body as Record<string, unknown>;
        const VALID_STATUSES = ["active", "pending", "expired", "rejected"];

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { success: false, error: "id is required and must be a string" },
                { status: 400 }
            );
        }
        if (!status || typeof status !== "string" || !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { success: false, error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
                { status: 400 }
            );
        }

        const { data: updatedOffer, error } = await supabase
            .from("offers")
            .update({ status })
            .eq("id", id)
            .select("id, status, updated_at")
            .maybeSingle();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        if (!updatedOffer) {
            return NextResponse.json(
                { success: false, error: "Offer not found" },
                { status: 404 }
            );
        }

        try {
            await publishOutboxEvent(
                {
                    eventType: "offer.updated",
                    aggregateType: "offer",
                    aggregateId: updatedOffer.id,
                    userId: user.id,
                    idempotencyKey: `offer:${updatedOffer.id}:updated:${updatedOffer.updated_at}`,
                    payload: {
                        status: updatedOffer.status,
                        updated_at: updatedOffer.updated_at,
                    },
                },
                { supabase }
            );
        } catch (eventError) {
            console.warn("[Admin Offers] Failed to enqueue offer.updated event:", eventError);
        }

        revalidateOfferDependentPaths();

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

/** DELETE — Remove an offer (admin only) */
export async function DELETE(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase, user } = auth;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "id is required" },
                { status: 400 }
            );
        }

        const { data: deletedOffer, error } = await supabase
            .from("offers")
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

        if (!deletedOffer) {
            return NextResponse.json(
                { success: false, error: "Offer not found" },
                { status: 404 }
            );
        }

        try {
            await publishOutboxEvent(
                {
                    eventType: "offer.deleted",
                    aggregateType: "offer",
                    aggregateId: deletedOffer.id,
                    userId: user.id,
                    idempotencyKey: `offer:${deletedOffer.id}:deleted`,
                    payload: {
                        deleted_at: new Date().toISOString(),
                    },
                },
                { supabase }
            );
        } catch (eventError) {
            console.warn("[Admin Offers] Failed to enqueue offer.deleted event:", eventError);
        }

        revalidateOfferDependentPaths();

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
