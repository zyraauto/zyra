'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthError, type AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

/**
 * Zyra AutoSaaS — Login v3 (Supabase Auth real, sin modo demo)
 *
 * Paleta oficial: Racing Red #E10600 · Deep Red #A80703 · Carbon #15151E · Graphite #292B33 · Off White #F3F3F5
 * Tipografías: Montserrat (títulos) + Inter (texto/formulario)
 *
 * Autenticación:
 *  - Contraseña: supabase.auth.signInWithPassword
 *  - Enlace al correo: supabase.auth.signInWithOtp (solo usuarios existentes)
 *  - Google: supabase.auth.signInWithOAuth con redirectTo -> /auth/callback
 *  - 2FA (TOTP): supabase.auth.mfa (challenge + verify) cuando la cuenta lo exige
 *  - Todo AuthError se captura y se muestra en la UI sin romper la aplicación
 *
 * Requiere:
 *  - '@/lib/supabase/client' exportando createClient() (basado en @supabase/ssr -> createBrowserClient)
 *  - La ruta app/auth/callback/route.ts que intercambia el code por sesión (exchangeCodeForSession)
 *  - Agregar `${origin}/auth/callback` a "Redirect URLs" en Supabase -> Authentication -> URL Configuration
 */

const WORKSHOPS_ONLINE = 128;
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;
const THEME_KEY = 'zyra-theme';
const WORKSPACE_KEY = 'zyra-workspace';

// Ruta a la que se va después de iniciar sesión con contraseña + 2FA.
const POST_LOGIN_PATH = '/dashboard';

type Theme = 'light' | 'dark' | 'system';
type Step = 'credentials' | 'magic-sent' | 'otp' | 'success';
type Mode = 'password' | 'magic';
type IconProps = { className?: string };

// ---------- Errores de Supabase -> mensajes limpios ----------
function authMessage(err: AuthError): string {
  if (err.name === 'AuthRetryableFetchError') {
    return 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.';
  }
  switch (err.code) {
    case 'invalid_credentials':
      return 'Correo o contraseña incorrectos.';
    case 'email_not_confirmed':
      return 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
    case 'over_sms_send_rate_limit':
      return 'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.';
    case 'otp_disabled':
    case 'signup_disabled':
    case 'user_not_found':
      return 'No encontramos una cuenta con ese correo.';
    case 'user_banned':
      return 'Esta cuenta está suspendida. Contacta a tu administrador.';
    case 'mfa_verification_failed':
    case 'mfa_challenge_expired':
      return 'Código incorrecto o vencido. Revisa tu app de autenticación.';
    case 'provider_disabled':
      return 'Este método de acceso no está habilitado.';
    default:
      return err.message || 'Ocurrió un error de autenticación. Intenta de nuevo.';
  }
}

function toMessage(err: unknown): string {
  if (isAuthError(err)) return authMessage(err);
  if (err instanceof Error && err.message) return err.message;
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

// ---------- Íconos (SVG sin dependencias) ----------
const mk = (paths: React.ReactNode, strokeWidth = 2) =>
  function Icon({ className }: IconProps) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths}
      </svg>
    );
  };

