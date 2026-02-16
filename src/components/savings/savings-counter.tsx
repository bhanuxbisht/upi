"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Wallet, Calendar, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SavingsStats {
    total_saved: number;
    total_transactions: number;
    saved_this_week: number;
    saved_this_month: number;
    saved_this_year: number;
    current_streak: number;
    longest_streak: number;
}

interface SavingsCounterProps {
    variant?: "compact" | "full";
    className?: string;
}

export function SavingsCounter({ variant = "compact", className = "" }: SavingsCounterProps) {
    const [stats, setStats] = useState<SavingsStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        try {
            const res = await fetch("/api/savings/stats");
            if (res.ok) {
                const json = await res.json();
                setStats(json.data?.stats ?? null);
            }
        } catch (error) {
            console.error("Failed to fetch savings stats:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-16 bg-muted rounded-lg"></div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    // Compact variant (for navbar/header)
    if (variant === "compact") {
        return (
            <div className={`flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 ${className}`}>
                <Wallet className="h-4 w-4 text-emerald-600" />
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Total Saved</span>
                    <span className="text-sm font-bold text-emerald-700">
                        ₹{stats.total_saved.toLocaleString("en-IN")}
                    </span>
                </div>
            </div>
        );
    }

    // Full variant (for dashboard)
    return (
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
            {/* Total Saved */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
                            <h3 className="mt-2 text-3xl font-bold text-emerald-700">
                                ₹{stats.total_saved.toLocaleString("en-IN")}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.total_transactions} transactions
                            </p>
                        </div>
                        <div className="rounded-full bg-emerald-100 p-3">
                            <Wallet className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* This Month */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">This Month</p>
                            <h3 className="mt-2 text-3xl font-bold text-blue-700">
                                ₹{stats.saved_this_month.toLocaleString("en-IN")}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.saved_this_week > 0 && `₹${stats.saved_this_week} this week`}
                            </p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* This Year */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">This Year</p>
                            <h3 className="mt-2 text-3xl font-bold text-purple-700">
                                ₹{stats.saved_this_year.toLocaleString("en-IN")}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.saved_this_year > 0 &&
                                    `Avg ₹${Math.round(stats.saved_this_year / Math.max(1, new Date().getMonth() + 1))}/mo`
                                }
                            </p>
                        </div>
                        <div className="rounded-full bg-purple-100 p-3">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Streak */}
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Savings Streak</p>
                            <h3 className="mt-2 text-3xl font-bold text-orange-700">
                                {stats.current_streak} {stats.current_streak === 1 ? "day" : "days"}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Best: {stats.longest_streak} days 🔥
                            </p>
                        </div>
                        <div className="rounded-full bg-orange-100 p-3">
                            <Award className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
