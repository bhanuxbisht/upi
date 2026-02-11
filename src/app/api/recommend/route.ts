import { NextRequest, NextResponse } from "next/server";
import { recommendSchema } from "@/lib/validations";
import { getOffersByMerchantAndAmount } from "@/services/offers";
import type { ApiResponse, PaymentRecommendation } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
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

    // Rank offers by savings (highest first)
    const recommendations: PaymentRecommendation[] = offers.map((offer) => {
      let estimatedSavings = 0;

      if (offer.cashback_amount) {
        estimatedSavings = offer.cashback_amount;
      } else if (offer.cashback_percent) {
        estimatedSavings = Math.round(amount * (offer.cashback_percent / 100));
        if (offer.max_cashback && estimatedSavings > offer.max_cashback) {
          estimatedSavings = offer.max_cashback;
        }
      }

      return {
        offer_id: offer.id,
        app_name: offer.payment_app?.name ?? "Unknown",
        app_slug: offer.payment_app?.slug ?? "unknown",
        offer_title: offer.title,
        estimated_savings: estimatedSavings,
        savings_display: estimatedSavings > 0 ? `₹${estimatedSavings}` : "Scratch card",
        detail: offer.description,
        promo_code: offer.promo_code,
        valid_to: offer.valid_to,
      };
    });

    // Sort by estimated savings descending
    recommendations.sort((a, b) => b.estimated_savings - a.estimated_savings);

    return NextResponse.json<ApiResponse<PaymentRecommendation[]>>({
      success: true,
      data: recommendations,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
