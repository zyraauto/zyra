'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

// Misma clave que usa el login, así la elección se comparte entre pantallas.
const KEY = 'zyra-theme';
type Theme = 'light' | 'dark' | 'system';

const OPTIONS = [
  ['light', Sun, 'Claro'],
  ['dark', Moon, 'Oscuro'],
  ['system', Monitor, 'Sistema'],
] as const;

// 'system' = sin atributo: manda la preferencia del dispositivo (prefers-color-scheme).
function apply(t: Theme) {
  const root = document.documentElement;
  if (t === 'system') root.removeAttribute('data-theme');
  else root.dataset.theme = t;
}

// Aplica el tema guardado sin mostrar botones. Úsalo en pantallas que no llevan ThemeToggle (o mientras cargan).
export function ThemeSync() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') apply(saved);
    } catch {
      /* localStorage no disponible */
    }
  }, []);
  return null;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setTheme(saved);
        apply(saved);
      }
    } catch {
      /* localStorage no disponible */
    }
  }, []);

  const choose = (t: Theme) => {
    setTheme(t);
    apply(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignorar */
    }
  };

  return (
    <div role="radiogroup" aria-label="Tema de la página" className="inline-flex gap-0.5 p-[3px] rounded-[10px]" style={{ border: '1px solid var(--line)' }}>
      {OPTIONS.map(([value, Icon, label]) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => choose(value)}
          className="grid place-items-center w-8 h-8 rounded-[7px] transition-colors"
          style={theme === value ? { background: '#E10600', color: '#fff' } : { color: 'var(--muted)' }}
        >
          <Icon className="w-4 h-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}