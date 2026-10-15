'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAuthError, type AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';

/**
 * Zyra AutoSaaS — Login v5 (Supabase Auth, autenticación centralizada)
 *
 * El usuario ingresa con correo y contraseña, se registra con correo y contraseña,
 * o usa Google. El taller (tenant_id) lo resuelve el sistema a partir de los claims del JWT.
 *
 * Tema: lo controla <ThemeToggle /> (mismo botón y misma clave 'zyra-theme' que la landing).
 * Pone data-theme en <html>; aquí solo se leen las variables CSS. Sin atributo manda el dispositivo.
 *
 * Autenticación:
 *  - Contraseña: supabase.auth.signInWithPassword
 *  - Registro: supabase.auth.signUp({ email, password }) -> /auth/callback?next=/{locale}/onboarding
 *  - Recuperar contraseña: supabase.auth.resetPasswordForEmail -> /auth/callback?next=/{locale}/reset-password
 *  - Google: supabase.auth.signInWithOAuth con redirectTo -> /auth/callback
 *  - 2FA (TOTP): supabase.auth.mfa (challenge + verify) cuando la cuenta lo exige
 *
 * Requiere:
 *  - '@/lib/supabase/client' exportando createClient()
 *  - app/auth/callback/route.ts que intercambia el code por sesión
 *  - `${origin}/auth/callback` en "Redirect URLs" de Supabase
 */

const WORKSHOPS_ONLINE = 128;
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

// Debe coincidir con Auth → Providers → Email → "Minimum password length" en Supabase.
const MIN_PASSWORD = 8;

// Ruta a la que se va después de iniciar sesión.
const POST_LOGIN_PATH = '/workshop/dashboard';

type Step = 'credentials' | 'forgot' | 'forgot-sent' | 'signup' | 'signup-sent' | 'otp' | 'success';
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
    case 'user_not_found':
      return 'No encontramos una cuenta con ese correo.';
    case 'signup_disabled':
      return 'El registro con correo está deshabilitado temporalmente.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.';
    case 'weak_password':
      return `La contraseña es muy débil. Usa al menos ${MIN_PASSWORD} caracteres, combinando letras y números.`;
    case 'validation_failed':
      return 'Revisa que tu correo y contraseña sean válidos.';
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
const Check = mk(<path d="m5 12 5 5 9-10" />, 3);
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

// ---------- Órdenes "en vivo" del panel izquierdo (vista previa decorativa) ----------
// El color de cada estado sale de variables CSS con un tono distinto por tema, para mantener contraste.
const STATUS = [
  { label: 'Pendiente', color: 'var(--st-pending)' },
  { label: 'En proceso', color: 'var(--st-progress)' },
  { label: 'Completada', color: 'var(--st-done)' },
];

const INITIAL_ORDERS = [
  { id: '0012', client: 'Carlos Méndez', car: 'Nissan Sentra', service: 'Cambio de aceite', status: 1 },
  { id: '0011', client: 'Ana López', car: 'Toyota Corolla', service: 'Afinación', status: 0 },
  { id: '0010', client: 'Jorge Ramírez', car: 'Ford Fiesta', service: 'Diagnóstico', status: 2 },
];

