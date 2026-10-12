'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Cog, Gauge, Loader2, PaintBucket, Wrench, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import ThemeToggle, { ThemeSync } from '@/components/ThemeToggle';

// Registro del taller en 3 pasos. La validación real vive en la función SQL create_workshop.

const SPECIALTIES = [
  { value: 'mecanica_general', label: 'Mecánica general', icon: Wrench },
  { value: 'afinacion', label: 'Afinación y servicios', icon: Gauge },
  { value: 'electrico', label: 'Taller eléctrico', icon: Zap },
  { value: 'hojalateria', label: 'Hojalatería y pintura', icon: PaintBucket },
  { value: 'transmisiones', label: 'Transmisiones', icon: Cog },
] as const;

// Mismo catálogo de ejemplo que el documento del proyecto; luego sembrará la tabla `services`.
const SERVICES = [
  ['cambio_aceite', 'Cambio de aceite'], ['afinacion', 'Afinación'], ['frenos', 'Cambio de frenos'],
  ['bateria', 'Cambio de batería'], ['diagnostico', 'Diagnóstico electrónico'], ['suspension', 'Suspensión'],
  ['alineacion', 'Alineación y balanceo'], ['clutch', 'Cambio de clutch'], ['aire', 'Aire acondicionado'],
] as const;

const INCLUDED = ['Clientes y vehículos', 'Órdenes de servicio', 'Cotizaciones y ventas', 'Inventario y refacciones', 'Historial por vehículo', 'Perfil público del taller', 'Usuarios y roles'];
const STEP_TITLES = ['Tu negocio', 'Contacto', 'Servicios'];

const STYLES = `
.zo{--bg:#F3F3F5;--card:#fff;--text:#15151E;--muted:#5F626E;--line:#DFE0E6;--field:#fff;--soft:#FBE9E8;
  background:var(--bg);color:var(--text);font-family:var(--font-inter,Inter),system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme='light']) .zo{--bg:#0F0F15;--card:#1B1C25;--text:#F3F3F5;--muted:#A3A6B3;--line:#34363F;--field:#15151E;--soft:#2A1618}}
:root[data-theme='dark'] .zo{--bg:#0F0F15;--card:#1B1C25;--text:#F3F3F5;--muted:#A3A6B3;--line:#34363F;--field:#15151E;--soft:#2A1618}
.zo-head{font-family:var(--font-montserrat,Montserrat),system-ui,sans-serif}
.zo-card{background:var(--card);border:1px solid var(--line);box-shadow:0 30px 60px -25px rgba(21,21,30,.35)}
.zo-muted{color:var(--muted)}
.zo-in{width:100%;background:var(--field);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:.8rem .9rem;font-size:.9rem;outline:none;transition:border-color .2s,box-shadow .2s}
.zo-in:focus{border-color:#E10600;box-shadow:0 0 0 3px rgba(225,6,0,.18)}
.zo-opt{display:flex;align-items:center;gap:.6rem;text-align:left;border:1px solid var(--line);background:var(--field);border-radius:12px;padding:.7rem .85rem;font-size:.85rem;font-weight:600;cursor:pointer;transition:border-color .15s,background-color .15s}
.zo-opt:hover{border-color:#E10600}
.zo-opt[aria-checked='true']{border-color:#E10600;background:var(--soft)}
.zo-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:12px;padding:.8rem 1.2rem;font-weight:700;font-size:.9rem;cursor:pointer;transition:background-color .2s,opacity .2s}
.zo-btn:disabled{opacity:.6;cursor:not-allowed}
.zo-red{background:#E10600;color:#fff}.zo-red:hover:not(:disabled){background:#A80703}
.zo-ghost{border:1px solid var(--line);color:var(--text)}.zo-ghost:hover:not(:disabled){background:var(--soft)}
.zo :focus-visible{outline:2px solid #E10600;outline-offset:2px}
`;

function ZyraMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" aria-hidden="true">
      <polygon points="16,0 48,0 41,9 9,9" fill="#E10600" />
      <polygon points="9,12 37,12 31,20 3,20" fill="#E10600" />
      <polygon points="3,23 25,23 20,32 0,32" fill="#A80703" />
    </svg>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  // anon = visitante sin cuenta: primero crea su cuenta; user = ya tiene sesión y solo falta el taller
  const [auth, setAuth] = useState<'checking' | 'anon' | 'user'>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accLoading, setAccLoading] = useState(false);
  const [accError, setAccError] = useState('');
  const [sentMsg, setSentMsg] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [services, setServices] = useState<string[]>([]);

  // Sin sesión ya no mandamos al login: mostramos "Crea tu cuenta". Con taller registrado -> dashboard.
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setAuth('anon');
      const { data: p } = await supabase.from('profiles').select('workshop_id').eq('id', user.id).maybeSingle();
      if (p?.workshop_id) return router.replace('/dashboard');
      setAuth('user');
    })();
  }, [router]);

  const callbackUrl = () => `${window.location.origin}/auth/callback?next=/es/onboarding`;

  const googleSignUp = async () => {
    if (accLoading) return;
    setAccLoading(true);
    setAccError('');
    const { error: e } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl() } });
    if (e) {
      console.error('google:', e.message);
      setAccError('No pudimos conectar con Google. Intenta de nuevo.');
      setAccLoading(false);
    }
  };

  const emailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accLoading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setAccError('Revisa el formato de tu correo.');
    if (password.length < 8) return setAccError('La contraseña debe tener al menos 8 caracteres.');
    setAccLoading(true);
    setAccError('');
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: callbackUrl() },
    });
    setAccLoading(false);
    if (err) {
      console.error('signUp:', err.message);
      setAccError(err.message.toLowerCase().includes('registered') ? 'Ese correo ya tiene cuenta. Inicia sesión.' : 'No pudimos crear tu cuenta. Intenta de nuevo.');
    } else if (data.session) {
      setAuth('user'); // la confirmación por correo está desactivada en Supabase
    } else {
      setSentMsg('Te enviamos un correo para confirmar tu cuenta. Ábrelo y volverás aquí para registrar tu taller.');
    }
  };

  const digits = phone.replace(/\D/g, '');

  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (name.trim().length < 3) return 'El nombre del negocio debe tener al menos 3 caracteres.';
      if (!SPECIALTIES.some((x) => x.value === type)) return 'Elige la especialidad principal de tu taller.';
      if (city.trim().length > 80) return 'La ciudad es demasiado larga.';
    }
    if (s === 1 && digits && (digits.length < 10 || digits.length > 15)) return 'El teléfono debe tener entre 10 y 15 dígitos.';
    return null;
  };

  const next = () => {
    const problem = validateStep(step);
    if (problem) return setError(problem);
    setError('');
    setStep((s) => s + 1);
  };

  const toggleService = (id: string) =>
    setServices((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const problem = validateStep(0) || validateStep(1);
    if (problem) return setError(problem);

    setLoading(true);
    setError('');
    const { error: rpcError } = await supabase.rpc('create_workshop', {
      p_name: name.trim(),
      p_type: type,
      p_city: city.trim() || null,
      p_phone: digits || null,
      p_services: services,
    });
    if (rpcError) {
      console.error('create_workshop:', rpcError.message);
      setError(rpcError.message.includes('Ya tienes') ? 'Tu cuenta ya tiene un taller registrado.' : 'No pudimos crear tu taller. Intenta de nuevo.');
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => { router.replace('/dashboard'); router.refresh(); }, 1400);
  };

  if (auth === 'checking') {
    return <div className="zo min-h-screen grid place-items-center text-sm zo-muted"><style>{STYLES}</style><ThemeSync />Verificando tu sesión…</div>;
  }

  return (
    <div className="zo min-h-screen flex items-center justify-center p-4">
      <style>{STYLES}</style>
      <div className="zo-card w-full max-w-4xl rounded-2xl overflow-hidden flex">
        {/* Lo que incluye tu espacio */}
        <aside className="hidden md:flex w-[40%] shrink-0 flex-col p-9 bg-[#15151E] text-white relative overflow-hidden">
          <div aria-hidden className="absolute -right-16 top-0 h-full w-24 bg-[#E10600]" style={{ clipPath: 'polygon(45% 0,100% 0,100% 100%,0 100%)' }} />
          <div className="relative flex items-center gap-3 mb-10">
            <ZyraMark className="w-9 h-6" />
            <span className="zo-head font-bold text-xl">Zyra</span>
          </div>
          <h1 className="relative zo-head font-extrabold text-2xl leading-tight">Tu taller listo para operar hoy.</h1>
          <p className="relative text-sm text-white/65 mt-3">Al terminar se crea tu espacio privado, con estos módulos:</p>
          <ul className="relative mt-6 space-y-3 text-sm">
            {INCLUDED.map((m) => (
              <li key={m} className="flex items-center gap-2.5">
                <span className="grid place-items-center w-5 h-5 rounded-full bg-[#E10600]"><Check className="w-3 h-3" aria-hidden /></span>{m}
              </li>
            ))}
          </ul>
          <p className="relative mt-auto pt-8 text-xs text-white/55">Tus datos solo los ves tú y tu equipo. Ningún otro taller puede consultarlos.</p>
        </aside>

        {/* Formulario */}
        <div className="flex-1 p-7 sm:p-10 min-h-[560px] flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <Link href="/es/public" className="inline-flex items-center gap-1.5 text-sm font-semibold zo-muted hover:text-[#E10600]">
              <ArrowLeft className="w-4 h-4" aria-hidden /> Volver al inicio
            </Link>
            <ThemeToggle />
          </div>
          {auth === 'anon' ? (
            <div className="space-y-5">
              <div>
                <h2 className="zo-head font-bold text-2xl">Crea tu cuenta</h2>
                <p className="zo-muted text-sm mt-1.5">Primero tu cuenta; en el siguiente paso registras tu taller.</p>
              </div>
              {sentMsg ? (
                <p role="status" className="rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-3 text-sm">{sentMsg}</p>
              ) : (
                <>
                  <button type="button" className="zo-btn zo-ghost w-full" onClick={googleSignUp} disabled={accLoading}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                  </button>
                  <div className="flex items-center gap-3 text-xs zo-muted">
                    <span className="flex-1 h-px" style={{ background: 'var(--line)' }} />o con tu correo<span className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                  </div>
                  <form onSubmit={emailSignUp} noValidate className="space-y-4">
                    <div>
                      <label htmlFor="acc-email" className="block text-sm font-semibold mb-1.5">Correo electrónico</label>
                      <input id="acc-email" type="email" autoComplete="email" className="zo-in" value={email} onChange={(e) => setEmail(e.target.value)} disabled={accLoading} />
                    </div>
                    <div>
                      <label htmlFor="acc-pass" className="block text-sm font-semibold mb-1.5">Contraseña <span className="zo-muted font-normal">(mínimo 8 caracteres)</span></label>
                      <input id="acc-pass" type="password" autoComplete="new-password" className="zo-in" value={password} onChange={(e) => setPassword(e.target.value)} disabled={accLoading} />
                    </div>
                    {accError && <p role="alert" className="rounded-xl border border-[#E10600]/30 bg-[#E10600]/10 px-3 py-2 text-sm text-[#E10600]">{accError}</p>}
                    <button type="submit" className="zo-btn zo-red w-full" disabled={accLoading}>
                      {accLoading ? (<><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Creando cuenta…</>) : 'Crear cuenta y continuar'}
                    </button>
                  </form>
                </>
              )}
              <p className="text-sm zo-muted text-center">¿Ya tienes cuenta? <Link href="/es/login" className="font-bold hover:text-[#E10600]">Inicia sesión</Link></p>
            </div>
          ) : done ? (
            <div className="text-center" aria-live="polite">
              <div className="mx-auto mb-5 grid place-items-center w-16 h-16 rounded-full bg-green-500 text-white"><Check className="w-8 h-8" aria-hidden /></div>
              <h2 className="zo-head font-bold text-2xl mb-2">Tu taller está listo</h2>
              <p className="zo-muted text-sm">Te llevamos a tu panel…</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="mb-6">
                <p className="text-sm font-semibold zo-muted mb-2">Paso {step + 1} de 3: {STEP_TITLES[step]}</p>
                <div className="flex gap-1.5" aria-hidden>
                  {STEP_TITLES.map((_, i) => (
                    <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= step ? '#E10600' : 'var(--line)' }} />
                  ))}
                </div>
              </div>

              {step === 0 && (
                <div className="space-y-5">
                  <h2 className="zo-head font-bold text-2xl">Cuéntanos de tu negocio</h2>
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-1.5">Nombre del negocio</label>
                    <input id="name" className="zo-in" maxLength={60} autoComplete="organization" placeholder="Ej. Mecánica Automotriz López" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div role="radiogroup" aria-label="Especialidad principal">
                    <p className="text-sm font-semibold mb-1.5">Especialidad principal</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {SPECIALTIES.map(({ value, label, icon: Icon }) => (
                        <button key={value} type="button" role="radio" aria-checked={type === value} className="zo-opt" onClick={() => setType(value)}>
                          <Icon className="w-4 h-4 text-[#E10600] shrink-0" aria-hidden />{label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold mb-1.5">Ciudad <span className="zo-muted font-normal">(opcional)</span></label>
                    <input id="city" className="zo-in" maxLength={80} autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="zo-head font-bold text-2xl">¿Cómo te contactan tus clientes?</h2>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold mb-1.5">WhatsApp o teléfono <span className="zo-muted font-normal">(opcional)</span></label>
                    <input id="phone" className="zo-in" inputMode="tel" autoComplete="tel" placeholder="Solo números, con lada" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <p className="zo-muted text-xs mt-1.5">Lo usaremos para el botón de contacto de tu perfil público. Redes sociales, horarios y logotipo los agregas después en Configuración.</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="zo-head font-bold text-2xl">¿Qué servicios ofreces?</h2>
                  <p className="zo-muted text-sm">Los cargamos en tu catálogo para que puedas cotizar desde el primer día. Después editas nombres y precios.</p>
                  <div className="grid sm:grid-cols-2 gap-2" role="group" aria-label="Servicios iniciales">
                    {SERVICES.map(([id, label]) => (
                      <button key={id} type="button" role="checkbox" aria-checked={services.includes(id)} className="zo-opt" onClick={() => toggleService(id)}>
                        <span className="grid place-items-center w-4 h-4 rounded border shrink-0" style={{ borderColor: services.includes(id) ? '#E10600' : 'var(--line)', background: services.includes(id) ? '#E10600' : 'transparent', color: '#fff' }}>
                          {services.includes(id) && <Check className="w-3 h-3" aria-hidden />}
                        </span>{label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p role="alert" className="mt-5 rounded-xl border border-[#E10600]/30 bg-[#E10600]/10 px-3 py-2 text-sm text-[#E10600]">{error}</p>}

              <div className="mt-7 flex items-center justify-between gap-3">
                {step > 0 ? (
                  <button type="button" className="zo-btn zo-ghost" disabled={loading} onClick={() => { setError(''); setStep(step - 1); }}>
                    <ArrowLeft className="w-4 h-4" aria-hidden /> Atrás
                  </button>
                ) : <span />}
                {step < 2 ? (
                  <button type="button" className="zo-btn zo-red" onClick={next}>Continuar <ArrowRight className="w-4 h-4" aria-hidden /></button>
                ) : (
                  <button type="submit" className="zo-btn zo-red" disabled={loading}>
                    {loading ? (<><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Creando tu taller…</>) : 'Crear mi taller'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}