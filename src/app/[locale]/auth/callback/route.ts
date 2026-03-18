import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/notifications/email";

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin:    "/admin/dashboard",
  workshop_admin: "/workshop/dashboard",
  mechanic:       "/mechanic/mis-citas",
  client:         "/client/dashboard",
  supplier:       "/supplier/ordenes",
};

// ✅ Next.js 15+: params es Promise en page/layout pero en route handlers
// el segundo argumento es { params: Promise<{...}> }
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale }               = await context.params;
  const { searchParams, origin } = req.nextUrl;

  const code  = searchParams.get("code");
  const error = searchParams.get("error");
  const next  = searchParams.get("next") ?? "";

  if (error) {
    return NextResponse.redirect(
      `${origin}/${locale}/auth/login?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/${locale}/auth/login?error=missing_code`
    );
  }

  const supabase = await createClient();

  const { data, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data?.user) {
    return NextResponse.redirect(
      `${origin}/${locale}/auth/login?error=auth_failed`
    );
  }

  const { user } = data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, created_at")
    .eq("id", user.id)
    .single();

  // Welcome email for brand new users
  const isNewUser =
    profile?.created_at &&
    Date.now() - new Date(profile.created_at).getTime() < 10_000;

  if (isNewUser && user.email) {
    sendWelcomeEmail({
      to:   user.email,
      name: profile?.full_name ?? user.email.split("@")[0],
    }).catch(() => {});
  }

  if (next && next.startsWith("/")) {
    return NextResponse.redirect(`${origin}/${locale}${next}`);
  }

  const destination = ROLE_DASHBOARD[profile?.role ?? ""] ?? "/";
  return NextResponse.redirect(`${origin}/${locale}${destination}`);
}