// ---------- Estilos (variables de tema + utilidades propias) ----------
// Tema: sin data-theme en <html> manda el dispositivo; con data-theme='light'|'dark' manda el botón.
const DARK = `
  --bg:#0F0F15; --card:#1B1C25; --text:#F3F3F5; --muted:#A3A6B3; --faint:#8A8D9A;
  --line:#34363F; --field:rgba(9,9,11,.8); --field-solid:#09090B; --field-line:#27272A; --field-text:#FFFFFF; --field-alt:#292B33;
  --panel:#15151E; --panel-text:#FFFFFF; --panel-muted:#B8BBC7; --panel-card:#20212B; --panel-line:#3A3C47; --grid:rgba(255,255,255,.05);
  --st-pending:#FBBF24; --st-progress:#A78BFA; --st-done:#4ADE80;
  --err:#FF6B66; --shadow:0 30px 70px -20px rgba(0,0,0,.7);
`;

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.zl-root{
  --bg:#F3F3F5; --card:#FFFFFF; --text:#15151E; --muted:#5F626E; --faint:#7B7E8B;
  --line:#DFE0E6; --field:#FFFFFF; --field-solid:#FFFFFF; --field-line:#D4D4D8; --field-text:#15151E; --field-alt:#F3F3F5;
  --panel:#F3F3F5; --panel-text:#15151E; --panel-muted:#4B4E5A; --panel-card:#FFFFFF; --panel-line:#DFE0E6; --grid:rgba(21,21,30,.06);
  --st-pending:#B45309; --st-progress:#6D28D9; --st-done:#15803D;
  --err:#DC2626; --shadow:0 30px 60px -20px rgba(21,21,30,.25);
  background:var(--bg); color:var(--text); font-family:Inter,system-ui,sans-serif;
  transition:background-color .3s ease,color .3s ease;
}
@media (prefers-color-scheme:dark){:root:not([data-theme='light']) .zl-root{${DARK}}}
:root[data-theme='dark'] .zl-root{${DARK}}

.zl-head{font-family:Montserrat,Inter,system-ui,sans-serif;}
.zl-card{background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);transition:background-color .3s,border-color .3s;}
.zl-muted{color:var(--muted);}
.zl-faint{color:var(--faint);}
.zl-label{display:block;font-size:.8125rem;font-weight:600;margin-bottom:.375rem;color:var(--text);}

