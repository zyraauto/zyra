// Next 16: este archivo se llama proxy.ts (antes middleware.ts) y exporta la función `proxy`.
// Encadena: 1) idioma (next-intl)  2) CSP con nonce  3) sesión de Supabase y rutas protegidas.
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from '@/i18n/routing'; // AJUSTA esta ruta a donde tengas tu routing de next-intl

const handleI18n = createIntlMiddleware(routing);

// /onboarding NO se protege aquí: un visitante nuevo crea su cuenta ahí mismo.
const PROTECTED = /^\/([a-z]{2}\/)?(dashboard|admin|client|mechanic|supplier|workshop)(\/|$)/;
// Rutas que además exigen tener un taller registrado.
const NEEDS_WORKSHOP = /^\/([a-z]{2}\/)?(dashboard|workshop)(\/|$)/;

function buildCsp(nonce: string) {
  const dev = process.env.NODE_ENV === 'development';
  const supa = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self' data:",
    `connect-src 'self' ${supa} ${supa.replace(/^http/, 'ws')}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // 1) Idioma: /public -> /es/public. Le pasamos el nonce y la CSP como cabeceras de la petición.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const response = handleI18n(new NextRequest(request, { headers: requestHeaders }));
  response.headers.set('Content-Security-Policy', csp);

  // Si next-intl redirige (p. ej. /public -> /es/public), terminamos aquí.
  if (response.status >= 300 && response.status < 400) return response;

  // 2) Sesión de Supabase
  const supabase = createServerClient(
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

  // getUser() valida el token con Supabase (getSession() solo lee la cookie y se puede falsificar).
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const seg = path.split('/')[1];
  const locale = (routing.locales as readonly string[]).includes(seg) ? seg : routing.defaultLocale;

  const redirectTo = (to: string, withNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = '';
    if (withNext) url.searchParams.set('next', path);
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c)); // conserva la sesión renovada
    return res;
  };

  // 3) Rutas protegidas
  if (!user && PROTECTED.test(path)) return redirectTo(`/${locale}/login`, true);

  if (user && NEEDS_WORKSHOP.test(path)) {
    const { data: profile } = await supabase.from('profiles').select('workshop_id').eq('id', user.id).maybeSingle();
    if (!profile?.workshop_id) return redirectTo(`/${locale}/onboarding`);
  }

  return response;
}

export const config = {
  // Igual que el matcher de next-intl, y además excluye /auth (el callback de Google no lleva idioma).
  matcher: ['/((?!api|auth|trpc|_next|_vercel|.*\\..*).*)'],
};