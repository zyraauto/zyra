'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// Misma clave que usa el login, así la elección se comparte entre pantallas.
const KEY = 'zyra-theme';
type Theme = 'light' | 'dark';

// Tema guardado. Un valor antiguo 'system' (o ninguno) significa: manda el dispositivo.
function readSaved(): Theme | null {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null; // localStorage no disponible
  }
}

function apply(t: Theme | null) {
  const root = document.documentElement;
  if (t) root.dataset.theme = t;
  else root.removeAttribute('data-theme');
}

// Tema que se está viendo realmente (atributo o, si no hay, preferencia del dispositivo).
function effective(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === 'light' || attr === 'dark') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Aplica el tema guardado sin mostrar botones. Ponlo UNA vez en el layout raíz (app/layout.tsx)
// para que cualquier página por la que se navegue use el mismo tema.
export function ThemeSync() {
  useEffect(() => {
    apply(readSaved());

    // Si cambia en otra pestaña, se actualiza aquí también.
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) apply(readSaved());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return null;
}

export default function ThemeToggle() {
  // null hasta montar: evita desajuste de hidratación (el servidor no sabe el tema).
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    apply(readSaved());
    setTheme(effective());

    // Si no hay elección guardada y el dispositivo cambia de tema, el icono lo sigue.
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setTheme(effective());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        apply(readSaved());
        sync();
      }
    };
    mq.addEventListener('change', sync);
    window.addEventListener('storage', onStorage);
    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = () => {
    const next: Theme = effective() === 'dark' ? 'light' : 'dark';
    apply(next);
    setTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignorar */
    }
  };

  const isDark = theme === 'dark';
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] transition-colors hover:text-[#E10600]"
      // --line solo existe dentro del login (.zl-root). En el onboarding no está definida,
      // así que se usa un borde derivado del color del texto, que siempre se ve en ambos temas.
      style={{ border: '1px solid var(--line, color-mix(in srgb, currentColor 25%, transparent))' }}
    >
      {/* Modo oscuro → sol; modo claro → luna */}
      {theme !== null && (isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />)}
    </button>
  );
}