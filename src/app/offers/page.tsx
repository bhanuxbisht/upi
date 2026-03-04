import type { Metadata } from "next";
import { Suspense } from "react";
import { OfferCard } from "@/components/offers/offer-card";
import { OfferFilters } from "@/components/offers/offer-filters";
import { CATEGORIES, PAYMENT_APPS } from "@/lib/constants";
import { getOffers } from "@/services/offers";

export const metadata: Metadata = {
  title: "Live Cashback Offers — All UPI Apps & Credit Cards",
  description:
    "Browse all active cashback offers across PhonePe, Google Pay, Paytm, CRED, Amazon Pay, and major credit/debit cards. Updated daily.",
};

export default async function OffersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const searchParamsValue = await searchParams; // Next.js 15+ needs await on searchParams
  
  const paymentApp = typeof searchParamsValue?.payment_app === "string" ? searchParamsValue.payment_app : undefined;
  const category = typeof searchParamsValue?.category === "string" ? searchParamsValue.category : undefined;
  const search = typeof searchParamsValue?.search === "string" ? searchParamsValue.search : undefined;

  let offers: Awaited<ReturnType<typeof getOffers>>["items"] = [];
  let total = 0;
  let dbError = false;

  try {
    const result = await getOffers({
      payment_app: paymentApp,
      category: category, 
      search: search
    });
    offers = result.items;
    total = result.total;
  } catch (err) {
    console.error("[OffersPage] Failed to fetch offers:", err);
    dbError = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Live Cashback Offers
        </h1>
        <p className="mt-2 text-muted-foreground">
          {total} active offers across {PAYMENT_APPS.length} payment apps.
          Updated daily.
        </p>
      </div>

      {/* Filters + Offers */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
            <OfferFilters
              categories={CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }))}
              paymentApps={PAYMENT_APPS.map((a) => ({ name: a.name, slug: a.slug }))}
            />
          </Suspense>
        </aside>
        <div className="space-y-6">
          {dbError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-900/10">
              <p className="font-medium text-red-700 dark:text-red-400">Unable to load offers right now</p>
              <p className="text-sm text-red-600/70 mt-2 dark:text-red-400/60">We&apos;re having trouble connecting. Please try refreshing the page.</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No offers found matching your filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try clearing filters or check back later.</p>
            </div>
          ) : (
            offers.map((offer) => (
              <div key={offer.id}>
                <OfferCard offer={offer} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
