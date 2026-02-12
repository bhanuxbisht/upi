import type { Metadata } from "next";
import { OfferCard } from "@/components/offers/offer-card";
import { OfferFilters } from "@/components/offers/offer-filters";
import { CATEGORIES, PAYMENT_APPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Live Cashback Offers — All UPI Apps & Credit Cards",
  description:
    "Browse all active cashback offers across PhonePe, Google Pay, Paytm, CRED, Amazon Pay, and major credit/debit cards. Updated daily.",
};

// Demo offers used until Supabase is connected
const DEMO_OFFERS = [
  {
    id: "1",
    title: "Flat ₹75 cashback on Swiggy orders",
    description: "Get flat ₹75 cashback on Swiggy orders above ₹199 paid via PhonePe UPI.",
    merchant: { name: "Swiggy", slug: "swiggy", category_id: "food-delivery", logo_url: null },
    payment_app: { name: "PhonePe", slug: "phonepe", color: "#5F259F" },
    type: "cashback" as const,
    cashback_amount: 75,
    cashback_percent: null,
    max_cashback: 75,
    min_transaction: 199,
    promo_code: null,
    valid_to: "2026-02-28",
    verified_count: 45,
    category: "🍕 Food Delivery",
  },
  {
    id: "2",
    title: "10% cashback on Zomato with HDFC Card",
    description: "Get 10% cashback (max ₹200) on Zomato paid via HDFC credit card on Google Pay.",
    merchant: { name: "Zomato", slug: "zomato", category_id: "food-delivery", logo_url: null },
    payment_app: { name: "Google Pay", slug: "google-pay", color: "#4285F4" },
    type: "cashback" as const,
    cashback_amount: null,
    cashback_percent: 10,
    max_cashback: 200,
    min_transaction: 300,
    promo_code: "HDFCZOM10",
    valid_to: "2026-03-15",
    verified_count: 32,
    category: "🍕 Food Delivery",
  },
  {
    id: "3",
    title: "₹50 cashback on electricity bill payment",
    description: "Pay electricity bill above ₹500 on Paytm and get flat ₹50 cashback.",
    merchant: { name: "Electricity Bill", slug: "electricity", category_id: "bills-recharges", logo_url: null },
    payment_app: { name: "Paytm", slug: "paytm", color: "#00BAF2" },
    type: "cashback" as const,
    cashback_amount: 50,
    cashback_percent: null,
    max_cashback: 50,
    min_transaction: 500,
    promo_code: null,
    valid_to: "2026-02-28",
    verified_count: 28,
    category: "⚡ Bills & Recharges",
  },
  {
    id: "4",
    title: "5% back on Amazon shopping via Amazon Pay",
    description: "Get 5% cashback (max ₹300) on Amazon purchases paid via Amazon Pay ICICI credit card.",
    merchant: { name: "Amazon", slug: "amazon", category_id: "shopping", logo_url: null },
    payment_app: { name: "Amazon Pay", slug: "amazon-pay", color: "#FF9900" },
    type: "cashback" as const,
    cashback_amount: null,
    cashback_percent: 5,
    max_cashback: 300,
    min_transaction: 500,
    promo_code: null,
    valid_to: "2026-03-31",
    verified_count: 67,
    category: "🛍️ Shopping",
  },
  {
    id: "5",
    title: "CRED Pay: Buy 1 Get 1 at Starbucks",
    description: "Pay at Starbucks via CRED Pay and get Buy 1 Get 1 on any beverage.",
    merchant: { name: "Starbucks", slug: "starbucks", category_id: "food-delivery", logo_url: null },
    payment_app: { name: "CRED", slug: "cred", color: "#1A1A2E" },
    type: "bogo" as const,
    cashback_amount: null,
    cashback_percent: 50,
    max_cashback: 500,
    min_transaction: null,
    promo_code: null,
    valid_to: "2026-02-20",
    verified_count: 19,
    category: "🍕 Food Delivery",
  },
  {
    id: "6",
    title: "₹30 cashback on Jio recharge via PhonePe",
    description: "Recharge Jio prepaid ₹399+ on PhonePe and get ₹30 cashback.",
    merchant: { name: "Jio", slug: "jio", category_id: "bills-recharges", logo_url: null },
    payment_app: { name: "PhonePe", slug: "phonepe", color: "#5F259F" },
    type: "cashback" as const,
    cashback_amount: 30,
    cashback_percent: null,
    max_cashback: 30,
    min_transaction: 399,
    promo_code: null,
    valid_to: "2026-03-10",
    verified_count: 51,
    category: "⚡ Bills & Recharges",
  },
];

export default function OffersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Live Cashback Offers
        </h1>
        <p className="mt-2 text-muted-foreground">
          {DEMO_OFFERS.length} active offers across {PAYMENT_APPS.length} payment apps.
          Updated daily.
        </p>
      </div>

      {/* Filters + Offers */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <OfferFilters
            categories={CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }))}
            paymentApps={PAYMENT_APPS.map((a) => ({ name: a.name, slug: a.slug }))}
          />
        </aside>
        <div className="space-y-6">
          {DEMO_OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </div>
  );
}
