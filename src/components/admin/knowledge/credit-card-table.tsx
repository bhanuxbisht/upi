"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CreditCard as CreditCardIcon, Trash2, RefreshCw } from "lucide-react";

interface CreditCardRow {
    id: string;
    bank: string;
    name: string;
    annual_fee: number;
    network: string;
    tier: string;
    rewards: Array<{ category: string; rewardRate: number; rewardType: string }>;
    best_for: string[];
    is_active: boolean;
    last_verified_date: string;
    confidence_level: string;
}

export function CreditCardTable() {
    const [cards, setCards] = useState<CreditCardRow[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCards = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/knowledge/credit-cards");
            const data = await res.json();
            if (data.success) setCards(data.data || []);
        } catch {
            toast.error("Failed to load credit cards");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCards(); }, [fetchCards]);

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/admin/knowledge/credit-cards?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success(`Deleted "${name}"`);
                fetchCards();
            } else {
                toast.error(data.error || "Failed to delete");
            }
        } catch {
            toast.error("Failed to delete");
        }
    }

    const tierColors: Record<string, string> = {
        entry: "bg-gray-100 text-gray-700",
        mid: "bg-blue-100 text-blue-700",
        premium: "bg-purple-100 text-purple-700",
        "super-premium": "bg-amber-100 text-amber-700",
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CreditCardIcon className="h-5 w-5" />
                        Credit Cards ({cards.length})
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchCards} disabled={loading}>
                        <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && cards.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">Loading...</p>
                ) : cards.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <p>No credit cards in database yet.</p>
                        <p className="mt-1 text-sm">Use the &quot;Seed Data&quot; button or add cards manually.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cards.map((card) => (
                            <div key={card.id} className="flex items-center justify-between rounded-lg border p-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{card.bank} {card.name}</span>
                                        <Badge variant="outline" className={tierColors[card.tier] || ""}>
                                            {card.tier}
                                        </Badge>
                                        <Badge variant="outline">{card.network}</Badge>
                                        {!card.is_active && <Badge variant="destructive">Inactive</Badge>}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Fee: ₹{card.annual_fee}/yr
                                        </span>
                                        <span className="text-sm text-muted-foreground">•</span>
                                        <span className="text-sm text-muted-foreground">
                                            {card.rewards?.length || 0} reward tiers
                                        </span>
                                        {card.best_for?.length > 0 && (
                                            <>
                                                <span className="text-sm text-muted-foreground">•</span>
                                                <span className="text-sm text-emerald-600">
                                                    Best for: {card.best_for.slice(0, 3).join(", ")}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Verified: {new Date(card.last_verified_date).toLocaleDateString()} • {card.confidence_level}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id, `${card.bank} ${card.name}`)}>
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
