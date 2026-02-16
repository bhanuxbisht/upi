"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Submission {
    id: string;
    merchant_name: string;
    payment_app_name: string;
    offer_title: string;
    offer_description: string;
    cashback_amount: number | null;
    cashback_percent: number | null;
    max_cashback: number | null;
    min_transaction: number | null;
    promo_code: string | null;
    valid_to: string | null;
    source_url: string | null;
    status: string;
    created_at: string;
}

export function SubmissionReview() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubmissions = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/submissions");
            const result = await res.json();
            if (result.success) {
                setSubmissions(result.data);
            }
        } catch {
            toast.error("Failed to load submissions");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    async function reviewSubmission(id: string, status: "approved" | "rejected") {
        try {
            const res = await fetch("/api/admin/submissions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(`Submission ${status}`);
                fetchSubmissions();
            } else {
                toast.error(result.error || "Failed to update");
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

    const pending = submissions.filter((s) => s.status === "pending");
    const reviewed = submissions.filter((s) => s.status !== "pending");

    return (
        <div className="space-y-6">
            {/* Pending */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Inbox className="h-5 w-5 text-amber-500" />
                        Pending Review ({pending.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pending.length === 0 ? (
                        <div className="py-12 text-center">
                            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                            <p className="text-muted-foreground">No pending submissions</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pending.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="rounded-lg border p-4 transition-colors hover:bg-muted/20"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex-1 space-y-1">
                                            <h4 className="font-semibold">{sub.offer_title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {sub.offer_description}
                                            </p>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <Badge variant="outline">{sub.merchant_name}</Badge>
                                                <Badge variant="outline">{sub.payment_app_name}</Badge>
                                                {sub.cashback_amount && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                        ₹{sub.cashback_amount}
                                                    </Badge>
                                                )}
                                                {sub.cashback_percent && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                        {sub.cashback_percent}%
                                                    </Badge>
                                                )}
                                                {sub.promo_code && (
                                                    <Badge variant="secondary" className="font-mono">
                                                        {sub.promo_code}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="pt-1 text-xs text-muted-foreground">
                                                Submitted {new Date(sub.created_at).toLocaleDateString("en-IN")}
                                                {sub.valid_to &&
                                                    ` · Valid to ${new Date(sub.valid_to).toLocaleDateString("en-IN")}`}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                                                onClick={() => reviewSubmission(sub.id, "approved")}
                                            >
                                                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => reviewSubmission(sub.id, "rejected")}
                                            >
                                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Previously Reviewed */}
            {reviewed.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg text-muted-foreground">
                            Reviewed ({reviewed.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {reviewed.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="flex items-center justify-between rounded-md border border-dashed p-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{sub.offer_title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {sub.merchant_name} · {sub.payment_app_name}
                                        </p>
                                    </div>
                                    <Badge
                                        className={
                                            sub.status === "approved"
                                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                                : "bg-red-100 text-red-700 hover:bg-red-100"
                                        }
                                    >
                                        {sub.status === "approved" ? (
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                        ) : (
                                            <XCircle className="mr-1 h-3 w-3" />
                                        )}
                                        {sub.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
