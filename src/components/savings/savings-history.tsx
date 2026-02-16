"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface SavingEvent {
    id: string;
    amount_saved: number;
    transaction_amount: number | null;
    merchant_name: string;
    payment_app_name: string;
    category: string | null;
    notes: string | null;
    created_at: string;
    offer: { id: string; title: string } | null;
}

interface CategoryStat {
    category: string;
    total: number;
}

interface MonthlyTrend {
    month: string;
    total: number;
}

export function SavingsHistory() {
    const [recentSavings, setRecentSavings] = useState<SavingEvent[]>([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryStat[]>([]);
    const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const res = await fetch("/api/savings/stats");
            if (res.ok) {
                const json = await res.json();
                setRecentSavings(json.data?.recentSavings ?? []);
                setCategoryBreakdown(json.data?.categoryBreakdown ?? []);
                setMonthlyTrend(json.data?.monthlyTrend ?? []);
            }
        } catch (error) {
            console.error("Failed to fetch savings data:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
                ))}
            </div>
        );
    }

    return (
        <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                <TabsTrigger value="categories">By Category</TabsTrigger>
                <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            </TabsList>

            {/* Recent Activity */}
            <TabsContent value="recent" className="space-y-4">
                {recentSavings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground">No savings tracked yet</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Start using offers and click "I Used This" to track your savings!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    recentSavings.map((saving) => (
                        <Card key={saving.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-foreground">
                                                {saving.merchant_name}
                                            </h3>
                                            {saving.category && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {saving.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            via {saving.payment_app_name}
                                        </p>
                                        {saving.offer && (
                                            <p className="mt-1 text-xs text-muted-foreground italic">
                                                {saving.offer.title}
                                            </p>
                                        )}
                                        {saving.notes && (
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {saving.notes}
                                            </p>
                                        )}
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(saving.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-emerald-600">
                                            ₹{saving.amount_saved.toLocaleString("en-IN")}
                                        </p>
                                        {saving.transaction_amount && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                on ₹{saving.transaction_amount.toLocaleString("en-IN")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </TabsContent>

            {/* Category Breakdown */}
            <TabsContent value="categories" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Savings by Category</CardTitle>
                        <CardDescription>See where you're saving the most</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoryBreakdown.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No category data available yet
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {categoryBreakdown
                                    .sort((a, b) => b.total - a.total)
                                    .map((cat) => {
                                        const maxTotal = Math.max(...categoryBreakdown.map((c) => c.total));
                                        const percentage = (cat.total / maxTotal) * 100;

                                        return (
                                            <div key={cat.category}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">{cat.category}</span>
                                                    <span className="text-sm font-bold text-emerald-600">
                                                        ₹{cat.total.toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Monthly Trends */}
            <TabsContent value="trends" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Savings Trend</CardTitle>
                        <CardDescription>Your savings over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {monthlyTrend.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No trend data available yet
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {monthlyTrend.map((month) => {
                                    const maxTotal = Math.max(...monthlyTrend.map((m) => m.total));
                                    const percentage = (month.total / maxTotal) * 100;

                                    return (
                                        <div key={month.month}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">{month.month}</span>
                                                <span className="text-sm font-bold text-blue-600">
                                                    ₹{month.total.toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
