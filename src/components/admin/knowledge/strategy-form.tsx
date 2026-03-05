"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";

interface StrategyFormProps {
    onSuccess?: () => void;
}

export function StrategyForm({ onSuccess }: StrategyFormProps) {
    const [loading, setLoading] = useState(false);

    const [id, setId] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [savingsMin, setSavingsMin] = useState("");
    const [savingsMax, setSavingsMax] = useState("");

    // Text areas (newline-separated)
    const [steps, setSteps] = useState("");
    const [requirements, setRequirements] = useState("");
    const [warnings, setWarnings] = useState("");
    const [applicableTo, setApplicableTo] = useState("");

    function generateId() {
        if (title) {
            setId(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const body = {
                id: id.trim(),
                title: title.trim(),
                category: category.trim(),
                difficulty,
                monthly_savings_min: Number(savingsMin) || 0,
                monthly_savings_max: Number(savingsMax) || 0,
                steps: steps.split("\n").map((s) => s.trim()).filter(Boolean),
                requirements: requirements.split("\n").map((s) => s.trim()).filter(Boolean),
                warnings: warnings.split("\n").map((s) => s.trim()).filter(Boolean),
                applicable_to: applicableTo.split(",").map((s) => s.trim()).filter(Boolean),
            };

            const res = await fetch("/api/admin/knowledge/strategies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Failed to save strategy");
                return;
            }

            toast.success(`Strategy "${title}" saved!`);

            // Reset
            setId(""); setTitle(""); setCategory(""); setDifficulty("easy");
            setSavingsMin(""); setSavingsMax(""); setSteps(""); setRequirements("");
            setWarnings(""); setApplicableTo("");

            onSuccess?.();
        } catch {
            toast.error("Failed to save strategy");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Add / Update Payment Strategy
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="str-title">Strategy Title *</Label>
                            <Input id="str-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Food Delivery Triple Stack" required onBlur={generateId} />
                        </div>
                        <div>
                            <Label htmlFor="str-id">ID *</Label>
                            <Input id="str-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="food-stack" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <Label htmlFor="str-category">Category *</Label>
                            <Input id="str-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="food-delivery" required />
                        </div>
                        <div>
                            <Label htmlFor="str-difficulty">Difficulty *</Label>
                            <select id="str-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="str-min">Min Savings (₹/mo)</Label>
                            <Input id="str-min" type="number" value={savingsMin} onChange={(e) => setSavingsMin(e.target.value)} placeholder="500" />
                        </div>
                        <div>
                            <Label htmlFor="str-max">Max Savings (₹/mo)</Label>
                            <Input id="str-max" type="number" value={savingsMax} onChange={(e) => setSavingsMax(e.target.value)} placeholder="2000" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="str-steps">Steps (one per line) *</Label>
                        <Textarea id="str-steps" value={steps} onChange={(e) => setSteps(e.target.value)} rows={6} placeholder="Step 1: Open Swiggy and add items to cart&#10;Step 2: Apply merchant promo code&#10;Step 3: Go to PhonePe Switch..." required />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="str-reqs">Requirements (one per line)</Label>
                            <Textarea id="str-reqs" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} placeholder="PhonePe installed&#10;Credit card with food rewards" />
                        </div>
                        <div>
                            <Label htmlFor="str-warnings">Warnings (one per line)</Label>
                            <Textarea id="str-warnings" value={warnings} onChange={(e) => setWarnings(e.target.value)} rows={3} placeholder="PhonePe Switch coupons reset monthly" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="str-applicable">Applicable To (comma-separated user segments)</Label>
                        <Input id="str-applicable" value={applicableTo} onChange={(e) => setApplicableTo(e.target.value)} placeholder="swiggy-users, zomato-users, food-lovers" />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Saving..." : "Save Strategy"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
