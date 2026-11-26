import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_NEXT = '/workshop/dashboard';
const CLIENT_HOME = '/es/client/dashboard';
const ADMIN_HOME = '/es/admin/dashboard';
const LOGIN_ERROR_PATH = '/es/login?error=auth_failed';

// /es/reset-password, /en/reset-password?x=1, etc.
const RECOVERY_PATH = /^\/[^/]+\/reset-password\/?(\?|#|$)/;
// /es/onboarding, /en/onboarding, etc. (el dueño que viene a registrar su taller)
const ONBOARDING_PATH = /^\/[^/]+\/onboarding\/?(\?|#|$)/;
// /admin/..., /es/admin/..., /en/admin/...
const ADMIN_PATH = /^\/([a-z]{2}\/)?admin(\/|$)/;

/**
 * Solo acepta rutas internas. Rechaza "//evil.com", "/\evil.com", "https://evil.com", etc.
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

// Destino de Google OAuth, magic link y recuperación de contraseña (flujo PKCE).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'), origin);

  if (searchParams.get('error') || !code) {
    return NextResponse.redirect(`${origin}${LOGIN_ERROR_PATH}`);
  }

  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}${LOGIN_ERROR_PATH}`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(`${origin}${LOGIN_ERROR_PATH}`);
  }

  const tenantId = user.app_metadata?.tenant_id;
  const isRecovery = RECOVERY_PATH.test(next);
  const isSuperAdmin = user.app_metadata?.role === 'super_admin';

  // Con taller -> destino solicitado. Recuperación -> siempre a cambiar contraseña, tenga taller o no.
  if (tenantId || isRecovery) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Super admin: es de plataforma y no necesita taller.
  // Si venía de una página de admin, vuelve a ella; si no, al panel.
  if (isSuperAdmin) {
    const target = ADMIN_PATH.test(next) ? next : ADMIN_HOME;
    return NextResponse.redirect(`${origin}${target}`);
  }

  // Sin taller y con la intención explícita de registrar uno (venía de "Registra tu taller").
  if (ONBOARDING_PATH.test(next)) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Sin taller y sin esa intención: es un cliente. Va a su portal, no al onboarding.
  return NextResponse.redirect(`${origin}${CLIENT_HOME}`);
}