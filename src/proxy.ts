import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

const LOCALES        = ["es", "en"] as const;
const DEFAULT_LOCALE = "es";

const intlMiddleware = createMiddleware({
  locales:       LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});

const PROTECTED_ROUTES: Record<string, string[]> = {
  "/client":   ["client", "super_admin"],
  "/workshop": ["workshop_admin", "super_admin"],
  "/mechanic": ["mechanic", "super_admin"],
  "/supplier": ["supplier", "super_admin"],
  "/admin":    ["super_admin"],
};

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin:    "/admin/dashboard",
  workshop_admin: "/workshop/dashboard",
  mechanic:       "/mechanic/mis-citas",
  client:         "/client/dashboard",
  supplier:       "/supplier/ordenes",
};

const AUTH_PATHS = ["/auth/login", "/auth/registro"];

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(es|en)/, "") || "/";
}

function getLocale(pathname: string): string {
  const match = pathname.match(/^\/(es|en)/);
  return match ? match[1] : DEFAULT_LOCALE;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathWithoutLocale = stripLocale(pathname);
  const locale            = getLocale(pathname);

  const isProtected = Object.keys(PROTECTED_ROUTES).some((r) =>
    pathWithoutLocale.startsWith(r)
  );
  const isAuthPath = AUTH_PATHS.includes(pathWithoutLocale);

  if (!isProtected && !isAuthPath) {
    return intlMiddleware(request);
  }

  // Build Supabase client
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Single profile fetch
  const role = await (async () => {
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    return (data as { role: string } | null)?.role ?? "visitor";
  })();

  // Redirect logged-in users away from auth pages
  if (isAuthPath && user && role) {
    const destination = ROLE_DASHBOARD[role] ?? "/";
    return NextResponse.redirect(
      new URL(`/${locale}${destination}`, request.url)
    );
  }

  // Enforce protected routes
  if (isProtected) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/${locale}/auth/login`, request.url)
      );
    }

    const allowedRoles =
      Object.entries(PROTECTED_ROUTES).find(([route]) =>
        pathWithoutLocale.startsWith(route)
      )?.[1] ?? [];

    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.redirect(
        new URL(`/${locale}/auth/login?error=unauthorized`, request.url)
      );
    }
  }

  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};