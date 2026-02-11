import { NextRequest, NextResponse } from "next/server";
import { offerFilterSchema } from "@/lib/validations";
import { getOffers } from "@/services/offers";
import type { ApiResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawFilters = {
      merchant: searchParams.get("merchant") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      payment_app: searchParams.get("payment_app") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    const parsed = offerFilterSchema.safeParse(rawFilters);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await getOffers(parsed.data);

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
        has_more: result.has_more,
      },
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
