import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

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

        const body = await request.json();

        if (!body.id || !body.name || !body.slug) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: id, name, slug" },
                { status: 400 }
            );
        }

        const record = {
            id: body.id,
            name: body.name,
            slug: body.slug,
            market_share: body.market_share ?? null,
            monthly_active_users: body.monthly_active_users || null,
            color: body.color || "#000000",
            strength_categories: body.strength_categories || [],
            weak_categories: body.weak_categories || [],
            reward_tiers: body.reward_tiers || [],
            linked_card_benefits: body.linked_card_benefits || [],
            strategies: body.strategies || [],
            recurring_payment_support: body.recurring_payment_support ?? false,
            auto_pay_support: body.auto_pay_support ?? false,
            credit_card_link_support: body.credit_card_link_support ?? false,
            split_bill_support: body.split_bill_support ?? false,
            is_active: body.is_active ?? true,
            confidence_level: body.confidence_level || "verified",
            source_url: body.source_url || null,
            last_verified_date: new Date().toISOString(),
            verified_by: user.email || "admin",
        };

        const { data, error } = await supabase
            .from("knowledge_upi_apps")
            .upsert(record, { onConflict: "id" })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
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
        const { supabase } = auth;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing id parameter" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("knowledge_upi_apps")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
