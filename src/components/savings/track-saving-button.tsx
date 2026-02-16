"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TrackSavingButtonProps {
    offerId?: string;
    merchantName: string;
    paymentAppName: string;
    category?: string;
    estimatedSaving?: number;
    onSuccess?: () => void;
}

export function TrackSavingButton({
    offerId,
    merchantName,
    paymentAppName,
    category,
    estimatedSaving,
    onSuccess,
}: TrackSavingButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [amountSaved, setAmountSaved] = useState(estimatedSaving?.toString() ?? "");
    const [transactionAmount, setTransactionAmount] = useState("");
    const [notes, setNotes] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!amountSaved || Number(amountSaved) <= 0) {
            toast.error("Please enter a valid amount saved");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/savings/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    offer_id: offerId,
                    amount_saved: Number(amountSaved),
                    transaction_amount: transactionAmount ? Number(transactionAmount) : undefined,
                    merchant_name: merchantName,
                    payment_app_name: paymentAppName,
                    category: category,
                    notes: notes || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error ?? "Failed to track saving");
            }

            toast.success(`🎉 Saved ₹${amountSaved}! Your total is now ₹${data.data.stats?.total_saved ?? 0}`);
            setOpen(false);

            // Reset form
            setAmountSaved(estimatedSaving?.toString() ?? "");
            setTransactionAmount("");
            setNotes("");

            // Trigger parent refresh
            onSuccess?.();
        } catch (error) {
            console.error("Track saving error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to track saving");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                >
                    <Check className="h-4 w-4" />
                    I Used This
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Track Your Savings 💰</DialogTitle>
                    <DialogDescription>
                        Tell us how much you saved using this offer at {merchantName} via {paymentAppName}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount-saved">
                            Amount Saved <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                            <Input
                                id="amount-saved"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="75.00"
                                value={amountSaved}
                                onChange={(e) => setAmountSaved(e.target.value)}
                                className="pl-7"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transaction-amount">
                            Transaction Amount <span className="text-muted-foreground text-xs">(optional)</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                            <Input
                                id="transaction-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="500.00"
                                value={transactionAmount}
                                onChange={(e) => setTransactionAmount(e.target.value)}
                                className="pl-7"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">
                            Notes <span className="text-muted-foreground text-xs">(optional)</span>
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Any additional details..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Track Saving"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
