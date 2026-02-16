"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminOfferSchema, type AdminOfferInput } from "@/lib/validations";

interface AddOfferFormProps {
    merchants: { id: string; name: string; slug: string }[];
    paymentApps: { id: string; name: string; slug: string; color: string }[];
    onSuccess?: () => void;
}

const OFFER_TYPES = [
    { value: "cashback", label: "Cashback" },
    { value: "discount", label: "Discount" },
    { value: "reward_points", label: "Reward Points" },
    { value: "coupon", label: "Coupon Code" },
    { value: "bogo", label: "Buy One Get One" },
] as const;

export function AddOfferForm({ merchants, paymentApps, onSuccess }: AddOfferFormProps) {
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<AdminOfferInput>({
        resolver: zodResolver(adminOfferSchema),
        defaultValues: {
            type: "cashback",
            status: "active",
            valid_from: new Date().toISOString().slice(0, 10),
            valid_to: "",
        },
    });

    async function onSubmit(data: AdminOfferInput) {
        setSubmitting(true);
        try {
            // Clean empty strings to null
            const payload = {
                ...data,
                cashback_amount: data.cashback_amount || null,
                cashback_percent: data.cashback_percent || null,
                max_cashback: data.max_cashback || null,
                min_transaction: data.min_transaction || null,
                promo_code: data.promo_code || null,
                terms: data.terms || null,
                source_url: data.source_url || null,
                valid_from: data.valid_from
                    ? new Date(data.valid_from).toISOString()
                    : new Date().toISOString(),
                valid_to: new Date(data.valid_to).toISOString(),
            };

            const res = await fetch("/api/admin/offers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                toast.error(result.error || "Failed to create offer");
                return;
            }

            toast.success("Offer created successfully!");
            reset({
                type: "cashback",
                status: "active",
                valid_from: new Date().toISOString().slice(0, 10),
                valid_to: "",
                merchant_id: "",
                payment_app_id: "",
                title: "",
                description: "",
            });
            onSuccess?.();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Card className="border-emerald-100 dark:border-emerald-900/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Plus className="h-5 w-5 text-emerald-600" />
                    Add New Offer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Row 1: Merchant + Payment App */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Merchant <span className="text-red-500">*</span>
                            </label>
                            <Select onValueChange={(v) => setValue("merchant_id", v)}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select merchant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {merchants.map((m) => (
                                        <SelectItem key={m.id} value={m.id} className="cursor-pointer">
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.merchant_id && (
                                <p className="text-xs text-red-500">{errors.merchant_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Payment App <span className="text-red-500">*</span>
                            </label>
                            <Select onValueChange={(v) => setValue("payment_app_id", v)}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select payment app" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentApps.map((a) => (
                                        <SelectItem key={a.id} value={a.id} className="cursor-pointer">
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                                    style={{ backgroundColor: a.color }}
                                                />
                                                {a.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.payment_app_id && (
                                <p className="text-xs text-red-500">{errors.payment_app_id.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Offer Type + Status */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Offer Type <span className="text-red-500">*</span>
                            </label>
                            <Select defaultValue="cashback" onValueChange={(v) => setValue("type", v as AdminOfferInput["type"])}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {OFFER_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value} className="cursor-pointer">
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select defaultValue="active" onValueChange={(v) => setValue("status", v as "active" | "pending")}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active" className="cursor-pointer">
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                                    </SelectItem>
                                    <SelectItem value="pending" className="cursor-pointer">
                                        <Badge variant="secondary">Pending</Badge>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 3: Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Offer Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Flat ₹75 cashback on Swiggy via PhonePe"
                            {...register("title")}
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Row 4: Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            placeholder="Full details of the offer including conditions..."
                            rows={3}
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Row 5: Cashback Details */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cashback ₹</label>
                            <Input
                                type="number"
                                placeholder="e.g. 75"
                                step="0.01"
                                {...register("cashback_amount", { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cashback %</label>
                            <Input
                                type="number"
                                placeholder="e.g. 10"
                                step="0.1"
                                {...register("cashback_percent", { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Cashback ₹</label>
                            <Input
                                type="number"
                                placeholder="e.g. 200"
                                step="0.01"
                                {...register("max_cashback", { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Min Transaction ₹</label>
                            <Input
                                type="number"
                                placeholder="e.g. 199"
                                step="0.01"
                                {...register("min_transaction", { valueAsNumber: true })}
                            />
                        </div>
                    </div>

                    {/* Row 6: Promo Code + Source */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Promo Code</label>
                            <Input placeholder="e.g. PHONEPE75" {...register("promo_code")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Source URL</label>
                            <Input
                                type="url"
                                placeholder="https://..."
                                {...register("source_url")}
                            />
                        </div>
                    </div>

                    {/* Row 7: Valid From + Valid To */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Valid From</label>
                            <Input type="date" {...register("valid_from")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Valid To <span className="text-red-500">*</span>
                            </label>
                            <Input type="date" {...register("valid_to")} />
                            {errors.valid_to && (
                                <p className="text-xs text-red-500">{errors.valid_to.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 8: Terms */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Terms & Conditions</label>
                        <Textarea
                            placeholder="e.g. Valid once per user per month. Min order ₹199."
                            rows={2}
                            {...register("terms")}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full cursor-pointer rounded-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto sm:px-8"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Offer
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
