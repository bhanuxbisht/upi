import { NextRequest, NextResponse } from "next/server";
import { recommendSchema } from "@/lib/validations";
import { getOffersByMerchantAndAmount } from "@/services/offers";
import type { ApiResponse, PaymentRecommendation } from "@/types/api";
import { generalApiLimiter } from "@/lib/rate-limit";

const MAX_STALENESS_DAYS = 45;
const MIN_VERIFICATIONS_FOR_STALE = 2;

function getDaysSince(dateValue: string | null | undefined): number {
  if (!dateValue) return Number.POSITIVE_INFINITY;
  const ms = Date.parse(dateValue);
  if (Number.isNaN(ms)) return Number.POSITIVE_INFINITY;
  return (Date.now() - ms) / (1000 * 60 * 60 * 24);
}

function getConfidenceLevel(verifiedCount: number, stalenessDays: number): "high" | "medium" | "low" {
  if (verifiedCount >= 5 && stalenessDays <= 21) return "high";
  if (verifiedCount >= 2 && stalenessDays <= MAX_STALENESS_DAYS) return "medium";
  return "low";
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — 60 requests/min per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimit = generalApiLimiter.check(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) } }
      );
    }

    const body = await request.json();
    const parsed = recommendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { merchant, amount } = parsed.data;

    const offers = await getOffersByMerchantAndAmount(merchant, amount);

    let filteredStaleLowConfidenceCount = 0;

    // Rank offers by savings (highest first) while applying freshness guardrails.
    const recommendations: PaymentRecommendation[] = offers.flatMap((offer) => {
      const stalenessDays = getDaysSince(offer.updated_at);
      const verifiedCount = Number(offer.verified_count || 0);
      const confidence = getConfidenceLevel(verifiedCount, stalenessDays);
      const isStale = stalenessDays > MAX_STALENESS_DAYS;

      // Hard stop: avoid recommending stale low-confidence offers.
      if (isStale && verifiedCount < MIN_VERIFICATIONS_FOR_STALE) {
        filteredStaleLowConfidenceCount += 1;
        return [];
      }

      let estimatedSavings = 0;

      if (offer.cashback_amount) {
        estimatedSavings = offer.cashback_amount;
      } else if (offer.cashback_percent) {
        estimatedSavings = Math.round(amount * (offer.cashback_percent / 100));
        if (offer.max_cashback && estimatedSavings > offer.max_cashback) {
          estimatedSavings = offer.max_cashback;
        }
      }

      const caution = confidence === "low"
        ? " [Low confidence: verify offer terms before payment.]"
        : "";

      return [{
        offer_id: offer.id,
        app_name: offer.payment_app?.name ?? "Unknown",
        app_slug: offer.payment_app?.slug ?? "unknown",
        offer_title: offer.title,
        estimated_savings: estimatedSavings,
        savings_display: estimatedSavings > 0 ? `₹${estimatedSavings}` : "Scratch card",
        detail: `${offer.description}${caution}`,
        promo_code: offer.promo_code,
        valid_to: offer.valid_to,
      }];
    });

    // Sort by estimated savings descending
    recommendations.sort((a, b) => b.estimated_savings - a.estimated_savings);

    return NextResponse.json<ApiResponse<PaymentRecommendation[]>>({
      success: true,
      data: recommendations,
      meta: {
        evaluated_offers: offers.length,
        filtered_stale_low_confidence: filteredStaleLowConfidenceCount,
        freshness_window_days: MAX_STALENESS_DAYS,
      },
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
