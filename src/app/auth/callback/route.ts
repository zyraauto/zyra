import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Destino de Google/magic link. Intercambia el código por una sesión guardada en cookies.
// En el login cambia redirectTo a: `${window.location.origin}/auth/callback?next=/dashboard`
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/dashboard';
  // Solo rutas internas: evita open-redirect (//evil.com o https://evil.com)
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Usuario sin taller -> registro; con taller -> destino pedido
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = user
        ? await supabase.from('profiles').select('workshop_id').eq('id', user.id).maybeSingle()
        : { data: null };
      return NextResponse.redirect(`${origin}${profile?.workshop_id ? next : '/es/onboarding'}`);
    }
  }
  return NextResponse.redirect(`${origin}/es/login?error=auth`);
}

/* ---------------------------------------------------------------
   lib/supabaseClient.ts  (reemplaza el actual: guarda la sesión en cookies, que es lo que lee el middleware)

   import { createBrowserClient } from '@supabase/ssr';
   export const supabase = createBrowserClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );

   next.config.ts  (cabeceras de seguridad)

   const headers = [
     { key: 'X-Frame-Options', value: 'DENY' },
     { key: 'X-Content-Type-Options', value: 'nosniff' },
     { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
     { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
     { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
   ];
   // dentro de nextConfig:  async headers() { return [{ source: '/(.*)', headers }]; }
   --------------------------------------------------------------- */