import type { Metadata } from "next";
import { RecommendForm } from "@/components/recommend/recommend-form";

export const metadata: Metadata = {
  title: "Best Way to Pay — Find Maximum Cashback",
  description:
    "Enter a merchant and amount to instantly find which UPI app, credit card, or wallet gives you the most cashback or rewards.",
};

export default function RecommendPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Best Way to Pay
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enter where you&apos;re paying and how much — we&apos;ll tell you the
          payment method that saves you the most money.
        </p>
      </div>

      <div className="mt-10">
        <RecommendForm />
      </div>
    </div>
  );
}
