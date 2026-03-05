import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

/** GET — List all strategies */
export async function GET() {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase } = auth;

        const { data, error } = await supabase
            .from("knowledge_strategies")
            .select("*")
            .order("category", { ascending: true })
            .order("title", { ascending: true });

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

/** POST — Create or update a strategy */
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase, user } = auth;

        const body = await request.json();

        if (!body.id || !body.title || !body.category || !body.difficulty) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: id, title, category, difficulty" },
                { status: 400 }
            );
        }

        const record = {
            id: body.id,
            title: body.title,
            category: body.category,
            difficulty: body.difficulty,
            monthly_savings_min: body.monthly_savings_min ?? 0,
            monthly_savings_max: body.monthly_savings_max ?? 0,
            steps: body.steps || [],
            requirements: body.requirements || [],
            warnings: body.warnings || [],
            applicable_to: body.applicable_to || [],
            is_active: body.is_active ?? true,
            confidence_level: body.confidence_level || "verified",
            source_url: body.source_url || null,
            last_verified_date: new Date().toISOString(),
            verified_by: user.email || "admin",
        };

        const { data, error } = await supabase
            .from("knowledge_strategies")
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

/** DELETE — Delete a strategy by ID */
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
            .from("knowledge_strategies")
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
