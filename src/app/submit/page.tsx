import type { Metadata } from "next";
import { SubmitOfferForm } from "@/components/submit/submit-offer-form";

export const metadata: Metadata = {
  title: "Submit an Offer — Help the Community Save",
  description:
    "Found a great UPI cashback offer or credit card deal? Submit it to help other PayWise users save money.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Submit an Offer</h1>
        <p className="mt-3 text-muted-foreground">
          Found a cashback deal or discount? Share it with the community and help
          everyone save.
        </p>
      </div>

      <div className="mt-10">
        <SubmitOfferForm />
      </div>
    </div>
  );
}
