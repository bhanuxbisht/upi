import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { ADMIN_EMAILS } from "@/lib/constants";
import { NextResponse } from "next/server";

/**
 * Verify the current user is an admin.
 * Returns { user, supabase } if authorized, or a NextResponse error.
 */
export async function verifyAdmin() {
    const supabase = await getSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            ),
        };
    }

    // In dev mode (empty whitelist), allow all logged-in users
    const isAdmin =
        ADMIN_EMAILS.length === 0 ||
        ADMIN_EMAILS.includes(user.email ?? "");

    if (!isAdmin) {
        return {
            error: NextResponse.json(
                { success: false, error: "Admin access required" },
                { status: 403 }
            ),
        };
    }

    // --- Verification Passed ---

    // Return the POWERFUL admin client (bypasses RLS) so we can write to tables
    // that don't have public INSERT/UPDATE policies.
    const adminSupabase = getSupabaseAdminClient();

    return { user, supabase: adminSupabase };
}

