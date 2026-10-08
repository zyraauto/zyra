import { createBrowserClient } from '@supabase/ssr';

// Cliente del navegador. Guarda la sesión en COOKIES (no en localStorage) y usa el flujo PKCE:
// Google regresa con ?code=... a /auth/callback, y el proxy puede leer la sesión en el servidor.
// Con createClient de '@supabase/supabase-js' la sesión queda solo en el navegador y el proxy nunca la ve.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);