"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AddOfferForm } from "./add-offer-form";
import { OfferTable } from "./offer-table";
import { SubmissionReview } from "./submission-review";
import {
    CreditCardForm,
    CreditCardTable,
    UpiAppForm,
    UpiAppTable,
    StrategyForm,
    StrategyTable,
} from "./knowledge";
import { toast } from "sonner";
import { Database, Sparkles } from "lucide-react";

interface AdminDashboardProps {
    merchants: { id: string; name: string; slug: string }[];
    paymentApps: { id: string; name: string; slug: string; color: string }[];
}

export function AdminDashboard({ merchants, paymentApps }: AdminDashboardProps) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [seeding, setSeeding] = useState(false);
    const [embedding, setEmbedding] = useState(false);

    function triggerRefresh() {
        setRefreshKey((k) => k + 1);
    }

    async function seedKnowledgeData() {
        if (!confirm("This will import all hardcoded knowledge into the database. Existing entries will be updated. Continue?")) return;
        setSeeding(true);
        try {
            const res = await fetch("/api/admin/knowledge/seed", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                triggerRefresh();
            } else {
                toast.error(data.message || data.error || "Seed failed");
                if (data.results?.errors?.length) {
                    console.error("Seed errors:", data.results.errors);
                }
            }
        } catch {
            toast.error("Failed to seed knowledge data");
        } finally {
            setSeeding(false);
        }
    }

    async function generateEmbeddings() {
        if (!confirm("This will generate AI embeddings for all knowledge items using Hugging Face (free). This may take 30-60 seconds. Continue?")) return;
        setEmbedding(true);
        try {
            const res = await fetch("/api/admin/knowledge/embeddings", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                toast.success(`Embeddings generated: ${data.embedded.creditCards} cards, ${data.embedded.upiApps} UPI apps, ${data.embedded.strategies} strategies`);
                if (data.errors?.length) {
                    toast.warning(`${data.errors.length} items had errors — check console`);
                    console.warn("Embedding errors:", data.errors);
                }
            } else {
                toast.error(data.error || "Embedding generation failed");
            }
        } catch {
            toast.error("Failed to generate embeddings");
        } finally {
            setEmbedding(false);
        }
    }

    return (
        <Tabs defaultValue="add" className="w-full">
            <TabsList className="mb-6 flex w-full flex-wrap gap-1 lg:w-auto lg:inline-flex">
                <TabsTrigger value="add" className="cursor-pointer">Add Offer</TabsTrigger>
                <TabsTrigger value="manage" className="cursor-pointer">Manage Offers</TabsTrigger>
                <TabsTrigger value="submissions" className="cursor-pointer">Submissions</TabsTrigger>
                <TabsTrigger value="credit-cards" className="cursor-pointer">Credit Cards</TabsTrigger>
                <TabsTrigger value="upi-apps" className="cursor-pointer">UPI Apps</TabsTrigger>
                <TabsTrigger value="strategies" className="cursor-pointer">Strategies</TabsTrigger>
            </TabsList>

            {/* ---- Offers Section ---- */}
            <TabsContent value="add">
                <AddOfferForm
                    merchants={merchants}
                    paymentApps={paymentApps}
                    onSuccess={triggerRefresh}
                />
            </TabsContent>

            <TabsContent value="manage">
                <OfferTable key={`offers-${refreshKey}`} />
            </TabsContent>

            <TabsContent value="submissions">
                <SubmissionReview key={`subs-${refreshKey}`} />
            </TabsContent>

            {/* ---- Knowledge Management Section ---- */}
            <TabsContent value="credit-cards">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-lg font-semibold">Credit Card Knowledge Base</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={generateEmbeddings} disabled={embedding}>
                            <Sparkles className="mr-1 h-4 w-4" />
                            {embedding ? "Generating..." : "Generate Embeddings"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={seedKnowledgeData} disabled={seeding}>
                            <Database className="mr-1 h-4 w-4" />
                            {seeding ? "Seeding..." : "Seed All Data from Code"}
                        </Button>
                    </div>
                </div>
                <div className="space-y-6">
                    <CreditCardForm onSuccess={triggerRefresh} />
                    <CreditCardTable key={`cards-${refreshKey}`} />
                </div>
            </TabsContent>

            <TabsContent value="upi-apps">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-lg font-semibold">UPI App Knowledge Base</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={generateEmbeddings} disabled={embedding}>
                            <Sparkles className="mr-1 h-4 w-4" />
                            {embedding ? "Generating..." : "Generate Embeddings"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={seedKnowledgeData} disabled={seeding}>
                            <Database className="mr-1 h-4 w-4" />
                            {seeding ? "Seeding..." : "Seed All Data from Code"}
                        </Button>
                    </div>
                </div>
                <div className="space-y-6">
                    <UpiAppForm onSuccess={triggerRefresh} />
                    <UpiAppTable key={`upi-${refreshKey}`} />
                </div>
            </TabsContent>

            <TabsContent value="strategies">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-lg font-semibold">Payment Strategy Knowledge Base</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={generateEmbeddings} disabled={embedding}>
                            <Sparkles className="mr-1 h-4 w-4" />
                            {embedding ? "Generating..." : "Generate Embeddings"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={seedKnowledgeData} disabled={seeding}>
                            <Database className="mr-1 h-4 w-4" />
                            {seeding ? "Seeding..." : "Seed All Data from Code"}
                        </Button>
                    </div>
                </div>
                <div className="space-y-6">
                    <StrategyForm onSuccess={triggerRefresh} />
                    <StrategyTable key={`strategies-${refreshKey}`} />
                </div>
            </TabsContent>
        </Tabs>
    );
}
