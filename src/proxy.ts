// Next 16: este archivo se llama proxy.ts (antes middleware.ts) y exporta la función `proxy`.
// Encadena: 1) idioma (next-intl)  2) CSP con nonce  3) sesión de Supabase y rutas protegidas por tenant.
//
// Aislamiento multi-tenant SIN consultas a la base de datos:
// el tenant se lee de user.app_metadata.tenant_id (solo escribible con service role).
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from '@/i18n/routing'; // AJUSTA esta ruta a donde tengas tu routing de next-intl

const handleI18n = createIntlMiddleware(routing);

// Todas las rutas se evalúan SIN el prefijo de idioma (/es/workshop/x -> /workshop/x).
// Exigen sesión:
const PROTECTED = /^\/(dashboard|admin|client|mechanic|supplier|workshop)(\/|$)/;
// Además exigen tener un taller (tenant_id):
const NEEDS_TENANT = /^\/(dashboard|workshop)(\/|$)/;
const ONBOARDING = /^\/onboarding(\/|$)/;
// Páginas de acceso: un usuario con taller no tiene nada que hacer ahí.
// (reset-password y similares NO van aquí: necesitan sesión de recuperación.)
const AUTH_PAGES = /^\/(login|signup|register)(\/|$)/;
const API = /^\/(api|trpc)(\/|$)/;

const HOME_AFTER_LOGIN = '/workshop/dashboard';

function buildCsp(nonce: string) {
  const dev = process.env.NODE_ENV === 'development';
  const supa = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${supa} ${supa.replace(/^http/, 'ws')}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

// Cliente SSR de servidor: lee cookies de la petición y escribe las renovadas en la respuesta.
function createSupabase(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }),
      },
    }
  );
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ---------- API / tRPC: sin idioma ni redirecciones; solo refresca la sesión ----------
  // /api/cp/* entra por aquí: el proxy NUNCA bloquea por tenant_id, así que un usuario en onboarding
  // (con sesión pero sin taller) puede consultar el código postal. La propia ruta exige sesión con getUser().
  if (API.test(path)) {
    const apiResponse = NextResponse.next({ request: { headers: new Headers(request.headers) } });
    const supabase = createSupabase(request, apiResponse);
    await supabase.auth.getUser(); // renueva cookies si el token está por vencer
    return apiResponse;
  }

  // ---------- 1) Idioma + 2) CSP con nonce ----------
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const response = handleI18n(new NextRequest(request, { headers: requestHeaders }));
  response.headers.set('Content-Security-Policy', csp);

  // Si next-intl redirige (p. ej. /workshop -> /es/workshop), terminamos aquí.
  if (response.status >= 300 && response.status < 400) return response;

  // ---------- Idioma y ruta sin prefijo ----------
  const segments = path.split('/');
  const hasLocale = (routing.locales as readonly string[]).includes(segments[1]);
  const locale = hasLocale ? segments[1] : routing.defaultLocale;
  const barePath = hasLocale ? `/${segments.slice(2).join('/')}` : path;

  const isProtected = PROTECTED.test(barePath);
  const isOnboarding = ONBOARDING.test(barePath);
  const isAuthPage = AUTH_PAGES.test(barePath);

  // Páginas públicas (landing, precios, etc.): no necesitan validar sesión, así que no hay llamada a Auth.
  if (!isProtected && !isOnboarding && !isAuthPage) return response;

  // ---------- 3) Sesión de Supabase ----------
  const supabase = createSupabase(request, response);

  // getUser() valida el token con Supabase Auth y renueva cookies (getSession() solo lee la cookie y se puede falsificar).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Claim del tenant: null/undefined/'' => el usuario aún no tiene taller. Sin consultas a profiles/workshops.
  const hasTenant = Boolean(user?.app_metadata?.tenant_id);

  // Cuenta con 2FA activado pero sesión a medias (aal1): falta el segundo factor.
  let needsMfa = false;
  if (user) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    needsMfa = aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2';
  }

  const redirectTo = (to: string, withNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = '';
    if (withNext) url.searchParams.set('next', `${path}${request.nextUrl.search}`);
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c)); // conserva la sesión renovada
    return res;
  };

  // Sin sesión: rutas protegidas y onboarding -> login
  if (!user && (isProtected || isOnboarding)) {
    return redirectTo(`/${locale}/login`, true);
  }

  if (user) {
    if (needsMfa) {
      // Sesión a medias: solo puede estar en las páginas de acceso, donde se pide el código.
      if (isProtected || isOnboarding) return redirectTo(`/${locale}/login`);
      return response;
    }

    // ERP sin taller registrado -> onboarding
    if (NEEDS_TENANT.test(barePath) && !hasTenant) {
      return redirectTo(`/${locale}/onboarding`);
    }

    // Taller ya registrado: no repetir onboarding.
    if (hasTenant && isOnboarding) {
      return redirectTo(`/${locale}${HOME_AFTER_LOGIN}`);
    }

    // Taller ya registrado: tampoco volver a login/signup... salvo que el layout lo haya mandado con ?error=
    // (p. ej. unauthorized). Sin esta excepción habría un bucle: dashboard -> login?error -> dashboard -> ...
    if (hasTenant && isAuthPage && !request.nextUrl.searchParams.has('error')) {
      return redirectTo(`/${locale}${HOME_AFTER_LOGIN}`);
    }
  }

  return response;
}

export const config = {
  // Excluye estáticos (_next/static, _next/image, favicon.ico y cualquier archivo con extensión)
  // y el callback de OAuth/magic link (no lleva idioma y no debe pasar por el proxy: evita bucles).
  // /api y /trpc SÍ pasan, solo para renovar cookies de sesión.
  matcher: ['/((?!_next|_vercel|auth/callback|.*\\..*).*)'],
};