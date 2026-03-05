"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lightbulb, Trash2, RefreshCw } from "lucide-react";

interface StrategyRow {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    monthly_savings_min: number;
    monthly_savings_max: number;
    steps: string[];
    requirements: string[];
    applicable_to: string[];
    is_active: boolean;
    last_verified_date: string;
}

export function StrategyTable() {
    const [strategies, setStrategies] = useState<StrategyRow[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStrategies = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/knowledge/strategies");
            const data = await res.json();
            if (data.success) setStrategies(data.data || []);
        } catch {
            toast.error("Failed to load strategies");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStrategies(); }, [fetchStrategies]);

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/admin/knowledge/strategies?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success(`Deleted "${title}"`);
                fetchStrategies();
            } else {
                toast.error(data.error || "Failed to delete");
            }
        } catch {
            toast.error("Failed to delete");
        }
    }

    const difficultyColors: Record<string, string> = {
        easy: "bg-green-100 text-green-700",
        medium: "bg-yellow-100 text-yellow-700",
        advanced: "bg-red-100 text-red-700",
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Strategies ({strategies.length})
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchStrategies} disabled={loading}>
                        <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && strategies.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">Loading...</p>
                ) : strategies.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <p>No strategies in database yet.</p>
                        <p className="mt-1 text-sm">Use the &quot;Seed Data&quot; button or add strategies manually.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {strategies.map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded-lg border p-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{s.title}</span>
                                        <Badge variant="outline" className={difficultyColors[s.difficulty] || ""}>
                                            {s.difficulty}
                                        </Badge>
                                        <Badge variant="outline">{s.category}</Badge>
                                        {!s.is_active && <Badge variant="destructive">Inactive</Badge>}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        <span className="text-sm text-emerald-600">
                                            ₹{s.monthly_savings_min}–{s.monthly_savings_max}/month
                                        </span>
                                        <span className="text-sm text-muted-foreground">•</span>
                                        <span className="text-sm text-muted-foreground">
                                            {s.steps?.length || 0} steps
                                        </span>
                                        {s.requirements?.length > 0 && (
                                            <>
                                                <span className="text-sm text-muted-foreground">•</span>
                                                <span className="text-sm text-muted-foreground">
                                                    Requires: {s.requirements.slice(0, 2).join(", ")}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {s.applicable_to?.length > 0 && (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            For: {s.applicable_to.join(", ")}
                                        </div>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id, s.title)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
