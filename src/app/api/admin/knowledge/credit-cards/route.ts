import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

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

        const body = await request.json();

        // Basic validation
        if (!body.id || !body.bank || !body.name || !body.network || !body.tier) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: id, bank, name, network, tier" },
                { status: 400 }
            );
        }

        const record = {
            id: body.id,
            bank: body.bank,
            name: body.name,
            annual_fee: body.annual_fee ?? 0,
            fee_waiver: body.fee_waiver || null,
            joining_fee: body.joining_fee ?? 0,
            network: body.network,
            tier: body.tier,
            rewards: body.rewards || [],
            lounge_access: body.lounge_access || null,
            fuel_surcharge_waiver: body.fuel_surcharge_waiver ?? false,
            best_for: body.best_for || [],
            affiliate_link: body.affiliate_link || null,
            affiliate_payout: body.affiliate_payout || null,
            income_requirement: body.income_requirement || null,
            pros: body.pros || [],
            cons: body.cons || [],
            is_active: body.is_active ?? true,
            confidence_level: body.confidence_level || "verified",
            source_url: body.source_url || null,
            last_verified_date: new Date().toISOString(),
            verified_by: user.email || "admin",
        };

        const { data, error } = await supabase
            .from("knowledge_credit_cards")
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

/** DELETE — Delete a credit card by ID */
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
            .from("knowledge_credit_cards")
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
