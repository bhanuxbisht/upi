import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SavingsCounter } from "@/components/savings/savings-counter";
import { SavingsHistory } from "@/components/savings/savings-history";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "My Savings — PayWise",
    description: "Track your total savings and see how much you've saved using PayWise recommendations.",
};

export default async function SavingsPage() {
    const supabase = await getSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Require authentication
    if (!user) {
        redirect("/login?redirect=/savings");
    }

    return (
        <div className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-full bg-emerald-100 p-2">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        My Savings
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Track every rupee you save using PayWise recommendations
                </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-8">
                <SavingsCounter variant="full" />
            </div>

            {/* History */}
            <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Savings Activity
                </h2>
                <SavingsHistory />
            </div>
        </div>
    );
}
