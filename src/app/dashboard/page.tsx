"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp, TrendingDown, Wallet, PiggyBank,
    BarChart3, CreditCard, ArrowUpRight, AlertCircle,
    ChevronRight, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SpendingAnalytics {
    totalSpent: number;
    totalCashback: number;
    totalMissedSavings: number;
    transactionCount: number;
    categoryBreakdown: Array<{
        category: string;
        amount: number;
        count: number;
        cashback: number;
    }>;
    appUsage: Array<{
        app: string;
        count: number;
        amount: number;
        percentage: number;
    }>;
    monthlyTrend: Array<{
        month: string;
        spent: number;
        cashback: number;
    }>;
}

interface SavingsStats {
    total_saved: number;
    saved_this_month: number;
    saved_this_year: number;
    total_transactions: number;
    current_streak: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
    "Food Delivery": "🍕",
    "Groceries": "🛒",
    "Shopping": "🛍️",
    "Bills & Recharges": "⚡",
    "Travel": "✈️",
    "Entertainment": "🎬",
    "Health & Pharmacy": "💊",
    "Fuel": "⛽",
    "Education": "📚",
    "Other": "💳",
};

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState<SpendingAnalytics | null>(null);
    const [savingsStats, setSavingsStats] = useState<SavingsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [analyticsRes, savingsRes] = await Promise.all([
                    fetch("/api/analytics/spending?months=3"),
                    fetch("/api/savings/stats"),
                ]);

                if (analyticsRes.ok) {
                    const data = await analyticsRes.json();
                    setAnalytics(data.data);
                }

                if (savingsRes.ok) {
                    const data = await savingsRes.json();
                    setSavingsStats(data.data?.stats);
                }
            } catch {
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
                <div className="mx-auto max-w-6xl px-4 py-8">
                    <div className="grid gap-4 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 animate-pulse rounded-xl bg-zinc-800/50" />
                        ))}
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-64 animate-pulse rounded-xl bg-zinc-800/50" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                            Your Finance Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                            Track spending, savings, and discover smarter ways to pay
                        </p>
                    </div>
                    <Link href="/ask">
                        <Button className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 sm:w-auto">
                            <Sparkles className="h-4 w-4" />
                            Ask AI
                        </Button>
                    </Link>
                </div>

                {error && (
                    <Card className="mb-6 border-yellow-900/50 bg-yellow-950/20 p-4">
                        <div className="flex items-center gap-2 text-yellow-400">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm">{error}</p>
                        </div>
                    </Card>
                )}

                {/* Stat Cards */}
                <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Saved */}
                    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-emerald-600/10 p-2">
                                    <PiggyBank className="h-5 w-5 text-emerald-500" />
                                </div>
                                <span className="flex items-center gap-1 text-xs text-emerald-500">
                                    <TrendingUp className="h-3 w-3" />
                                    All time
                                </span>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrency(savingsStats?.total_saved || 0)}
                                </p>
                                <p className="text-xs text-zinc-500">Total saved via PayWise</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* This Month Spending */}
                    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-blue-600/10 p-2">
                                    <Wallet className="h-5 w-5 text-blue-500" />
                                </div>
                                <span className="flex items-center gap-1 text-xs text-zinc-400">
                                    This month
                                </span>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrency(analytics?.totalSpent || 0)}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {analytics?.transactionCount || 0} transactions
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cashback Earned */}
                    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-purple-600/10 p-2">
                                    <CreditCard className="h-5 w-5 text-purple-500" />
                                </div>
                                <span className="flex items-center gap-1 text-xs text-emerald-500">
                                    <ArrowUpRight className="h-3 w-3" />
                                    Earned
                                </span>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrency(analytics?.totalCashback || 0)}
                                </p>
                                <p className="text-xs text-zinc-500">Cashback received</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Missed Savings */}
                    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-red-600/10 p-2">
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                </div>
                                <span className="flex items-center gap-1 text-xs text-red-400">
                                    Could save
                                </span>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrency(analytics?.totalMissedSavings || 0)}
                                </p>
                                <p className="text-xs text-zinc-500">You could have saved</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Two Column Layout */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Spending by Category */}
                    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg text-white">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                Spending by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics && analytics.categoryBreakdown.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.categoryBreakdown.slice(0, 6).map((cat) => {
                                        const maxAmount = analytics.categoryBreakdown[0]?.amount || 1;
                                        const percentage = Math.round(
                                            (cat.amount / maxAmount) * 100
                                        );
                                        return (
                                            <div key={cat.category}>
                                                <div className="mb-1 flex items-center justify-between text-sm">
                                                    <span className="text-zinc-300">
                                                        {CATEGORY_EMOJI[cat.category] || "💳"}{" "}
                                                        {cat.category}
                                                    </span>
                                                    <span className="font-medium text-white">
                                                        {formatCurrency(cat.amount)}
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="mt-0.5 flex justify-between text-[10px] text-zinc-600">
                                                    <span>{cat.count} transactions</span>
                                                    <span>
                                                        Cashback: {formatCurrency(cat.cashback)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-zinc-500">No transactions yet</p>
                                    <p className="mt-1 text-xs text-zinc-600">
                                        Start logging transactions to see your breakdown
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment App Usage */}
                    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg text-white">
                                <CreditCard className="h-5 w-5 text-purple-500" />
                                Payment App Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics && analytics.appUsage.length > 0 ? (
                                <div className="space-y-4">
                                    {analytics.appUsage.slice(0, 6).map((app) => (
                                        <div
                                            key={app.app}
                                            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/30 p-3"
                                        >
                                            <div>
                                                <p className="font-medium text-white">{app.app}</p>
                                                <p className="text-xs text-zinc-500">
                                                    {app.count} transactions · {app.percentage}% of total
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-white">
                                                    {formatCurrency(app.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-zinc-500">No data yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <Link href="/offers">
                        <Card className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-emerald-500/50">
                            <CardContent className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-emerald-600/10 p-2">
                                        <Sparkles className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Browse Offers</p>
                                        <p className="text-xs text-zinc-500">
                                            All active cashback deals
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-600 transition-transform group-hover:translate-x-1" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/ask">
                        <Card className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-emerald-500/50">
                            <CardContent className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-600/10 p-2">
                                        <Sparkles className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Ask PayWise AI</p>
                                        <p className="text-xs text-zinc-500">
                                            Get personalized advice
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-600 transition-transform group-hover:translate-x-1" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/savings">
                        <Card className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-emerald-500/50">
                            <CardContent className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-purple-600/10 p-2">
                                        <PiggyBank className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">My Savings</p>
                                        <p className="text-xs text-zinc-500">
                                            Track your savings history
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-600 transition-transform group-hover:translate-x-1" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
