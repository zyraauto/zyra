'use client';

import React, { useState } from 'react';

/**
 * Zyra AutoSaaS — Login
 *
 * Fuentes usadas: Space Grotesk (encabezados/wordmark) + Inter (cuerpo/formulario).
 * Si tu proyecto usa Next.js, reemplaza el <style> de @import por next/font
 * para mejor rendimiento. Se dejan aquí para que el archivo funcione standalone.
 *
 * Sin dependencias externas de iconos: todos los íconos son SVG inline,
 * para no requerir instalar lucide-react ni ningún otro paquete.
 */

const WORKSHOPS_ONLINE = 128;

type IconProps = { className?: string; strokeWidth?: number };

const Mail = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </svg>
);

const Lock = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Eye = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61C3.9 8.31 1 11 1 12s4 8 11 8a9.16 9.16 0 0 0 5.06-1.5" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

const Wrench = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2 19v3h3l7.3-7.3a4 4 0 0 0 5.4-5.4l-3 3-2-2Z" />
  </svg>
);

const ShieldCheck = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const AlertTriangle = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const Loader2 = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-9-9" />
  </svg>
);

export default function ZyraLogin() {
  const [email, setEmail] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailIsValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Ingresa tu correo y contraseña para continuar.');
      return;
    }
    if (!emailIsValid) {
      setError('Revisa el formato de tu correo electrónico.');
      return;
    }

    setLoading(true);
    // Simulación de verificación — reemplaza por tu llamada real de auth.
    setTimeout(() => {
      setLoading(false);
    }, 1600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF0F2] p-4 font-[Inter]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(16,21,27,0.35)] flex overflow-hidden">

        {/* ---------- Panel izquierdo: identidad ---------- */}
        <div className="hidden md:block relative w-[46%] shrink-0">
          {/* sliver de acento naranja detrás, visible en el borde diagonal */}
          <div
            className="absolute inset-y-0 left-0 w-[calc(100%+10px)] bg-[#FF6A39]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 87% 100%, 0 100%)' }}
          />
          {/* panel oscuro principal, ligeramente más angosto: deja ver el acento */}
          <div
            className="absolute inset-y-0 left-0 w-full bg-[#10151B] text-[#F7F5F0] p-10 flex flex-col"
            style={{ clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)' }}
          >
            {/* textura de fondo tipo plano técnico */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(#F7F5F0 1px, transparent 1px), linear-gradient(90deg, #F7F5F0 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-10">
                <div className="w-8 h-8 rounded-md bg-[#FF6A39] flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-[#10151B]" strokeWidth={2.5} />
                </div>
                <span className="font-[Space_Grotesk] font-semibold text-lg tracking-tight">Zyra AutoSaaS</span>
              </div>

              <div className="flex-1 flex flex-col justify-center max-w-[300px]">
                <h1 className="font-[Space_Grotesk] font-semibold text-[2rem] leading-[1.15] mb-4">
                  Tu taller,<br />bajo control total.
                </h1>
                <p className="text-[#8791A0] text-[0.95rem] leading-relaxed">
                  Órdenes de servicio, cotizaciones e inventario en un solo panel — sin importar cuántas sucursales operes.
                </p>
              </div>

              <div className="mt-auto pt-8">
                <div className="flex items-center gap-2 text-[0.8rem] text-[#8791A0] mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="motion-safe:animate-ping motion-reduce:hidden absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34D399]" />
                  </span>
                  Plataforma operando con normalidad
                </div>
                <p className="text-[0.8rem] text-[#5C6672]">
                  <span className="text-[#F7F5F0] font-medium">{WORKSHOPS_ONLINE} talleres</span> registrando servicios ahora mismo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Panel derecho: formulario ---------- */}
        <div className="w-full md:w-[54%] p-8 sm:p-12 flex flex-col justify-center">
          <h2 className="font-[Space_Grotesk] font-semibold text-[1.7rem] text-[#10151B] mb-1.5">Inicia sesión</h2>
          <p className="text-[#5C6672] text-sm mb-8">Ingresa a tu panel de control operativo.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">

              {/* Taller / workspace — específico de multi-tenant */}
              <div>
                <label htmlFor="workspace" className="block text-sm font-medium text-[#10151B] mb-1.5">
                  Tu taller
                </label>
                <div className="flex rounded-lg border border-[#D8DCE1] overflow-hidden focus-within:ring-2 focus-within:ring-[#FF6A39]/40 focus-within:border-[#FF6A39] transition-all">
                  <input
                    id="workspace"
                    type="text"
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="taller-hermanos-lopez"
                    className="w-full px-3 py-3 text-sm outline-none placeholder:text-[#A8B0BA]"
                    disabled={loading}
                  />
                  <span className="flex items-center px-3 text-sm text-[#8791A0] bg-[#F7F8F9] border-l border-[#D8DCE1] whitespace-nowrap">
                    .zyra.app
                  </span>
                </div>
              </div>

              {/* Correo */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#10151B] mb-1.5">
                  Correo electrónico
                </label>
                <div className={`flex items-center rounded-lg border px-3 focus-within:ring-2 focus-within:ring-[#FF6A39]/40 transition-all ${
                  emailIsValid ? 'border-[#D8DCE1] focus-within:border-[#FF6A39]' : 'border-red-400 focus-within:border-red-400'
                }`}>
                  <Mail className="w-4 h-4 text-[#A8B0BA] shrink-0" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="taller@ejemplo.com"
                    className="w-full px-2.5 py-3 text-sm outline-none placeholder:text-[#A8B0BA] bg-transparent"
                    disabled={loading}
                  />
                </div>
                {!emailIsValid && (
                  <p className="text-xs text-red-500 mt-1.5">Ese correo no parece válido.</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#10151B] mb-1.5">
                  Contraseña
                </label>
                <div className="flex items-center rounded-lg border border-[#D8DCE1] px-3 focus-within:ring-2 focus-within:ring-[#FF6A39]/40 focus-within:border-[#FF6A39] transition-all">
                  <Lock className="w-4 h-4 text-[#A8B0BA] shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handleKeyEvent}
                    onKeyDown={handleKeyEvent}
                    placeholder="••••••••"
                    className="w-full px-2.5 py-3 text-sm outline-none placeholder:text-[#A8B0BA] bg-transparent"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-[#8791A0] hover:text-[#10151B] transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {capsLockOn && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600 mt-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Bloq Mayús está activado.
                  </p>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center text-sm pt-1">
                <label className="flex items-center gap-2 text-[#5C6672] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-[#D8DCE1] text-[#FF6A39] focus:ring-[#FF6A39]/40 w-4 h-4"
                  />
                  Recordarme
                </label>
                <a href="#" className="text-[#10151B] font-medium hover:text-[#FF6A39] transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#10151B] text-white rounded-lg font-medium hover:bg-[#1A222B] transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando credenciales…
                  </>
                ) : (
                  'Ingresar al sistema'
                )}
              </button>

              <div className="relative flex items-center py-3">
                <div className="flex-grow border-t border-[#E4E7EB]" />
                <span className="flex-shrink-0 mx-4 text-[#A8B0BA] text-xs">o continúa con</span>
                <div className="flex-grow border-t border-[#E4E7EB]" />
              </div>

              <button
                type="button"
                className="w-full py-3.5 bg-white border border-[#D8DCE1] text-[#10151B] rounded-lg font-medium hover:bg-[#F7F8F9] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Ingresar con Google
              </button>

              <p className="text-center text-sm text-[#5C6672] pt-2">
                ¿Nuevo en Zyra?{' '}
                <a href="#" className="text-[#10151B] font-medium hover:text-[#FF6A39] transition-colors">
                  Solicita una demo
                </a>
              </p>

              <div className="flex items-center justify-center gap-1.5 text-xs text-[#A8B0BA] pt-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Conexión cifrada · datos aislados por taller
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}