import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Whitelist of safe redirect paths to prevent open redirect attacks */
const SAFE_REDIRECT_PATHS = [
  "/", "/offers", "/recommend", "/submit", "/savings", "/admin", "/extension",
];

function getSafeRedirectPath(next: string | null): string {
  if (!next) return "/";
  // Must be a relative path starting with /
  if (!next.startsWith("/")) return "/";
  // Block protocol-relative URLs (e.g., //evil.com)
  if (next.startsWith("//")) return "/";
  // Only allow known safe paths (match prefix to support /offers?category=x etc.)
  const basePath = next.split("?")[0];
  const isSafe = SAFE_REDIRECT_PATHS.some(
    (safe) => basePath === safe || basePath.startsWith(safe + "/")
  );
  return isSafe ? next : "/";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — redirect to login with error hint
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
