"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Smartphone, Plus, X } from "lucide-react";

interface UpiAppFormProps {
    onSuccess?: () => void;
}

export function UpiAppForm({ onSuccess }: UpiAppFormProps) {
    const [loading, setLoading] = useState(false);

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [marketShare, setMarketShare] = useState("");
    const [monthlyActiveUsers, setMonthlyActiveUsers] = useState("");
    const [color, setColor] = useState("#000000");

    // Categories
    const [strengthCategories, setStrengthCategories] = useState("");
    const [weakCategories, setWeakCategories] = useState("");

    // Features
    const [recurringPayment, setRecurringPayment] = useState(false);
    const [autoPay, setAutoPay] = useState(false);
    const [creditCardLink, setCreditCardLink] = useState(false);
    const [splitBill, setSplitBill] = useState(false);

    // Strategies & benefits (newline-separated)
    const [strategies, setStrategies] = useState("");
    const [linkedCardBenefits, setLinkedCardBenefits] = useState("");

    // Reward tiers (dynamic)
    const [rewardTiers, setRewardTiers] = useState<Array<{
        category: string;
        merchant: string;
        cashbackType: string;
        value: string;
        minTransaction: string;
        maxCashback: string;
        frequency: string;
        probability: string;
        notes: string;
    }>>([{
        category: "", merchant: "", cashbackType: "flat", value: "",
        minTransaction: "", maxCashback: "", frequency: "per-transaction",
        probability: "", notes: "",
    }]);

    function addTier() {
        setRewardTiers([...rewardTiers, {
            category: "", merchant: "", cashbackType: "flat", value: "",
            minTransaction: "", maxCashback: "", frequency: "per-transaction",
            probability: "", notes: "",
        }]);
    }

    function removeTier(i: number) {
        setRewardTiers(rewardTiers.filter((_, idx) => idx !== i));
    }

    function updateTier(i: number, field: string, value: string) {
        const updated = [...rewardTiers];
        updated[i] = { ...updated[i], [field]: value };
        setRewardTiers(updated);
    }

    function generateSlug() {
        if (name) {
            const s = name.toLowerCase().replace(/\s+/g, "-");
            setSlug(s);
            if (!id) setId(s);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const body = {
                id: id.trim(),
                name: name.trim(),
                slug: slug.trim(),
                market_share: Number(marketShare) || null,
                monthly_active_users: monthlyActiveUsers.trim() || null,
                color,
                strength_categories: strengthCategories.split(",").map((s) => s.trim()).filter(Boolean),
                weak_categories: weakCategories.split(",").map((s) => s.trim()).filter(Boolean),
                reward_tiers: rewardTiers
                    .filter((t) => (t.category || t.merchant) && t.value)
                    .map((t) => ({
                        category: t.category.trim() || undefined,
                        merchant: t.merchant.trim() || undefined,
                        cashback: {
                            type: t.cashbackType,
                            value: Number(t.value),
                            minTransaction: Number(t.minTransaction) || 0,
                            maxCashback: Number(t.maxCashback) || undefined,
                            frequency: t.frequency,
                            probability: Number(t.probability) || undefined,
                            notes: t.notes.trim() || undefined,
                        },
                    })),
                linked_card_benefits: linkedCardBenefits.split("\n").map((s) => s.trim()).filter(Boolean),
                strategies: strategies.split("\n").map((s) => s.trim()).filter(Boolean),
                recurring_payment_support: recurringPayment,
                auto_pay_support: autoPay,
                credit_card_link_support: creditCardLink,
                split_bill_support: splitBill,
            };

            const res = await fetch("/api/admin/knowledge/upi-apps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Failed to save UPI app");
                return;
            }

            toast.success(`UPI app "${name}" saved!`);

            // Reset
            setId(""); setName(""); setSlug(""); setMarketShare(""); setMonthlyActiveUsers("");
            setColor("#000000"); setStrengthCategories(""); setWeakCategories("");
            setRecurringPayment(false); setAutoPay(false); setCreditCardLink(false); setSplitBill(false);
            setStrategies(""); setLinkedCardBenefits("");
            setRewardTiers([{ category: "", merchant: "", cashbackType: "flat", value: "", minTransaction: "", maxCashback: "", frequency: "per-transaction", probability: "", notes: "" }]);

            onSuccess?.();
        } catch {
            toast.error("Failed to save UPI app");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Add / Update UPI App
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="upi-name">App Name *</Label>
                            <Input id="upi-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="PhonePe" required onBlur={generateSlug} />
                        </div>
                        <div>
                            <Label htmlFor="upi-slug">Slug *</Label>
                            <Input id="upi-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="phonepe" required />
                        </div>
                        <div>
                            <Label htmlFor="upi-id">ID *</Label>
                            <Input id="upi-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="phonepe" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="upi-share">Market Share (%)</Label>
                            <Input id="upi-share" type="number" step="0.1" value={marketShare} onChange={(e) => setMarketShare(e.target.value)} placeholder="48" />
                        </div>
                        <div>
                            <Label htmlFor="upi-mau">Monthly Active Users</Label>
                            <Input id="upi-mau" value={monthlyActiveUsers} onChange={(e) => setMonthlyActiveUsers(e.target.value)} placeholder="450M+" />
                        </div>
                        <div>
                            <Label htmlFor="upi-color">Brand Color</Label>
                            <div className="flex gap-2">
                                <input type="color" id="upi-color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border" />
                                <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="upi-strong">Strength Categories (comma-separated)</Label>
                            <Input id="upi-strong" value={strengthCategories} onChange={(e) => setStrengthCategories(e.target.value)} placeholder="food-delivery, bills-recharges, insurance" />
                        </div>
                        <div>
                            <Label htmlFor="upi-weak">Weak Categories (comma-separated)</Label>
                            <Input id="upi-weak" value={weakCategories} onChange={(e) => setWeakCategories(e.target.value)} placeholder="travel" />
                        </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-6">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input type="checkbox" checked={recurringPayment} onChange={(e) => setRecurringPayment(e.target.checked)} className="h-4 w-4" />
                            Recurring Payments
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                            <input type="checkbox" checked={autoPay} onChange={(e) => setAutoPay(e.target.checked)} className="h-4 w-4" />
                            Auto Pay
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                            <input type="checkbox" checked={creditCardLink} onChange={(e) => setCreditCardLink(e.target.checked)} className="h-4 w-4" />
                            Credit Card Link
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                            <input type="checkbox" checked={splitBill} onChange={(e) => setSplitBill(e.target.checked)} className="h-4 w-4" />
                            Split Bill
                        </label>
                    </div>

                    {/* Reward Tiers */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Reward Tiers</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addTier}>
                                <Plus className="mr-1 h-3 w-3" /> Add Tier
                            </Button>
                        </div>
                        {rewardTiers.map((t, i) => (
                            <div key={i} className="space-y-2 rounded-md border border-border p-3">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Label>Category</Label>
                                        <Input value={t.category} onChange={(e) => updateTier(i, "category", e.target.value)} placeholder="food-delivery" />
                                    </div>
                                    <div className="flex-1">
                                        <Label>Merchant (optional)</Label>
                                        <Input value={t.merchant} onChange={(e) => updateTier(i, "merchant", e.target.value)} placeholder="makemytrip" />
                                    </div>
                                    {rewardTiers.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeTier(i)}>
                                            <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                    <div>
                                        <Label>Type</Label>
                                        <select value={t.cashbackType} onChange={(e) => updateTier(i, "cashbackType", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                            <option value="flat">Flat ₹</option>
                                            <option value="percentage">Percentage</option>
                                            <option value="scratch-card">Scratch Card</option>
                                            <option value="coins">Coins</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Value</Label>
                                        <Input type="number" value={t.value} onChange={(e) => updateTier(i, "value", e.target.value)} placeholder="50" />
                                    </div>
                                    <div>
                                        <Label>Min Txn (₹)</Label>
                                        <Input type="number" value={t.minTransaction} onChange={(e) => updateTier(i, "minTransaction", e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Max CB (₹)</Label>
                                        <Input type="number" value={t.maxCashback} onChange={(e) => updateTier(i, "maxCashback", e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Frequency</Label>
                                        <select value={t.frequency} onChange={(e) => updateTier(i, "frequency", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                            <option value="per-transaction">Per Txn</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label>Win Probability (% for scratch cards)</Label>
                                        <Input type="number" value={t.probability} onChange={(e) => updateTier(i, "probability", e.target.value)} placeholder="40" />
                                    </div>
                                    <div>
                                        <Label>Notes</Label>
                                        <Input value={t.notes} onChange={(e) => updateTier(i, "notes", e.target.value)} placeholder="Details..." />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Strategies & Benefits */}
                    <div>
                        <Label htmlFor="upi-strategies">Expert Strategies (one per line)</Label>
                        <Textarea id="upi-strategies" value={strategies} onChange={(e) => setStrategies(e.target.value)} rows={5} placeholder="ALWAYS check PhonePe Switch before ordering...&#10;Pay electricity via PhonePe to earn scratch cards..." />
                    </div>
                    <div>
                        <Label htmlFor="upi-card-benefits">Linked Card Benefits (one per line)</Label>
                        <Textarea id="upi-card-benefits" value={linkedCardBenefits} onChange={(e) => setLinkedCardBenefits(e.target.value)} rows={3} placeholder="HDFC cards on PhonePe get additional cashback&#10;RuPay Credit on UPI gives reward points..." />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Saving..." : "Save UPI App"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
