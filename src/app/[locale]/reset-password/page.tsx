'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import { AUTH_STYLES } from '@/components/auth/auth-styles';

// Debe coincidir con Supabase: Authentication → Providers → Email → Minimum password length
const MIN_LENGTH = 8;

type View = 'checking' | 'invalid' | 'form' | 'done';

const mk = (paths: React.ReactNode, strokeWidth = 2) =>
  function Icon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paths}
      </svg>
    );
  };

const Lock = mk(<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>);
const Eye = mk(<><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></>);
const EyeOff = mk(<><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61C3.9 8.31 1 11 1 12s4 8 11 8a9.16 9.16 0 0 0 5.06-1.5" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></>);
const Loader2 = mk(<path d="M21 12a9 9 0 1 1-9-9" />);
const Check = mk(<path d="m5 12 5 5 9-10" />, 3);
const ArrowLeft = mk(<path d="M19 12H5M12 19l-7-7 7-7" />);
const AlertTriangle = mk(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>);

function ZyraMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" aria-hidden="true">
      <polygon points="16,0 48,0 41,9 9,9" fill="#E10600" />
      <polygon points="9,12 37,12 31,20 3,20" fill="#E10600" />
      <polygon points="3,23 25,23 20,32 0,32" fill="#A80703" />
    </svg>
  );
}

function updateMessage(err: unknown): string {
  if (isAuthError(err)) {
    switch (err.code) {
      case 'same_password':
        return 'La nueva contraseña debe ser distinta a la anterior.';
      case 'weak_password':
        return 'La contraseña es demasiado débil. Usa una más larga y variada.';
      case 'insufficient_aal':
        return 'Tu cuenta tiene verificación en dos pasos. Inicia sesión y cambia la contraseña desde tu perfil.';
      case 'session_not_found':
      case 'session_expired':
        return 'El enlace venció. Solicita uno nuevo desde el inicio de sesión.';
      case 'over_request_rate_limit':
        return 'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.';
      default:
        return err.message || 'No pudimos actualizar tu contraseña. Intenta de nuevo.';
    }
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || 'es';

  const [view, setView] = useState<View>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // La sesión de recuperación la crea /auth/callback; sin ella el enlace no sirve.
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error: userError }) => {
      if (active) setView(!userError && data.user ? 'form' : 'invalid');
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  const fail = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (password.length < MIN_LENGTH) return fail(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres.`);
    if (password !== confirm) return fail('Las contraseñas no coinciden.');

    setLoading(true);
    try {
      const { error: updError } = await supabase.auth.updateUser({ password });
      if (updError) return fail(updateMessage(updError));

      setView('done');
      // Si el usuario no tiene taller, el proxy lo manda a onboarding.
      setTimeout(() => {
        router.replace(`/${locale}/workshop/dashboard`);
        router.refresh();
      }, 1500);
    } catch (err) {
      fail(updateMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggle = (
    <button
      type="button"
      onClick={() => setShow((v) => !v)}
      className="zl-faint hover:opacity-80 transition-opacity"
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="zl-root min-h-screen flex items-center justify-center p-4">
      <style>{AUTH_STYLES}</style>

      <div className="zl-card w-full max-w-md rounded-2xl p-7 sm:p-10">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2">
            <ZyraMark className="w-8 h-5" />
            <span className="zl-head font-bold text-lg">Zyra</span>
          </div>
          <ThemeToggle />
        </div>

        {view === 'checking' && (
          <div className="flex justify-center py-10" aria-live="polite">
            <Loader2 className="w-6 h-6 animate-spin zl-faint" />
          </div>
        )}

        {view === 'invalid' && (
          <div className="text-center">
            <div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-2xl zl-pop" style={{ background: 'rgba(225,6,0,.12)', color: '#EF4444' }}>
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="zl-head font-bold text-[1.5rem] mb-2">Enlace inválido o vencido</h1>
            <p className="zl-muted text-sm mb-6">
              Los enlaces de recuperación caducan y solo se pueden usar una vez. Solicita uno nuevo.
            </p>
            <a href={`/${locale}/login`} className="zl-btn zl-secondary">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
            </a>
          </div>
        )}

        {view === 'form' && (
          <>
            <h1 className="zl-head font-bold text-[1.6rem] mb-1.5">Crea una contraseña nueva</h1>
            <p className="zl-muted text-sm mb-7">Elige una contraseña de al menos {MIN_LENGTH} caracteres.</p>

            <form onSubmit={handleSubmit} noValidate className={shake ? 'zl-shake' : ''}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="zl-label">Contraseña nueva</label>
                  <div className="zl-field">
                    <Lock className="w-4 h-4 zl-faint shrink-0" />
                    <input
                      id="new-password"
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    {toggle}
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="zl-label">Confirma la contraseña</label>
                  <div className="zl-field" data-invalid={confirm !== '' && confirm !== password}>
                    <Lock className="w-4 h-4 zl-faint shrink-0" />
                    <input
                      id="confirm-password"
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
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
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando…
                    </>
                  ) : (
                    'Guardar contraseña'
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {view === 'done' && (
          <div className="text-center" aria-live="polite">
            <div className="mx-auto mb-5 grid place-items-center w-16 h-16 rounded-full bg-green-500 text-white zl-pop">
              <Check className="w-8 h-8" />
            </div>
            <h1 className="zl-head font-bold text-[1.6rem] mb-2">Contraseña actualizada</h1>
            <p className="zl-muted text-sm">Entrando a tu panel…</p>
          </div>
        )}
      </div>
    </div>
  );
}