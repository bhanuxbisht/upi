"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CreditCard as CreditCardIcon, Plus, X } from "lucide-react";

interface CreditCardFormProps {
    onSuccess?: () => void;
}

export function CreditCardForm({ onSuccess }: CreditCardFormProps) {
    const [loading, setLoading] = useState(false);

    // Basic fields
    const [id, setId] = useState("");
    const [bank, setBank] = useState("");
    const [name, setName] = useState("");
    const [annualFee, setAnnualFee] = useState("0");
    const [feeWaiver, setFeeWaiver] = useState("");
    const [joiningFee, setJoiningFee] = useState("0");
    const [network, setNetwork] = useState("Visa");
    const [tier, setTier] = useState("mid");
    const [loungeAccess, setLoungeAccess] = useState("");
    const [fuelSurchargeWaiver, setFuelSurchargeWaiver] = useState(false);
    const [incomeRequirement, setIncomeRequirement] = useState("");
    const [affiliateLink, setAffiliateLink] = useState("");
    const [affiliatePayout, setAffiliatePayout] = useState("");

    // Array fields (comma-separated input)
    const [bestFor, setBestFor] = useState("");
    const [pros, setPros] = useState("");
    const [cons, setCons] = useState("");

    // Rewards (dynamic list)
    const [rewards, setRewards] = useState<Array<{
        category: string;
        rewardRate: string;
        rewardType: string;
        notes: string;
    }>>([{ category: "", rewardRate: "", rewardType: "cashback", notes: "" }]);

    function addReward() {
        setRewards([...rewards, { category: "", rewardRate: "", rewardType: "cashback", notes: "" }]);
    }

    function removeReward(index: number) {
        setRewards(rewards.filter((_, i) => i !== index));
    }

    function updateReward(index: number, field: string, value: string) {
        const updated = [...rewards];
        updated[index] = { ...updated[index], [field]: value };
        setRewards(updated);
    }

    // Auto-generate ID from bank + name
    function generateId() {
        if (bank && name) {
            setId(`${bank.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, "-")}`);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const body = {
                id: id.trim(),
                bank: bank.trim(),
                name: name.trim(),
                annual_fee: Number(annualFee) || 0,
                fee_waiver: feeWaiver.trim() || null,
                joining_fee: Number(joiningFee) || 0,
                network,
                tier,
                rewards: rewards
                    .filter((r) => r.category && r.rewardRate)
                    .map((r) => ({
                        category: r.category.trim(),
                        rewardRate: Number(r.rewardRate),
                        rewardType: r.rewardType,
                        notes: r.notes.trim() || undefined,
                    })),
                lounge_access: loungeAccess.trim() || null,
                fuel_surcharge_waiver: fuelSurchargeWaiver,
                best_for: bestFor.split(",").map((s) => s.trim()).filter(Boolean),
                affiliate_link: affiliateLink.trim() || null,
                affiliate_payout: Number(affiliatePayout) || null,
                income_requirement: incomeRequirement.trim() || null,
                pros: pros.split("\n").map((s) => s.trim()).filter(Boolean),
                cons: cons.split("\n").map((s) => s.trim()).filter(Boolean),
            };

            const res = await fetch("/api/admin/knowledge/credit-cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Failed to save credit card");
                return;
            }

            toast.success(`Credit card "${bank} ${name}" saved!`);
            
            // Reset form
            setId(""); setBank(""); setName(""); setAnnualFee("0"); setFeeWaiver("");
            setJoiningFee("0"); setNetwork("Visa"); setTier("mid"); setLoungeAccess("");
            setFuelSurchargeWaiver(false); setIncomeRequirement(""); setAffiliateLink("");
            setAffiliatePayout(""); setBestFor(""); setPros(""); setCons("");
            setRewards([{ category: "", rewardRate: "", rewardType: "cashback", notes: "" }]);

            onSuccess?.();
        } catch {
            toast.error("Failed to save credit card");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5" />
                    Add / Update Credit Card
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="cc-bank">Bank *</Label>
                            <Input id="cc-bank" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="HDFC" required onBlur={generateId} />
                        </div>
                        <div>
                            <Label htmlFor="cc-name">Card Name *</Label>
                            <Input id="cc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Regalia" required onBlur={generateId} />
                        </div>
                        <div>
                            <Label htmlFor="cc-id">ID *</Label>
                            <Input id="cc-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="hdfc-regalia" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <Label htmlFor="cc-network">Network *</Label>
                            <select id="cc-network" value={network} onChange={(e) => setNetwork(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="RuPay">RuPay</option>
                                <option value="Amex">Amex</option>
                                <option value="Diners">Diners</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="cc-tier">Tier *</Label>
                            <select id="cc-tier" value={tier} onChange={(e) => setTier(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                <option value="entry">Entry</option>
                                <option value="mid">Mid</option>
                                <option value="premium">Premium</option>
                                <option value="super-premium">Super Premium</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="cc-annual-fee">Annual Fee (₹)</Label>
                            <Input id="cc-annual-fee" type="number" value={annualFee} onChange={(e) => setAnnualFee(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="cc-joining-fee">Joining Fee (₹)</Label>
                            <Input id="cc-joining-fee" type="number" value={joiningFee} onChange={(e) => setJoiningFee(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="cc-fee-waiver">Fee Waiver Condition</Label>
                            <Input id="cc-fee-waiver" value={feeWaiver} onChange={(e) => setFeeWaiver(e.target.value)} placeholder="Waived on ₹3L annual spend" />
                        </div>
                        <div>
                            <Label htmlFor="cc-income">Income Requirement</Label>
                            <Input id="cc-income" value={incomeRequirement} onChange={(e) => setIncomeRequirement(e.target.value)} placeholder="₹12L+ annual" />
                        </div>
                    </div>

                    {/* Rewards Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Reward Tiers</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addReward}>
                                <Plus className="mr-1 h-3 w-3" /> Add Tier
                            </Button>
                        </div>
                        {rewards.map((r, i) => (
                            <div key={i} className="flex items-end gap-2 rounded-md border border-border p-3">
                                <div className="flex-1">
                                    <Label>Category</Label>
                                    <Input value={r.category} onChange={(e) => updateReward(i, "category", e.target.value)} placeholder="travel, dining, general..." />
                                </div>
                                <div className="w-24">
                                    <Label>Rate %</Label>
                                    <Input type="number" step="0.1" value={r.rewardRate} onChange={(e) => updateReward(i, "rewardRate", e.target.value)} />
                                </div>
                                <div className="w-28">
                                    <Label>Type</Label>
                                    <select value={r.rewardType} onChange={(e) => updateReward(i, "rewardType", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                        <option value="cashback">Cashback</option>
                                        <option value="points">Points</option>
                                        <option value="miles">Miles</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <Label>Notes</Label>
                                    <Input value={r.notes} onChange={(e) => updateReward(i, "notes", e.target.value)} placeholder="Optional details" />
                                </div>
                                {rewards.length > 1 && (
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeReward(i)}>
                                        <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="cc-lounge">Lounge Access</Label>
                            <Input id="cc-lounge" value={loungeAccess} onChange={(e) => setLoungeAccess(e.target.value)} placeholder="12 domestic + 6 international/year" />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input type="checkbox" id="cc-fuel" checked={fuelSurchargeWaiver} onChange={(e) => setFuelSurchargeWaiver(e.target.checked)} className="h-4 w-4" />
                            <Label htmlFor="cc-fuel" className="cursor-pointer">Fuel Surcharge Waiver</Label>
                        </div>
                    </div>

                    {/* Categories & Tags */}
                    <div>
                        <Label htmlFor="cc-bestfor">Best For (comma-separated)</Label>
                        <Input id="cc-bestfor" value={bestFor} onChange={(e) => setBestFor(e.target.value)} placeholder="travel, dining, lounge-access" />
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="cc-pros">Pros (one per line)</Label>
                            <Textarea id="cc-pros" value={pros} onChange={(e) => setPros(e.target.value)} rows={4} placeholder="Excellent travel rewards&#10;Complimentary lounge access&#10;..." />
                        </div>
                        <div>
                            <Label htmlFor="cc-cons">Cons (one per line)</Label>
                            <Textarea id="cc-cons" value={cons} onChange={(e) => setCons(e.target.value)} rows={4} placeholder="Poor grocery rewards&#10;Points expire in 2 years&#10;..." />
                        </div>
                    </div>

                    {/* Affiliate */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="cc-aff-link">Affiliate Link</Label>
                            <Input id="cc-aff-link" value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} placeholder="https://..." />
                        </div>
                        <div>
                            <Label htmlFor="cc-aff-payout">Affiliate Payout (₹)</Label>
                            <Input id="cc-aff-payout" type="number" value={affiliatePayout} onChange={(e) => setAffiliatePayout(e.target.value)} placeholder="1500" />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Saving..." : "Save Credit Card"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
