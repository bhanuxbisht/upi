import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

/** GET — List all community submissions (admin only) */
export async function GET() {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase } = auth;

        const { data, error } = await supabase
            .from("offer_submissions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

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

/** PATCH — Approve or reject a submission (admin only) */
export async function PATCH(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase } = auth;

        const body = await request.json();
        const { id, status } = body;

        if (!id || !["approved", "rejected"].includes(status)) {
            return NextResponse.json(
                { success: false, error: "id and status (approved/rejected) required" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("offer_submissions")
            .update({ status })
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
