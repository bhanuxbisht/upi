"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Smartphone, Trash2, RefreshCw } from "lucide-react";

interface UpiAppRow {
    id: string;
    name: string;
    slug: string;
    market_share: number;
    monthly_active_users: string;
    color: string;
    strength_categories: string[];
    strategies: string[];
    reward_tiers: Array<Record<string, unknown>>;
    recurring_payment_support: boolean;
    credit_card_link_support: boolean;
    is_active: boolean;
    last_verified_date: string;
}

export function UpiAppTable() {
    const [apps, setApps] = useState<UpiAppRow[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApps = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/knowledge/upi-apps");
            const data = await res.json();
            if (data.success) setApps(data.data || []);
        } catch {
            toast.error("Failed to load UPI apps");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/admin/knowledge/upi-apps?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success(`Deleted "${name}"`);
                fetchApps();
            } else {
                toast.error(data.error || "Failed to delete");
            }
        } catch {
            toast.error("Failed to delete");
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        UPI Apps ({apps.length})
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchApps} disabled={loading}>
                        <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && apps.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">Loading...</p>
                ) : apps.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <p>No UPI apps in database yet.</p>
                        <p className="mt-1 text-sm">Use the &quot;Seed Data&quot; button or add apps manually.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {apps.map((app) => (
                            <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: app.color }} />
                                        <span className="font-semibold">{app.name}</span>
                                        {app.market_share && (
                                            <Badge variant="outline">{app.market_share}% market share</Badge>
                                        )}
                                        {app.monthly_active_users && (
                                            <Badge variant="outline">{app.monthly_active_users} MAU</Badge>
                                        )}
                                        {!app.is_active && <Badge variant="destructive">Inactive</Badge>}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {app.reward_tiers?.length || 0} reward tiers
                                        </span>
                                        <span className="text-sm text-muted-foreground">•</span>
                                        <span className="text-sm text-muted-foreground">
                                            {app.strategies?.length || 0} strategies
                                        </span>
                                        {app.strength_categories?.length > 0 && (
                                            <>
                                                <span className="text-sm text-muted-foreground">•</span>
                                                <span className="text-sm text-emerald-600">
                                                    Strong: {app.strength_categories.slice(0, 3).join(", ")}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                                        {app.recurring_payment_support && <span>✓ Recurring</span>}
                                        {app.credit_card_link_support && <span>✓ CC Link</span>}
                                        <span>Verified: {new Date(app.last_verified_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(app.id, app.name)}>
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
