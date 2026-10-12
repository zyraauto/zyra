import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_NEXT = '/workshop/dashboard';
const ONBOARDING_PATH = '/es/onboarding';
const LOGIN_ERROR_PATH = '/es/login?error=auth_failed';

/**
 * Solo acepta rutas internas. Rechaza "//evil.com", "/\evil.com", "https://evil.com", etc.
 * Se resuelve contra el origin y se verifica que siga siendo el mismo origin.
 */
function safeNextPath(raw: string | null, origin: string): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return DEFAULT_NEXT;
  }
  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin) return DEFAULT_NEXT;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_NEXT;
  }
}

// Destino de Google OAuth y magic link (flujo PKCE).
// Intercambia el código por una sesión que @supabase/ssr guarda en cookies.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'), origin);

  // Caso C: el proveedor devolvió error o no llegó código.
  if (searchParams.get('error') || !code) {
    return NextResponse.redirect(`${origin}${LOGIN_ERROR_PATH}`);
  }

  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}${LOGIN_ERROR_PATH}`);
  }

  // getUser() valida el token contra Supabase Auth (no confía solo en la cookie).
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(`${origin}${LOGIN_ERROR_PATH}`);
  }

  // app_metadata solo lo puede escribir el servidor (service role), por eso es seguro para autorizar.
  const tenantId = user.app_metadata?.tenant_id;

  // Caso A: usuario con taller -> destino solicitado.
  if (tenantId) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Caso B: usuario nuevo sin taller -> registro del taller.
  return NextResponse.redirect(`${origin}${ONBOARDING_PATH}`);
}