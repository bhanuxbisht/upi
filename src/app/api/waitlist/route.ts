import { NextRequest, NextResponse } from "next/server";
import { waitlistSchema } from "@/lib/validations";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types/api";
import { authLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — max 5 signups per minute per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimit = authLimiter.check(`waitlist:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) } }
      );
    }

    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, name, apps_used } = parsed.data;
    const supabase = await getSupabaseServerClient();

    // Check if email already on waitlist
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "This email is already on the waitlist!" },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("waitlist")
      .insert({ email, name, apps_used });

    if (error) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ message: string }>>(
      { success: true, data: { message: "You're on the list! We'll notify you soon." } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