const Mail = mk(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></>);
const Lock = mk(<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>);
const Eye = mk(<><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></>);
const EyeOff = mk(<><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61C3.9 8.31 1 11 1 12s4 8 11 8a9.16 9.16 0 0 0 5.06-1.5" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></>);
const ShieldCheck = mk(<><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></>);
const AlertTriangle = mk(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>);
const Loader2 = mk(<path d="M21 12a9 9 0 1 1-9-9" />);
const Sun = mk(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>);
const Moon = mk(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />);
const Monitor = mk(<><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>);
const Check = mk(<path d="m5 12 5 5 9-10" />, 3);
const Sparkles = mk(<><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" /><path d="M19 17v4M17 19h4" /></>);
const KeyRound = mk(<><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l3 3" /></>);
const ArrowLeft = mk(<path d="M19 12H5M12 19l-7-7 7-7" />);

// ---------- Marca ----------
function ZyraMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 32" aria-hidden="true">
      <polygon points="16,0 48,0 41,9 9,9" fill="#E10600" />
      <polygon points="9,12 37,12 31,20 3,20" fill="#E10600" />
      <polygon points="3,23 25,23 20,32 0,32" fill="#A80703" />
    </svg>
  );
}

// ---------- Órdenes "en vivo" del panel izquierdo (vista previa decorativa del producto) ----------
const STATUS = [
  { label: 'Pendiente', color: '#F59E0B' },
  { label: 'En proceso', color: '#8B5CF6' },
  { label: 'Completada', color: '#22C55E' },
];

const INITIAL_ORDERS = [
  { id: '0012', client: 'Carlos Méndez', car: 'Nissan Sentra', service: 'Cambio de aceite', status: 1 },
  { id: '0011', client: 'Ana López', car: 'Toyota Corolla', service: 'Afinación', status: 0 },
  { id: '0010', client: 'Jorge Ramírez', car: 'Ford Fiesta', service: 'Diagnóstico', status: 2 },
];

// ---------- Estilos (variables de tema + utilidades propias) ----------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.zl-root{
  --bg:#F3F3F5; --card:#FFFFFF; --text:#15151E; --muted:#5F626E; --faint:#9A9CA8;
  --line:#DFE0E6; --field:#FFFFFF; --field-alt:#F3F3F5;
  --panel:#F3F3F5; --panel-text:#15151E; --panel-muted:#5F626E; --panel-card:#FFFFFF; --grid:rgba(21,21,30,.05);
  --shadow:0 30px 60px -20px rgba(21,21,30,.25);
  background:var(--bg); color:var(--text); font-family:Inter,system-ui,sans-serif;
  transition:background-color .3s ease,color .3s ease;
}
.zl-root[data-theme='dark']{
  --bg:#0F0F15; --card:#1B1C25; --text:#F3F3F5; --muted:#A3A6B3; --faint:#6E7180;
  --line:#34363F; --field:#15151E; --field-alt:#292B33;
  --panel:#15151E; --panel-text:#FFFFFF; --panel-muted:#A3A6B3; --panel-card:#20212B; --grid:rgba(255,255,255,.04);
  --shadow:0 30px 70px -20px rgba(0,0,0,.7);
}
.zl-head{font-family:Montserrat,Inter,system-ui,sans-serif;}
.zl-card{background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);transition:background-color .3s,border-color .3s;}
.zl-muted{color:var(--muted);}
.zl-faint{color:var(--faint);}
.zl-label{display:block;font-size:.8125rem;font-weight:600;margin-bottom:.375rem;color:var(--text);}
.zl-field{display:flex;align-items:center;border:1px solid var(--line);background:var(--field);border-radius:12px;padding:0 .75rem;transition:border-color .2s,box-shadow .2s,background-color .3s;overflow:hidden;}
.zl-field:focus-within{border-color:#E10600;box-shadow:0 0 0 3px rgba(225,6,0,.18);}
.zl-field[data-invalid='true']{border-color:#E10600;}
.zl-field input{width:100%;background:transparent;outline:none;border:0;color:var(--text);padding:.8rem .6rem;font-size:.875rem;}
.zl-field input::placeholder{color:var(--faint);}
.zl-field input:disabled{opacity:.6;}
.zl-field input:-webkit-autofill{-webkit-text-fill-color:var(--text);box-shadow:0 0 0 40px var(--field) inset;caret-color:var(--text);}
.zl-suffix{align-self:stretch;display:flex;align-items:center;margin:0 -.75rem 0 .25rem;padding:0 .875rem;font-size:.8125rem;color:var(--muted);background:var(--field-alt);border-left:1px solid var(--line);white-space:nowrap;}
.zl-btn{display:flex;width:100%;align-items:center;justify-content:center;gap:.5rem;border-radius:12px;padding:.85rem 1rem;font-weight:700;font-size:.9rem;transition:background-color .2s,transform .1s,opacity .2s,border-color .2s;cursor:pointer;}
.zl-btn:active:not(:disabled){transform:scale(.99);}
.zl-btn:disabled{opacity:.6;cursor:not-allowed;}
.zl-primary{background:#E10600;color:#fff;box-shadow:0 8px 20px -8px rgba(225,6,0,.6);}
.zl-primary:hover:not(:disabled){background:#A80703;}
.zl-secondary{background:transparent;color:var(--text);border:1px solid var(--line);}
.zl-secondary:hover:not(:disabled){background:var(--field-alt);}
.zl-link{font-weight:700;color:var(--text);transition:color .2s;cursor:pointer;background:none;border:0;padding:0;}
.zl-link:hover{color:#E10600;}
.zl-root :focus-visible{outline:2px solid #E10600;outline-offset:2px;}
.zl-field input:focus-visible{outline:none;}
.zl-seg{display:inline-flex;padding:3px;gap:2px;border-radius:10px;border:1px solid var(--line);background:var(--field-alt);}
.zl-seg button{display:grid;place-items:center;width:30px;height:28px;border-radius:7px;color:var(--muted);transition:background-color .2s,color .2s;}
.zl-seg button[aria-checked='true']{background:#E10600;color:#fff;}
.zl-seg button:not([aria-checked='true']):hover{color:var(--text);}
.zl-otp{width:2.75rem;height:3.25rem;text-align:center;font-size:1.25rem;font-weight:700;border-radius:12px;border:1px solid var(--line);background:var(--field);color:var(--text);outline:none;transition:border-color .2s,box-shadow .2s;}
.zl-otp:focus{border-color:#E10600;box-shadow:0 0 0 3px rgba(225,6,0,.18);}
.zl-chip{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;padding:.15rem .55rem;font-size:.6875rem;font-weight:600;transition:background-color .5s,color .5s;white-space:nowrap;}
.zl-error{border:1px solid rgba(225,6,0,.35);background:rgba(225,6,0,.08);color:#E10600;border-radius:12px;padding:.6rem .75rem;font-size:.8125rem;}
.zl-root[data-theme='dark'] .zl-error{color:#FF6B66;}
@keyframes zl-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(3px)}30%,50%,70%{transform:translateX(-5px)}40%,60%{transform:translateX(5px)}}
.zl-shake{animation:zl-shake .45s cubic-bezier(.36,.07,.19,.97);}
@keyframes zl-pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
.zl-pop{animation:zl-pop .5s ease-out both;}
@keyframes zl-progress{from{width:0}to{width:100%}}
.zl-progress{animation:zl-progress 1.8s ease-in-out forwards;}
@keyframes zl-stripe{from{transform:translateX(-30%)}to{transform:translateX(0)}}
.zl-stripe{animation:zl-stripe 1.1s cubic-bezier(.2,.8,.2,1) both;}
@media (prefers-reduced-motion:reduce){.zl-shake,.zl-pop,.zl-progress,.zl-stripe{animation:none!important}.zl-progress{width:100%}}
`;

export default function ZyraLogin() {
  const router = useRouter();
  // Una sola referencia estable al cliente de navegador (@supabase/ssr) durante la vida del componente.
  const supabase = useMemo(() => createClient(), []);

  // ----- Tema -----
  const [theme, setTheme] = useState<Theme>('system');
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  // ----- Formulario -----
  const [step, setStep] = useState<Step>('credentials');
  const [mode, setMode] = useState<Mode>('password');
  const [workspace, setWorkspace] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // ----- Seguridad (límite visual en el cliente; el límite real lo aplica Supabase) -----
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(0);

  // ----- OTP / MFA -----
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const mfaFactorId = useRef<string | null>(null);

  // ----- Panel en vivo -----
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const emailIsValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const workspaceIsValid = workspace.length >= 3;
  const secondsLeft = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const isLocked = secondsLeft > 0;

  // Carga inicial: tema guardado, último taller y preferencia del sistema
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') setTheme(savedTheme);
      const savedWs = localStorage.getItem(WORKSPACE_KEY);
      if (savedWs) {
        setWorkspace(savedWs);
        setRemember(true);
      }
    } catch {
      /* localStorage no disponible */
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    setMounted(true);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const changeTheme = (t: Theme) => {
    setTheme(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      /* ignorar */
    }
  };

  // Cuenta regresiva del bloqueo
  useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    setNow(Date.now());
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= lockedUntil) {
        clearInterval(id);
        setError('');
      }
    }, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  // Órdenes en vivo: cada 2.8 s una orden avanza de estado
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setOrders((prev) =>
        prev.map((o, idx) => (idx === i % prev.length ? { ...o, status: (o.status + 1) % STATUS.length } : o))
      );
      i += 1;
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const inProgress = useMemo(() => orders.filter((o) => o.status === 1).length, [orders]);
  const completed = useMemo(() => 8 + orders.filter((o) => o.status === 2).length, [orders]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  }, []);

  const fail = (msg: string) => {
    setError(msg);
    triggerShake();
  };

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
  };

  const persistWorkspace = () => {
    try {
      if (remember) localStorage.setItem(WORKSPACE_KEY, workspace);
      else localStorage.removeItem(WORKSPACE_KEY);
    } catch {
      /* ignorar */
    }
  };

  const finishLogin = () => {
    setStep('success');
    router.replace(POST_LOGIN_PATH);
    router.refresh();
  };

  // ----- Handlers -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (isLocked) {
      fail(`Demasiados intentos. Intenta de nuevo en ${secondsLeft} s.`);
      return;
    }
    if (!workspace || !email || (mode === 'password' && !password)) {
      fail(mode === 'password' ? 'Ingresa tu taller, correo y contraseña para continuar.' : 'Ingresa tu taller y correo para continuar.');
      return;
    }
    if (!emailIsValid) {
      fail('Revisa el formato de tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      // ----- Enlace mágico -----
      if (mode === 'magic') {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            shouldCreateUser: false, // el login no debe registrar cuentas nuevas
          },
        });
        if (otpError) {
          fail(authMessage(otpError));
          return;
        }
        persistWorkspace();
        setStep('magic-sent');
        return;
      }

      // ----- Contraseña -----
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        // Solo las credenciales incorrectas cuentan para el bloqueo visual.
        if (signInError.code === 'invalid_credentials') {
          const next = attempts + 1;
          if (next >= MAX_ATTEMPTS) {
            setAttempts(0);
            setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
            setNow(Date.now());
            fail(`Demasiados intentos. Por seguridad, espera ${LOCK_SECONDS} s.`);
          } else {
            setAttempts(next);
            fail(`${authMessage(signInError)} Te quedan ${MAX_ATTEMPTS - next} intentos.`);
          }
        } else {
          fail(authMessage(signInError));
        }
        return;
      }

      setAttempts(0);
      persistWorkspace();

      // ¿La cuenta exige segundo factor?
      const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) {
        fail(authMessage(aalError));
        return;
      }

      if (aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) {
          fail(authMessage(factorsError));
          return;
        }
        const totp = factors.totp[0]; // solo factores verificados
        if (!totp) {
          await supabase.auth.signOut();
          fail('Tu cuenta requiere verificación en dos pasos, pero no tiene un factor configurado. Contacta a tu administrador.');
          return;
        }
        mfaFactorId.current = totp.id;
        setOtp(Array(6).fill(''));
        setStep('otp');
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        return;
      }

      finishLogin();
    } catch (err) {
      fail(toMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Ingreso con Google (Supabase OAuth).
  // Si todo sale bien, el navegador se va a Google y luego vuelve a /auth/callback,
  // por eso no apagamos el "loading" en el caso exitoso.
  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    persistWorkspace();

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        fail(authMessage(oauthError));
        setLoading(false);
      }
    } catch (err) {
      fail(toMessage(err));
      setLoading(false);
    }
  };

  const submitOtp = async (digits: string[]) => {
    const code = digits.join('');
    const factorId = mfaFactorId.current;
    if (code.length < 6 || loading || !factorId) return;
    setLoading(true);
    setError('');

    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) {
        fail(authMessage(challengeError));
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) {
        fail(authMessage(verifyError));
        setOtp(Array(6).fill(''));
        otpRefs.current[0]?.focus();
        return;
      }

      finishLogin();
    } catch (err) {
      fail(toMessage(err));
      setOtp(Array(6).fill(''));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every(Boolean)) submitOtp(next);
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill('');
    pasted.split('').forEach((d, idx) => (next[idx] = d));
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) submitOtp(next);
  };

  const backToCredentials = async () => {
    // Si ya había una sesión parcial (aal1) esperando el segundo factor, se cierra.
    if (step === 'otp') {
      try {
        await supabase.auth.signOut();
      } catch {
        /* ignorar: el usuario vuelve al formulario de todos modos */
      }
      mfaFactorId.current = null;
    }
    setStep('credentials');
    setError('');
    setPassword('');
  };

  // ---------- Render ----------
  return (
    <div
      className="zl-root min-h-screen flex items-center justify-center p-4"
      data-theme={mounted ? resolvedTheme : 'light'}
    >
      <style>{STYLES}</style>

      <div className="zl-card w-full max-w-4xl rounded-2xl flex overflow-hidden">
        {/* ---------- Panel izquierdo: identidad + operación en vivo ---------- */}
        <div className="hidden md:block relative w-[46%] shrink-0">
          <div
            className="absolute inset-y-0 left-0 w-[calc(100%+10px)] bg-[#E10600] zl-stripe"
            style={{ clipPath: 'polygon(0 0, 100% 0, 87% 100%, 0 100%)' }}
          />
          <div
            className="absolute inset-y-0 left-0 w-full p-9 flex flex-col"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)',
              background: 'var(--panel)',
              color: 'var(--panel-text)',
              transition: 'background-color .3s, color .3s',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <ZyraMark className="w-9 h-6" />
                <span className="zl-head font-bold text-xl tracking-tight">Zyra</span>
                <span className="text-xs font-medium" style={{ color: 'var(--panel-muted)' }}>AutoSaaS</span>
              </div>

              <div className="max-w-[290px]">
                <h1 className="zl-head font-extrabold text-[1.9rem] leading-[1.15] mb-3">
                  Tu taller,
                  <br />
                  bajo control total.
                </h1>
                <p className="text-[0.9rem] leading-relaxed" style={{ color: 'var(--panel-muted)' }}>
                  Órdenes de servicio, cotizaciones e inventario en un solo panel, sin importar cuántas sucursales operes.
                </p>
              </div>

              {/* Órdenes en vivo */}
              <div
                className="mt-7 rounded-xl p-3.5 max-w-[300px]"
                style={{ background: 'var(--panel-card)', border: '1px solid var(--line)' }}
                aria-label="Vista previa de órdenes de servicio en tiempo real"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold">Órdenes de servicio</span>
                  <span className="text-[0.6875rem]" style={{ color: 'var(--panel-muted)' }}>
                    {inProgress} en proceso · {completed} hoy
                  </span>
                </div>
                <ul className="space-y-2">
                  {orders.map((o) => {
                    const s = STATUS[o.status];
                    return (
                      <li key={o.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{o.service}</p>
                          <p className="text-[0.6875rem] truncate" style={{ color: 'var(--panel-muted)' }}>
                            #{o.id} {o.car}
                          </p>
                        </div>
                        <span className="zl-chip" style={{ background: `${s.color}26`, color: s.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                          {s.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-auto pt-6">
                <div className="flex items-center gap-2 text-[0.8rem] mb-2" style={{ color: 'var(--panel-muted)' }}>
                  <span className="relative flex h-2 w-2">
                    <span className="motion-safe:animate-ping motion-reduce:hidden absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Plataforma operando con normalidad
                </div>
                <p className="text-[0.8rem]" style={{ color: 'var(--panel-muted)' }}>
                  <span className="font-semibold" style={{ color: 'var(--panel-text)' }}>{WORKSHOPS_ONLINE} talleres</span>{' '}
                  registrando servicios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Panel derecho ---------- */}
        <div className="w-full md:w-[54%] p-7 sm:p-11 flex flex-col justify-center min-h-[620px]">
          {/* Barra superior: logo móvil + selector de tema */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2 md:invisible">
              <ZyraMark className="w-8 h-5" />
              <span className="zl-head font-bold text-lg">Zyra</span>
            </div>
            <div className="zl-seg" role="radiogroup" aria-label="Tema de la interfaz">
              {([
                ['light', Sun, 'Claro'],
                ['dark', Moon, 'Oscuro'],
                ['system', Monitor, 'Sistema'],
              ] as const).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={theme === value}
                  aria-label={label}
                  title={label}
                  onClick={() => changeTheme(value)}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* ===== Paso: credenciales ===== */}
          {step === 'credentials' && (
            <>
              <h2 className="zl-head font-bold text-[1.7rem] mb-1.5">Inicia sesión</h2>
              <p className="zl-muted text-sm mb-7">
                {mode === 'password' ? 'Ingresa a tu panel de control operativo.' : 'Te enviamos un enlace al correo para entrar sin contraseña.'}
              </p>

              <form onSubmit={handleSubmit} noValidate className={shake ? 'zl-shake' : ''}>
                <div className="space-y-4">
                  {/* Taller */}
                  <div>
                    <label htmlFor="workspace" className="zl-label">Tu taller</label>
                    <div className="zl-field" data-invalid={false}>
                      <input
                        id="workspace"
                        type="text"
                        autoComplete="organization"
                        value={workspace}
                        onChange={(e) => setWorkspace(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-'))}
                        placeholder="taller-hermanos-lopez"
                        disabled={loading}
                      />
                      <span className="zl-suffix ml-2">.zyra.app</span>
                    </div>
                    {workspaceIsValid && (
                      <p className="text-xs mt-1.5 zl-faint">Ingresarás a {workspace}.zyra.app</p>
                    )}
                  </div>

                  {/* Correo */}
                  <div>
                    <label htmlFor="email" className="zl-label">Correo electrónico</label>
                    <div className="zl-field" data-invalid={!emailIsValid}>
                      <Mail className="w-4 h-4 zl-faint shrink-0" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="taller@ejemplo.com"
                        disabled={loading}
                      />
                    </div>
                    {!emailIsValid && <p className="text-xs mt-1.5" style={{ color: '#E10600' }}>Ese correo no parece válido.</p>}
                  </div>

                  {/* Contraseña */}
                  {mode === 'password' && (
                    <div>
                      <label htmlFor="password" className="zl-label">Contraseña</label>
                      <div className="zl-field">
                        <Lock className="w-4 h-4 zl-faint shrink-0" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyUp={handleKeyEvent}
                          onKeyDown={handleKeyEvent}
                          placeholder="••••••••"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="zl-faint hover:opacity-80 transition-opacity"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {capsLockOn && (
                        <p className="flex items-center gap-1.5 text-xs text-amber-500 mt-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Bloq Mayús está activado.
                        </p>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="zl-error" role="alert">
                      {isLocked ? `Demasiados intentos. Intenta de nuevo en ${secondsLeft} s.` : error}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm pt-0.5">
                    <label className="flex items-center gap-2 zl-muted cursor-pointer font-medium select-none">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#E10600]"
                      />
                      Recordar mi taller
                    </label>
                    {mode === 'password' && (
                      <a href="#" className="zl-link text-sm">¿Olvidaste tu contraseña?</a>
                    )}
                  </div>

                  <button type="submit" disabled={loading || isLocked} className="zl-btn zl-primary">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {mode === 'password' ? 'Verificando credenciales…' : 'Enviando enlace…'}
                      </>
                    ) : isLocked ? (
                      `Bloqueado ${secondsLeft} s`
                    ) : mode === 'password' ? (
                      'Ingresar al sistema'
                    ) : (
                      'Enviar enlace de acceso'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'password' ? 'magic' : 'password');
                      setError('');
                    }}
                    className="zl-btn zl-secondary"
                    disabled={loading}
                  >
                    {mode === 'password' ? (
                      <>
                        <Sparkles className="w-4 h-4" /> Entrar con enlace al correo
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" /> Usar contraseña
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                    <span className="zl-faint text-xs font-medium">o continúa con</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                  </div>

                  <button type="button" onClick={handleGoogleLogin} disabled={loading} className="zl-btn zl-secondary">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Ingresar con Google
                  </button>

                  <p className="text-center text-sm zl-muted pt-1">
                    ¿Nuevo en Zyra?{' '}
                    <a href="#" className="zl-link">Solicita una demo</a>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* ===== Paso: enlace enviado ===== */}
          {step === 'magic-sent' && (
            <div className="text-center">
              <div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-2xl zl-pop" style={{ background: 'rgba(225,6,0,.12)', color: '#E10600' }}>
                <Mail className="w-7 h-7" />
              </div>
              <h2 className="zl-head font-bold text-[1.5rem] mb-2">Revisa tu correo</h2>
              <p className="zl-muted text-sm mb-1">Enviamos un enlace de acceso a</p>
              <p className="font-semibold text-sm mb-6 break-all">{email}</p>
              <p className="zl-faint text-xs mb-6">El enlace funciona una sola vez y caduca en poco tiempo.</p>
              <button type="button" className="zl-btn zl-secondary" onClick={backToCredentials}>
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </button>
            </div>
          )}

          {/* ===== Paso: verificación en dos pasos ===== */}
          {step === 'otp' && (
            <div className={shake ? 'zl-shake' : ''}>
              <div className="mb-5 grid place-items-center w-12 h-12 rounded-xl" style={{ background: 'rgba(225,6,0,.12)', color: '#E10600' }}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="zl-head font-bold text-[1.6rem] mb-1.5">Verificación en dos pasos</h2>
              <p className="zl-muted text-sm mb-6">Ingresa el código de 6 dígitos de tu app de autenticación.</p>

              <div className="flex gap-2 sm:gap-2.5 mb-4" role="group" aria-label="Código de verificación">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    className="zl-otp"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={d}
                    disabled={loading}
                    aria-label={`Dígito ${i + 1}`}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                  />
                ))}
              </div>

              {error && <div className="zl-error mb-4" role="alert">{error}</div>}

              <button type="button" className="zl-btn zl-primary mb-3" disabled={loading || otp.some((d) => !d)} onClick={() => submitOtp(otp)}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verificando…
                  </>
                ) : (
                  'Verificar y entrar'
                )}
              </button>
              <button type="button" className="zl-btn zl-secondary" onClick={backToCredentials} disabled={loading}>
                <ArrowLeft className="w-4 h-4" /> Usar otra cuenta
              </button>
            </div>
          )}

          {/* ===== Paso: éxito ===== */}
          {step === 'success' && (
            <div className="text-center" aria-live="polite">
              <div className="mx-auto mb-5 grid place-items-center w-16 h-16 rounded-full bg-green-500 text-white zl-pop">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="zl-head font-bold text-[1.6rem] mb-2">Bienvenido de vuelta</h2>
              <p className="zl-muted text-sm mb-6">
                Entrando a <span className="font-semibold" style={{ color: 'var(--text)' }}>{workspace || 'tu taller'}.zyra.app</span>
              </p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--field-alt)' }}>
                <div className="h-full rounded-full bg-[#E10600] zl-progress" />
              </div>
            </div>
          )}

          {step !== 'success' && (
            <div className="flex items-center justify-center gap-1.5 text-xs zl-faint pt-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              Conexión cifrada y datos aislados por taller
            </div>
          )}
        </div>
      </div>
    </div>
  );
}