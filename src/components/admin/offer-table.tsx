"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Trash2, CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OfferRow {
    id: string;
    title: string;
    type: string;
    status: string;
    cashback_amount: number | null;
    cashback_percent: number | null;
    valid_to: string;
    created_at: string;
    merchant: { id: string; name: string } | null;
    payment_app: { id: string; name: string; color: string } | null;
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "active":
            return (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <CheckCircle className="mr-1 h-3 w-3" /> Active
                </Badge>
            );
        case "expired":
            return (
                <Badge variant="secondary" className="text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" /> Expired
                </Badge>
            );
        case "pending":
            return (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    <AlertCircle className="mr-1 h-3 w-3" /> Pending
                </Badge>
            );
        case "rejected":
            return (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                    <XCircle className="mr-1 h-3 w-3" /> Rejected
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export function OfferTable() {
    const [offers, setOffers] = useState<OfferRow[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOffers = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/offers");
            const result = await res.json();
            if (result.success) {
                setOffers(result.data);
            }
        } catch {
            toast.error("Failed to load offers");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    async function updateStatus(id: string, status: string) {
        try {
            const res = await fetch("/api/admin/offers", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(`Offer marked as ${status}`);
                fetchOffers();
            } else {
                toast.error(result.error || "Failed to update");
            }
        } catch {
            toast.error("Something went wrong");
        }
    }

    async function deleteOffer(id: string) {
        if (!confirm("Delete this offer permanently?")) return;
        try {
            const res = await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
            const result = await res.json();
            if (result.success) {
                toast.success("Offer deleted");
                fetchOffers();
            } else {
                toast.error(result.error || "Failed to delete");
            }
        } catch {
            toast.error("Something went wrong");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (offers.length === 0) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">No offers yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Switch to the &quot;Add Offer&quot; tab to create your first offer.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">
                    All Offers ({offers.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="pb-3 pr-4 font-medium">Offer</th>
                                <th className="pb-3 pr-4 font-medium">Merchant</th>
                                <th className="pb-3 pr-4 font-medium">App</th>
                                <th className="pb-3 pr-4 font-medium">Cashback</th>
                                <th className="pb-3 pr-4 font-medium">Expires</th>
                                <th className="pb-3 pr-4 font-medium">Status</th>
                                <th className="pb-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map((offer) => (
                                <tr
                                    key={offer.id}
                                    className="border-b border-dashed last:border-0 hover:bg-muted/30"
                                >
                                    <td className="max-w-[240px] truncate py-3 pr-4 font-medium">
                                        {offer.title}
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground">
                                        {offer.merchant?.name ?? "—"}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span className="flex items-center gap-1.5">
                                            <span
                                                className="inline-block h-2 w-2 rounded-full"
                                                style={{ backgroundColor: offer.payment_app?.color ?? "#888" }}
                                            />
                                            {offer.payment_app?.name ?? "—"}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 tabular-nums">
                                        {offer.cashback_amount
                                            ? `₹${offer.cashback_amount}`
                                            : offer.cashback_percent
                                                ? `${offer.cashback_percent}%`
                                                : "—"}
                                    </td>
                                    <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                                        {new Date(offer.valid_to).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <StatusBadge status={offer.status} />
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-1">
                                            {offer.status === "active" ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 cursor-pointer text-amber-600 hover:text-amber-700"
                                                    onClick={() => updateStatus(offer.id, "expired")}
                                                >
                                                    Expire
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 cursor-pointer text-emerald-600 hover:text-emerald-700"
                                                    onClick={() => updateStatus(offer.id, "active")}
                                                >
                                                    Activate
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 cursor-pointer text-red-500 hover:text-red-600"
                                                onClick={() => deleteOffer(offer.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
