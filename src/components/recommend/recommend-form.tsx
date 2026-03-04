"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, ArrowRight, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { recommendSchema, type RecommendInput } from "@/lib/validations";
import { PAYMENT_APPS } from "@/lib/constants";

interface Recommendation {
  offer_id?: string;
  app_name: string;
  app_slug: string;
  app_color: string;
  savings: string;
  estimated_savings: number;
  detail: string;
  promo_code: string | null;
  valid_to: string | null;
}

/** Map app slug to brand color from constants */
function getAppColor(slug: string): string {
  const app = PAYMENT_APPS.find((a) => a.slug === slug);
  return app?.color ?? "#6B7280";
}

export function RecommendForm() {
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [queryInfo, setQueryInfo] = useState<{ merchant: string; amount: number } | null>(null);
  const [searching, setSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecommendInput>({
    resolver: zodResolver(recommendSchema),
  });

  async function onSubmit(data: RecommendInput) {
    setSearching(true);
    setResults(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant: data.merchant, amount: data.amount }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to fetch recommendations");
        return;
      }

      const apiResults: Recommendation[] = (json.data ?? []).map(
        (rec: {
          offer_id: string;
          app_name: string;
          app_slug: string;
          offer_title: string;
          estimated_savings: number;
          savings_display: string;
          detail: string;
          promo_code: string | null;
          valid_to: string | null;
        }) => ({
          offer_id: rec.offer_id,
          app_name: rec.app_name,
          app_slug: rec.app_slug,
          app_color: getAppColor(rec.app_slug),
          savings: rec.savings_display,
          estimated_savings: rec.estimated_savings,
          detail: rec.detail,
          promo_code: rec.promo_code,
          valid_to: rec.valid_to
            ? new Date(rec.valid_to).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null,
        })
      );

      setResults(apiResults);
      setQueryInfo({ merchant: data.merchant, amount: data.amount });

      if (apiResults.length === 0) {
        toast.info("No offers found for this merchant. Try a different name or check our offers page.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSearching(false);
    }
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
              disabled={isSubmitting || searching}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {searching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding best deals...
                </>
              ) : (
                <>
                  Find Best Payment Method
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
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
                  {rec.valid_to && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Valid till {rec.valid_to}
                    </p>
                  )}
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
