import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CP_RE = /^\d{5}$/;
const ONE_DAY = 60 * 60 * 24;

type FailCode = 'invalid_cp' | 'unauthorized' | 'not_found' | 'upstream';

// Tipado explícito para los registros de la tabla postal_codes
type PostalRow = {
  asentamiento: string;
  municipio: string;
  estado: string;
  ciudad: string | null;
};

function fail(code: FailCode, status: number) {
  return NextResponse.json(
    { error: true, code, manual: true },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ cp: string }> }) {
  const { cp } = await params;
  if (!CP_RE.test(cp)) return fail('invalid_cp', 400);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail('unauthorized', 401);

  try {
    // Consultamos la tabla usando type casting para evitar errores de TypeScript antes de regenerar tipos
    const { data, error } = await supabase
      .from('postal_codes' as any)
      .select('asentamiento, municipio, estado, ciudad')
      .eq('cp', cp);

    const rows = data as PostalRow[] | null;

    if (error || !rows || rows.length === 0) {
      return fail('not_found', 404);
    }

    const first = rows[0];
    
    // Extraemos las colonias únicas ordenadas alfabéticamente
    const colonias = Array.from(
      new Set(
        rows
          .map((r) => r.asentamiento)
          .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
          .map((c) => c.trim())
      )
    ).sort((a, b) => a.localeCompare(b, 'es'));

    return NextResponse.json(
      {
        error: false,
        cp,
        estado: first.estado ?? '',
        municipio: first.municipio ?? '',
        ciudad: first.ciudad ?? '',
        colonias,
      },
      { headers: { 'Cache-Control': `private, max-age=${ONE_DAY}` } }
    );
  } catch (err) {
    console.error('[api/cp] error consultando base de datos:', err);
    return fail('upstream', 502);
  }
}