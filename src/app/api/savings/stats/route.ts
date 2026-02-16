import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { savingsStatsLimiter } from "@/lib/rate-limit";

/**
 * GET /api/savings/stats
 * Get user's savings statistics and recent activity
 */

export async function GET() {
    try {
        const supabase = await getSupabaseServerClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        // Rate limiting — max 30 stats checks per minute per user
        const rateLimit = savingsStatsLimiter.check(user.id);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }

        // Fetch user's stats
        const { data: stats, error: statsError } = await supabase
            .from("user_savings_stats")
            .select("*")
            .eq("user_id", user.id)
            .single();

        // If no stats exist yet, return zeros
        const userStats = stats ?? {
            user_id: user.id,
            total_saved: 0,
            total_transactions: 0,
            saved_this_week: 0,
            saved_this_month: 0,
            saved_this_year: 0,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null,
        };

        // Fetch recent savings (last 20)
        const { data: recentSavings, error: savingsError } = await supabase
            .from("user_savings")
            .select(`
                id,
                amount_saved,
                transaction_amount,
                merchant_name,
                payment_app_name,
                category,
                notes,
                created_at,
                offer:offers(id, title)
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);

        // Fetch category breakdown
        const { data: categoryBreakdown } = await supabase
            .from("user_savings")
            .select("category, amount_saved")
            .eq("user_id", user.id)
            .not("category", "is", null);

        // Aggregate by category
        const categoryStats = (categoryBreakdown ?? []).reduce((acc, item) => {
            const cat = item.category ?? "Other";
            acc[cat] = (acc[cat] ?? 0) + Number(item.amount_saved);
            return acc;
        }, {} as Record<string, number>);

        // Fetch monthly trend (last 6 months)
        const { data: monthlyData } = await supabase
            .from("user_savings")
            .select("created_at, amount_saved")
            .eq("user_id", user.id)
            .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
            .order("created_at", { ascending: true });

        // Group by month
        const monthlyTrend = (monthlyData ?? []).reduce((acc, item) => {
            const month = new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short"
            });
            acc[month] = (acc[month] ?? 0) + Number(item.amount_saved);
            return acc;
        }, {} as Record<string, number>);

        return NextResponse.json({
            success: true,
            data: {
                stats: userStats,
                recentSavings: recentSavings ?? [],
                categoryBreakdown: Object.entries(categoryStats).map(([category, total]) => ({
                    category,
                    total,
                })),
                monthlyTrend: Object.entries(monthlyTrend).map(([month, total]) => ({
                    month,
                    total,
                })),
            },
        });
    } catch (error) {
        console.error("[Get Savings Stats Error]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
