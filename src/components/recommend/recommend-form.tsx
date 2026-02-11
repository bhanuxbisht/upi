"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, ArrowRight, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { recommendSchema, type RecommendInput } from "@/lib/validations";

interface Recommendation {
  app_name: string;
  app_color: string;
  savings: string;
  detail: string;
  promo_code: string | null;
  valid_to: string;
}

// Demo recommendations — replaced with API call once Supabase is connected
function getDemoRecommendations(merchant: string, amount: number): Recommendation[] {
  const merchantLower = merchant.toLowerCase();

  const recs: Recommendation[] = [];

  if (merchantLower.includes("swiggy")) {
    recs.push(
      { app_name: "PhonePe", app_color: "#5F259F", savings: `₹75 cashback`, detail: `Flat ₹75 on orders above ₹199`, promo_code: null, valid_to: "Feb 28, 2026" },
      { app_name: "Google Pay", app_color: "#4285F4", savings: `Up to ₹50`, detail: `Scratch card (up to ₹250)`, promo_code: null, valid_to: "Mar 15, 2026" },
      { app_name: "Amazon Pay", app_color: "#FF9900", savings: `₹${Math.round(amount * 0.05)} back`, detail: `5% back with ICICI credit card`, promo_code: null, valid_to: "Mar 31, 2026" },
    );
  } else if (merchantLower.includes("zomato")) {
    recs.push(
      { app_name: "Google Pay", app_color: "#4285F4", savings: `₹${Math.min(Math.round(amount * 0.1), 200)} cashback`, detail: `10% back with HDFC card (max ₹200)`, promo_code: "HDFCZOM10", valid_to: "Mar 15, 2026" },
      { app_name: "PhonePe", app_color: "#5F259F", savings: `₹50 cashback`, detail: `Flat ₹50 on orders above ₹249`, promo_code: null, valid_to: "Feb 25, 2026" },
      { app_name: "CRED", app_color: "#1A1A2E", savings: `₹40 CRED coins`, detail: `Pay via CRED Pay for bonus coins`, promo_code: null, valid_to: "Mar 1, 2026" },
    );
  } else {
    recs.push(
      { app_name: "PhonePe", app_color: "#5F259F", savings: `Up to ₹${Math.round(amount * 0.03)}`, detail: `3% cashback via PhonePe UPI (max ₹100)`, promo_code: null, valid_to: "Mar 31, 2026" },
      { app_name: "Google Pay", app_color: "#4285F4", savings: `Scratch card`, detail: `Win up to ₹250 scratch card`, promo_code: null, valid_to: "Ongoing" },
      { app_name: "Paytm", app_color: "#00BAF2", savings: `₹10 cashback`, detail: `Flat ₹10 cashback on first txn of the day`, promo_code: null, valid_to: "Feb 28, 2026" },
    );
  }

  return recs;
}

export function RecommendForm() {
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [queryInfo, setQueryInfo] = useState<{ merchant: string; amount: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecommendInput>({
    resolver: zodResolver(recommendSchema),
  });

  function onSubmit(data: RecommendInput) {
    const recs = getDemoRecommendations(data.merchant, data.amount);
    setResults(recs);
    setQueryInfo({ merchant: data.merchant, amount: data.amount });
  }

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Merchant / Store
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("merchant")}
                  placeholder="e.g. Swiggy, Zomato, Amazon, BigBasket..."
                  className="pl-9"
                />
              </div>
              {errors.merchant && (
                <p className="mt-1 text-sm text-red-500">{errors.merchant.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("amount", { valueAsNumber: true })}
                  type="number"
                  placeholder="e.g. 500"
                  className="pl-9"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Find Best Payment Method
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results && queryInfo && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Best ways to pay ₹{queryInfo.amount} at {queryInfo.merchant}
          </h2>
          {results.map((rec, idx) => (
            <Card
              key={rec.app_name}
              className={
                idx === 0
                  ? "border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200"
                  : ""
              }
            >
              <CardContent className="flex items-center gap-4 p-5">
                {/* Rank */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    idx === 0 ? "bg-emerald-600" : "bg-muted-foreground/50"
                  }`}
                >
                  {idx + 1}
                </div>

                {/* App badge */}
                <Badge
                  className="shrink-0 text-white"
                  style={{ backgroundColor: rec.app_color }}
                >
                  {rec.app_name}
                </Badge>

                {/* Details */}
                <div className="flex-1">
                  <p className="text-sm font-medium">{rec.detail}</p>
                  {rec.promo_code && (
                    <span className="mt-1 inline-block rounded border border-dashed border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Code: {rec.promo_code}
                    </span>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Valid till {rec.valid_to}
                  </p>
                </div>

                {/* Savings */}
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-emerald-700">
                    {rec.savings}
                  </p>
                  {idx === 0 && (
                    <Badge className="bg-emerald-600 text-xs">Best deal</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <p className="text-center text-xs text-muted-foreground">
            Offers sourced from public data and community submissions. Always verify before paying.
          </p>
        </div>
      )}
    </div>
  );
}
