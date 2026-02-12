import { NextRequest, NextResponse } from "next/server";
import { offerSubmissionSchema } from "@/lib/validations";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You must be logged in to submit an offer" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = offerSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const submission = parsed.data;

    const { data, error } = await supabase
      .from("offer_submissions")
      .insert({
        user_id: user.id,
        merchant_name: submission.merchant_name,
        payment_app_name: submission.payment_app_name,
        offer_title: submission.offer_title,
        offer_description: submission.offer_description,
        cashback_amount: submission.cashback_amount ?? null,
        cashback_percent: submission.cashback_percent ?? null,
        max_cashback: submission.max_cashback ?? null,
        min_transaction: submission.min_transaction ?? null,
        promo_code: submission.promo_code ?? null,
        valid_to: submission.valid_to ?? null,
        source_url: submission.source_url ?? null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Failed to submit offer" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ id: string }>>(
      { success: true, data: { id: data.id } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