/* Inputs: borde visible al enfocar (red-500 + anillo de 1px) */
.zl-field{display:flex;align-items:center;border:1px solid var(--field-line);background:var(--field);border-radius:12px;padding:0 .75rem;transition:border-color .2s,box-shadow .2s,background-color .3s;overflow:hidden;}
.zl-field:focus-within{border-color:#EF4444;box-shadow:0 0 0 1px #EF4444;}
.zl-field[data-invalid='true']{border-color:#EF4444;}
.zl-field input{width:100%;background:transparent;outline:none;border:0;color:var(--field-text);padding:.8rem .6rem;font-size:.875rem;}
.zl-field input::placeholder{color:var(--faint);}
.zl-field input:disabled{opacity:.6;}
.zl-field input:-webkit-autofill{-webkit-text-fill-color:var(--field-text);box-shadow:0 0 0 40px var(--field-solid) inset;caret-color:var(--field-text);}

.zl-btn{display:flex;width:100%;align-items:center;justify-content:center;gap:.5rem;border-radius:12px;padding:.8rem 1rem;font-size:.9rem;transition:background-color .2s,transform .1s,opacity .2s,border-color .2s;cursor:pointer;}
.zl-btn:active:not(:disabled){transform:scale(.99);}
.zl-btn:disabled{opacity:.6;cursor:not-allowed;}
.zl-secondary{background:transparent;color:var(--text);border:1px solid var(--line);font-weight:700;}
.zl-secondary:hover:not(:disabled){background:var(--field-alt);}
.zl-link{font-weight:700;color:var(--text);transition:color .2s;cursor:pointer;background:none;border:0;padding:0;}
.zl-link:hover{color:#EF4444;}
.zl-root :focus-visible{outline:2px solid #EF4444;outline-offset:2px;}
.zl-field input:focus-visible{outline:none;}

.zl-otp{width:2.75rem;height:3.25rem;text-align:center;font-size:1.25rem;font-weight:700;border-radius:12px;border:1px solid var(--field-line);background:var(--field);color:var(--field-text);outline:none;transition:border-color .2s,box-shadow .2s;}
.zl-otp:focus{border-color:#EF4444;box-shadow:0 0 0 1px #EF4444;}
.zl-chip{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;padding:.15rem .55rem;font-size:.6875rem;font-weight:600;transition:background-color .5s,color .5s;white-space:nowrap;background:color-mix(in srgb,currentColor 16%,transparent);}
.zl-error{border:1px solid rgba(220,38,38,.4);background:rgba(220,38,38,.08);color:var(--err);border-radius:12px;padding:.6rem .75rem;font-size:.8125rem;}
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
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || 'es';
  // Una sola referencia estable al cliente de navegador (@supabase/ssr) durante la vida del componente.
  const supabase = useMemo(() => createClient(), []);

  // ----- Formulario -----
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
  const secondsLeft = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const isLocked = secondsLeft > 0;

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

  // Si /auth/callback falló (enlace vencido o inválido), explica por qué.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error')) {
      setError('El enlace es inválido o ya venció. Intenta de nuevo.');
    }
  }, []);

  // Si ya hay sesión a medias (falta el 2.º factor), retoma el paso del código.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active || !aal) return;
      if (aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp = factors?.totp?.[0];
        if (!active || !totp) return;
        mfaFactorId.current = totp.id;
        setOtp(Array(6).fill(''));
        setStep('otp');
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

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

  const finishLogin = () => {
    setStep('success');
    router.replace(`/${locale}${POST_LOGIN_PATH}`);
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
    if (!email || !password) {
      fail('Ingresa tu correo y contraseña para continuar.');
      return;
    }
    if (!emailIsValid) {
      fail('Revisa el formato de tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      // ----- Contraseña -----
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
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

  // Registro con correo y contraseña. signUp guarda la contraseña (hasheada) en auth.users,
  // así "¿Olvidaste tu contraseña?" funciona con cuentas creadas por aquí.
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!email || !password || !confirmPassword) {
      fail('Completa correo y contraseña para continuar.');
      return;
    }
    if (!emailIsValid) {
      fail('Revisa el formato de tu correo electrónico.');
      return;
    }
    if (password.length < MIN_PASSWORD) {
      fail(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    if (password !== confirmPassword) {
      fail('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // Si la confirmación de correo está activa, el enlace termina en el onboarding.
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/onboarding`,
        },
      });

      if (signUpError) {
        fail(authMessage(signUpError));
        return;
      }

      // Con confirmación activa, Supabase NO devuelve error si el correo ya existe:
      // devuelve un usuario "ofuscado" con identities vacío. Lo detectamos aquí.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        fail('Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.');
        return;
      }

      // Confirmación desactivada: ya hay sesión -> directo a registrar el taller.
      if (data.session) {
        setStep('success');
        router.replace(`/${locale}/onboarding`);
        router.refresh();
        return;
      }

      // Confirmación activada: hay que abrir el correo.
      setPassword('');
      setConfirmPassword('');
      setStep('signup-sent');
    } catch (err) {
      fail(toMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Recuperar contraseña: Supabase manda un correo con un enlace que pasa por /auth/callback
  // (crea la sesión de recuperación) y termina en la página de nueva contraseña.
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!email) {
      fail('Ingresa tu correo para continuar.');
      return;
    }
    if (!emailIsValid) {
      fail('Revisa el formato de tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/reset-password`,
      });
      if (resetError) {
        fail(authMessage(resetError));
        return;
      }
      setStep('forgot-sent');
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
    setConfirmPassword('');
  };

  // ---------- Render ----------
  return (
    <div className="zl-root min-h-screen flex items-center justify-center p-4">
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
                <h1 className="zl-head font-extrabold text-[1.9rem] leading-[1.15] mb-3" style={{ color: 'var(--panel-text)' }}>
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
                style={{ background: 'var(--panel-card)', border: '1px solid var(--panel-line)' }}
                aria-label="Vista previa de órdenes de servicio en tiempo real"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--panel-text)' }}>Órdenes de servicio</span>
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
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--panel-text)' }}>{o.service}</p>
                          <p className="text-[0.6875rem] truncate" style={{ color: 'var(--panel-muted)' }}>
                            #{o.id} {o.car}
                          </p>
                        </div>
                        <span className="zl-chip" style={{ color: s.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
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
          {/* Barra superior: logo móvil + botón de tema (el mismo en todas las páginas) */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2 md:invisible">
              <ZyraMark className="w-8 h-5" />
              <span className="zl-head font-bold text-lg">Zyra</span>
            </div>
            <ThemeToggle />
          </div>

          {/* ===== Paso: credenciales ===== */}
          {step === 'credentials' && (
            <>
              <h2 className="zl-head font-bold text-[1.7rem] mb-1.5">Inicia sesión</h2>
              <p className="zl-muted text-sm mb-7">Ingresa a tu panel de control operativo.</p>

              <form onSubmit={handleSubmit} noValidate className={shake ? 'zl-shake' : ''}>
                <div className="space-y-4">
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
                    {!emailIsValid && <p className="text-xs mt-1.5" style={{ color: 'var(--err)' }}>Ese correo no parece válido.</p>}
                  </div>

                  {/* Contraseña */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="zl-label !mb-0">Contraseña</label>
                      <button
                        type="button"
                        className="zl-link text-xs"
                        onClick={() => {
                          setError('');
                          setStep('forgot');
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
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

                  {error && (
                    <div className="zl-error" role="alert">
                      {isLocked ? `Demasiados intentos. Intenta de nuevo en ${secondsLeft} s.` : error}
                    </div>
                  )}

                  {/* Botón primario */}
                  <button
                    type="submit"
                    disabled={loading || isLocked}
                    className="zl-btn bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 shadow-lg shadow-red-600/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando credenciales…
                      </>
                    ) : isLocked ? (
                      `Bloqueado ${secondsLeft} s`
                    ) : (
                      'Ingresar al sistema'
                    )}
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                    <span className="zl-faint text-xs font-medium">o continúa con</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                  </div>

                  {/* Botón Google: claro/neutro en ambos temas */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="zl-btn bg-white text-zinc-900 hover:bg-zinc-100 font-medium border border-zinc-200 rounded-xl py-3"
                  >
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
                    <button
                      type="button"
                      className="zl-link"
                      onClick={() => {
                        setError('');
                        setPassword('');
                        setConfirmPassword('');
                        setStep('signup');
                      }}
                    >
                      Crear cuenta con correo
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* ===== Paso: crear cuenta con correo y contraseña ===== */}
          {step === 'signup' && (
            <>
              <h2 className="zl-head font-bold text-[1.7rem] mb-1.5">Crea tu cuenta</h2>
              <p className="zl-muted text-sm mb-7">
                Regístrate con tu correo. En el siguiente paso registrarás tu taller.
              </p>

              <form onSubmit={handleSignUp} noValidate className={shake ? 'zl-shake' : ''}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="signup-email" className="zl-label">Correo electrónico</label>
                    <div className="zl-field" data-invalid={!emailIsValid}>
                      <Mail className="w-4 h-4 zl-faint shrink-0" />
                      <input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="taller@ejemplo.com"
                        disabled={loading}
                      />
                    </div>
                    {!emailIsValid && <p className="text-xs mt-1.5" style={{ color: 'var(--err)' }}>Ese correo no parece válido.</p>}
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="zl-label">Contraseña</label>
                    <div className="zl-field">
                      <Lock className="w-4 h-4 zl-faint shrink-0" />
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={handleKeyEvent}
                        onKeyDown={handleKeyEvent}
                        placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
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

                  <div>
                    <label htmlFor="signup-confirm" className="zl-label">Confirma tu contraseña</label>
                    <div className="zl-field" data-invalid={confirmPassword !== '' && confirmPassword !== password}>
                      <Lock className="w-4 h-4 zl-faint shrink-0" />
                      <input
                        id="signup-confirm"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && <div className="zl-error" role="alert">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="zl-btn bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 shadow-lg shadow-red-600/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta…
                      </>
                    ) : (
                      'Crear cuenta'
                    )}
                  </button>
                  <button type="button" className="zl-btn zl-secondary" onClick={backToCredentials} disabled={loading}>
                    <ArrowLeft className="w-4 h-4" /> Ya tengo cuenta
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ===== Paso: confirma tu correo ===== */}
          {step === 'signup-sent' && (
            <div className="text-center">
              <div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-2xl zl-pop" style={{ background: 'rgba(225,6,0,.12)', color: '#EF4444' }}>
                <Mail className="w-7 h-7" />
              </div>
              <h2 className="zl-head font-bold text-[1.5rem] mb-2">Confirma tu correo</h2>
              <p className="zl-muted text-sm mb-1">Te enviamos un enlace de confirmación a</p>
              <p className="font-semibold text-sm mb-4 break-all">{email}</p>
              <p className="zl-faint text-xs mb-6">
                Ábrelo para continuar con el registro de tu taller. Si no lo ves, revisa spam.
              </p>
              <button type="button" className="zl-btn zl-secondary" onClick={backToCredentials}>
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </button>
            </div>
          )}

          {/* ===== Paso: recuperar contraseña ===== */}
          {step === 'forgot' && (
            <>
              <h2 className="zl-head font-bold text-[1.7rem] mb-1.5">Recupera tu contraseña</h2>
              <p className="zl-muted text-sm mb-7">Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva.</p>

              <form onSubmit={handleForgot} noValidate className={shake ? 'zl-shake' : ''}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="zl-label">Correo electrónico</label>
                    <div className="zl-field" data-invalid={!emailIsValid}>
                      <Mail className="w-4 h-4 zl-faint shrink-0" />
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="username"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="taller@ejemplo.com"
                        disabled={loading}
                      />
                    </div>
                    {!emailIsValid && <p className="text-xs mt-1.5" style={{ color: 'var(--err)' }}>Ese correo no parece válido.</p>}
                  </div>

                  {error && <div className="zl-error" role="alert">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="zl-btn bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 shadow-lg shadow-red-600/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Enviando enlace…
                      </>
                    ) : (
                      'Enviar enlace de recuperación'
                    )}
                  </button>
                  <button type="button" className="zl-btn zl-secondary" onClick={backToCredentials} disabled={loading}>
                    <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ===== Paso: enlace de recuperación enviado ===== */}
          {step === 'forgot-sent' && (
            <div className="text-center">
              <div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-2xl zl-pop" style={{ background: 'rgba(225,6,0,.12)', color: '#EF4444' }}>
                <Mail className="w-7 h-7" />
              </div>
              <h2 className="zl-head font-bold text-[1.5rem] mb-2">Revisa tu correo</h2>
              <p className="zl-muted text-sm mb-1">Si existe una cuenta con</p>
              <p className="font-semibold text-sm mb-1 break-all">{email}</p>
              <p className="zl-muted text-sm mb-6">te enviamos un enlace para crear una contraseña nueva.</p>
              <p className="zl-faint text-xs mb-6">Si no lo ves, revisa la carpeta de spam. El enlace caduca en poco tiempo.</p>
              <button type="button" className="zl-btn zl-secondary" onClick={backToCredentials}>
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </button>
            </div>
          )}

          {/* ===== Paso: verificación en dos pasos ===== */}
          {step === 'otp' && (
            <div className={shake ? 'zl-shake' : ''}>
              <div className="mb-5 grid place-items-center w-12 h-12 rounded-xl" style={{ background: 'rgba(225,6,0,.12)', color: '#EF4444' }}>
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

              <button
                type="button"
                className="zl-btn bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 mb-3"
                disabled={loading || otp.some((d) => !d)}
                onClick={() => submitOtp(otp)}
              >
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
              <p className="zl-muted text-sm mb-6">Entrando a tu panel…</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--field-alt)' }}>
                <div className="h-full rounded-full bg-red-600 zl-progress" />
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