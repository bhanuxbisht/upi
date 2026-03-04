import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `About — ${APP_NAME}`,
  description: `Learn about ${APP_NAME} and our mission to help Indians save on every digital payment.`,
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">About {APP_NAME}</h1>
      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground">{APP_NAME}</strong> is India&apos;s smartest UPI &amp; digital payment savings platform.
          We aggregate cashback offers, coupons, and reward deals from every major payment app —
          PhonePe, Google Pay, Paytm, Amazon Pay, CRED, and more — so you never miss a saving.
        </p>
        <p>
          Our <strong className="text-foreground">&quot;Best Way to Pay&quot;</strong> engine recommends the
          optimal payment method for every merchant and amount, maximizing your cashback automatically.
        </p>
        <h2 className="text-xl font-semibold text-foreground pt-4">Our Mission</h2>
        <p>
          In a market where nearly every digital payment app offers cashback, it&apos;s impossible
          to manually track which app gives the best deal for each transaction. {APP_NAME} solves
          this by doing the comparison for you — saving you real money on every payment.
        </p>
        <h2 className="text-xl font-semibold text-foreground pt-4">Community-Driven</h2>
        <p>
          Our offer database is enriched by community submissions. Found a deal we haven&apos;t
          listed? Submit it and help fellow users save more.
        </p>
      </div>
    </div>
  );
}
