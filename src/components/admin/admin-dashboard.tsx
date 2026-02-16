"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddOfferForm } from "./add-offer-form";
import { OfferTable } from "./offer-table";
import { SubmissionReview } from "./submission-review";

interface AdminDashboardProps {
    merchants: { id: string; name: string; slug: string }[];
    paymentApps: { id: string; name: string; slug: string; color: string }[];
}

export function AdminDashboard({ merchants, paymentApps }: AdminDashboardProps) {
    const [refreshKey, setRefreshKey] = useState(0);

    function triggerRefresh() {
        setRefreshKey((k) => k + 1);
    }

    return (
        <Tabs defaultValue="add" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
                <TabsTrigger value="add" className="cursor-pointer">Add Offer</TabsTrigger>
                <TabsTrigger value="manage" className="cursor-pointer">Manage Offers</TabsTrigger>
                <TabsTrigger value="submissions" className="cursor-pointer">Submissions</TabsTrigger>
            </TabsList>

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
        </Tabs>
    );
}
