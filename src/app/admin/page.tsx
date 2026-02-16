import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMerchants, getPaymentApps } from "@/services/lookups";
import { ADMIN_EMAILS } from "@/lib/constants";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Admin Panel — PayWise",
    description: "Manage offers, review community submissions, and add new deals.",
};

export default async function AdminPage() {
    // --- Auth gate: must be logged in AND be an admin email ---
    const supabase = await getSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If not logged in → redirect to login
    if (!user) {
        redirect("/login?redirect=/admin");
    }

    // If logged in but not admin → show access denied
    const isAdmin =
        ADMIN_EMAILS.length === 0 || // If whitelist empty, allow all (dev mode)
        ADMIN_EMAILS.includes(user.email ?? "");

    if (!isAdmin) {
        return (
            <div className="mx-auto max-w-2xl px-4 pt-40 pb-20 text-center">
                <Shield className="mx-auto mb-4 h-16 w-16 text-red-400" />
                <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                <p className="mt-2 text-muted-foreground">
                    You don&apos;t have admin access. Contact the PayWise team if you
                    believe this is a mistake.
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                    Logged in as: {user.email}
                </p>
            </div>
        );
    }

    // --- Admin is authenticated — load data ---
    let merchants: { id: string; name: string; slug: string }[] = [];
    let paymentApps: { id: string; name: string; slug: string; color: string }[] =
        [];

    try {
        merchants = await getMerchants();
        paymentApps = await getPaymentApps();
    } catch {
        // Will show empty dropdowns if DB not connected
    }

    return (
        <div className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Admin Panel
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Add offers, manage existing ones, and review community submissions.
                    </p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700 sm:flex">
                    <Shield className="h-4 w-4" />
                    {user.email}
                </div>
            </div>

            <AdminDashboard merchants={merchants} paymentApps={paymentApps} />
        </div>
    );
}
