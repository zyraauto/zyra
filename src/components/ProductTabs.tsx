'use client';

import { useRef, useState } from 'react';

// Datos ficticios tomados de los ejemplos del documento del proyecto.
const TABS = [
  { id: 'panel', label: 'Panel del día' },
  { id: 'cotizacion', label: 'Cotización' },
  { id: 'historial', label: 'Historial del vehículo' },
] as const;

const METRICS = [
  ['Citas de hoy', '8'], ['Vehículos en servicio', '5'], ['Cotizaciones pendientes', '3'],
  ['Ventas del día', '$8,450'], ['Clientes nuevos', '4'], ['Servicios próximos', '12'],
];
const QUOTE: [string, number][] = [['Cambio de aceite', 850], ['Filtro de aceite', 250], ['Mano de obra', 300]];
const HISTORY = [
  ['15/01/2026', 'Cambio de aceite', '20,000 km'],
  ['15/06/2026', 'Cambio de balatas', '25,000 km'],
  ['10/09/2026', 'Servicio mayor', '30,000 km'],
];
const money = (n: number) => `$${n.toLocaleString('en-US')}`;

export default function ProductTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('panel');
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  // Flechas izquierda/derecha para moverse entre pestañas (teclado y lectores de pantalla)
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    setActive(TABS[n].id);
    refs.current[n]?.focus();
  };

  return (
    <div className="zy-surface rounded-2xl overflow-hidden">
      <div role="tablist" aria-label="Pantallas del sistema" className="flex gap-1 p-2 border-b zy-line overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
            style={active === t.id ? { background: '#E10600', color: '#fff' } : { color: 'var(--muted)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="p-5 sm:p-8 min-h-[300px]">
        {active === 'panel' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {METRICS.map(([label, value]) => (
              <div key={label} className="rounded-xl border zy-line p-4 sm:p-5">
                <p className="zy-head font-extrabold text-2xl sm:text-3xl">{value}</p>
                <p className="zy-muted text-xs sm:text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {active === 'cotizacion' && (
          <div className="max-w-md">
            <p className="zy-head font-bold text-lg mb-4">Cotización #00025</p>
            <ul className="divide-y zy-line border-y zy-line">
              {QUOTE.map(([concept, price]) => (
                <li key={concept} className="flex justify-between py-3 text-sm"><span>{concept}</span><span>{money(price)}</span></li>
              ))}
            </ul>
            <p className="flex justify-between pt-4 font-bold"><span>Total</span><span>{money(QUOTE.reduce((s, [, p]) => s + p, 0))}</span></p>
            <p className="zy-muted text-xs mt-4">El cliente recibe el detalle y, al aceptarlo, se genera la orden de servicio.</p>
          </div>
        )}

        {active === 'historial' && (
          <div>
            <p className="zy-head font-bold text-lg mb-5">Toyota Corolla 2022</p>
            <ol className="border-l-2 border-[#E10600] ml-1.5 space-y-6">
              {HISTORY.map(([date, service, km]) => (
                <li key={date} className="pl-5 relative">
                  <span aria-hidden className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#E10600]" />
                  <p className="zy-muted text-xs">{date}</p>
                  <p className="font-semibold">{service}</p>
                  <p className="zy-muted text-sm">{km}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}