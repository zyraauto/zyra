import Link from 'next/link';
import {
  ArrowRight, ClipboardList, Receipt, Users, Package, Megaphone, Store, Menu,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import ProductTabs from '@/components/ProductTabs';
// La CSP con nonce (middleware.ts) exige render dinámico: Next debe poder poner el nonce en sus scripts.
export const dynamic = 'force-dynamic';

// Landing pública (Server Component: sin 'use client', sin acceso a datos privados).
// Modo claro/oscuro automático con variables CSS (no depende de la config de Tailwind).

const DARK = '--bg:#0F0F15;--surface:#1B1C25;--text:#F3F3F5;--muted:#A3A6B3;--line:#34363F;--soft:#2A1618;';

// Tema: sin atributo data-theme manda el dispositivo; con data-theme='light'|'dark' manda el botón.
const STYLES = `
.zy{--bg:#F3F3F5;--surface:#fff;--text:#15151E;--muted:#5F626E;--line:#DFE0E6;--soft:#FBE9E8;
  background:var(--bg);color:var(--text);font-family:var(--font-inter,Inter),system-ui,sans-serif;transition:background-color .3s,color .3s}
@media (prefers-color-scheme:dark){:root:not([data-theme='light']) .zy{${DARK}}}
:root[data-theme='dark'] .zy{${DARK}}
.zy-head{font-family:var(--font-montserrat,Montserrat),system-ui,sans-serif}
.zy-surface{background:var(--surface);border:1px solid var(--line)}
.zy-muted{color:var(--muted)}
.zy-line{border-color:var(--line)}
.zy a:focus-visible,.zy button:focus-visible,.zy summary:focus-visible{outline:2px solid #E10600;outline-offset:3px;border-radius:6px}
.zy summary::-webkit-details-marker{display:none}
`;

const FEATURES = [
  { icon: ClipboardList, title: 'Órdenes de servicio', text: 'Diagnóstico, refacciones, mano de obra, fotos y técnico responsable en una sola orden, con estatus en tiempo real.' },
  { icon: Receipt, title: 'Cotizaciones, ventas y facturación', text: 'Cotiza, el cliente acepta y la orden se genera sola. Preparado para conectar facturación electrónica con un proveedor autorizado.' },
  { icon: Users, title: 'Clientes y vehículos', text: 'Historial completo por vehículo: qué servicios se hicieron, a qué kilometraje y cuándo toca el siguiente.' },
  { icon: Package, title: 'Inventario y proveedores', text: 'Existencias, stock mínimo y precios de compra y venta, ligados a cada orden y a cada venta.' },
  { icon: Megaphone, title: 'Recordatorios y marketing', text: 'Encuentra clientes sin visita en seis meses y contáctalos por WhatsApp o correo.' },
  { icon: Store, title: 'Tu taller, tus reglas', text: 'Administra servicios, precios, fotos, horarios y usuarios con roles, sin depender de nadie. Cada taller ve solo su información.' },
];

const FLOW = ['Cita', 'Cotización', 'Orden de servicio', 'Venta y factura', 'Historial del vehículo', 'Próximo servicio'];

const ORDERS = [
  { id: '0012', car: 'Nissan Sentra', service: 'Cambio de aceite', status: 'En proceso', color: '#8B5CF6' },
  { id: '0011', car: 'Toyota Corolla', service: 'Afinación', status: 'Pendiente', color: '#F59E0B' },
  { id: '0010', car: 'Ford Fiesta', service: 'Diagnóstico', status: 'Completada', color: '#22C55E' },
];

const ROLES = [
  { name: 'Administrador del taller', text: 'Configura el taller, crea usuarios, administra servicios, clientes y vehículos, y consulta ventas y reportes.' },
  { name: 'Recepción', text: 'Registra clientes y vehículos, crea citas, cotizaciones y órdenes, y consulta el historial.' },
  { name: 'Mecánico o técnico', text: 'Ve las órdenes que le asignaron, registra diagnóstico y trabajos, sube fotos y actualiza el estado.' },
  { name: 'Cliente', text: 'Portal para consultar sus vehículos, historial, cotizaciones y facturas, y pedir citas.', soon: true },
];

function ZyraMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" aria-hidden="true">
      <polygon points="16,0 48,0 41,9 9,9" fill="#E10600" />
      <polygon points="9,12 37,12 31,20 3,20" fill="#E10600" />
      <polygon points="3,23 25,23 20,32 0,32" fill="#A80703" />
    </svg>
  );
}

// Vista previa del panel hecha en HTML/CSS (sin imágenes). Cámbiala por una captura real cuando exista el dashboard.
function DashboardPreview() {
  return (
    <div className="zy-surface rounded-2xl shadow-2xl overflow-hidden" aria-label="Vista previa del panel de Zyra" role="img">
      <div className="flex">
        <div className="hidden sm:flex w-36 flex-col gap-1 p-3 border-r zy-line text-xs">
          <div className="flex items-center gap-2 mb-3"><ZyraMark className="w-6 h-4" /><b className="zy-head">Zyra</b></div>
          <div className="rounded-md bg-[#E10600] text-white px-2.5 py-1.5 font-medium">Inicio</div>
          {['Órdenes', 'Clientes', 'Vehículos', 'Inventario', 'Facturación'].map((i) => (
            <div key={i} className="px-2.5 py-1.5 zy-muted">{i}</div>
          ))}
        </div>
        <div className="flex-1 p-4 sm:p-5 min-w-0">
          <p className="zy-head font-bold text-sm">Panel principal</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
            {[['12', 'Órdenes activas'], ['8', 'Completadas hoy'], ['4', 'Esperando refacciones'], ['$24,860', 'Ingresos del día']].map(([n, l]) => (
              <div key={l} className="rounded-lg p-2.5 border zy-line">
                <p className="zy-head font-bold text-base">{n}</p>
                <p className="text-[0.65rem] zy-muted">{l}</p>
              </div>
            ))}
          </div>
          <ul className="divide-y zy-line border zy-line rounded-lg">
            {ORDERS.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                <span className="min-w-0 truncate"><b>{o.service}</b> <span className="zy-muted">#{o.id} · {o.car}</span></span>
                <span className="rounded-full px-2 py-0.5 font-semibold whitespace-nowrap" style={{ background: `${o.color}26`, color: o.color }}>{o.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="zy min-h-screen selection:bg-[#E10600] selection:text-white">
      <style>{STYLES}</style>

      <header className="sticky top-0 z-20 border-b zy-line backdrop-blur" style={{ background: 'color-mix(in srgb, var(--surface) 85%, transparent)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/es/public" className="flex items-center gap-2.5" aria-label="Zyra, inicio">
            <ZyraMark className="w-9 h-6" />
            <span className="zy-head font-bold text-xl tracking-tight">Zyra</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium" aria-label="Principal">
            <a href="#caracteristicas" className="hover:text-[#E10600] transition-colors">Características</a>
            <a href="#producto" className="hover:text-[#E10600] transition-colors">Así se ve</a>
            <a href="#roles" className="hover:text-[#E10600] transition-colors">Roles</a>
            <a href="#precios" className="hover:text-[#E10600] transition-colors">Precios</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/es/login" className="hidden sm:inline text-sm font-medium hover:text-[#E10600] transition-colors">Iniciar sesión</Link>
            <Link href="/es/onboarding" className="bg-[#E10600] hover:bg-[#A80703] text-white px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap">
              Registrar taller
            </Link>
            <details className="md:hidden relative">
              <summary aria-label="Abrir menú" className="list-none cursor-pointer p-2 -mr-2"><Menu className="w-5 h-5" aria-hidden /></summary>
              <div className="absolute right-0 mt-3 w-52 zy-surface rounded-xl p-2 shadow-xl text-sm font-medium flex flex-col">
                {[['#caracteristicas', 'Características'], ['#producto', 'Así se ve'], ['#roles', 'Roles'], ['#precios', 'Precios'], ['/es/login', 'Iniciar sesión']].map(([href, label]) => (
                  <a key={href} href={href} className="px-3 py-2.5 rounded-lg hover:text-[#E10600]">{label}</a>
                ))}
              </div>
            </details>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Franjas diagonales del logo: el único adorno de la página */}
          <div aria-hidden className="absolute -right-24 top-0 h-full w-[38%] bg-[#E10600] opacity-[0.08]" style={{ clipPath: 'polygon(30% 0,100% 0,100% 100%,0 100%)' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-12 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            <div>
              <h1 className="zy-head font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
                La gestión de tu taller,{' '}
                <span className="text-[#E10600]">en una sola plataforma.</span>
              </h1>
              <p className="zy-muted text-lg mt-6 max-w-xl leading-relaxed">
                Organiza tus órdenes de servicio, controla tu inventario, agenda citas y haz crecer tu negocio, sin complicaciones.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/es/onboarding" className="inline-flex items-center gap-2 bg-[#E10600] hover:bg-[#A80703] text-white px-7 py-3.5 rounded-full font-semibold transition-colors shadow-lg shadow-red-600/25">
                  Registrar mi taller <ArrowRight className="w-5 h-5" aria-hidden />
                </Link>
                <Link href="/es/login" className="font-semibold hover:text-[#E10600] transition-colors">Ya tengo cuenta</Link>
              </div>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* Características */}
        <section id="caracteristicas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
          <h2 className="zy-head font-bold text-3xl tracking-tight max-w-xl">Todo lo que pasa en tu taller, en un solo lugar</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-9">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="shrink-0 w-11 h-11 rounded-xl grid place-items-center text-[#E10600]" style={{ background: 'var(--soft)' }}>
                  <Icon className="w-5 h-5" aria-hidden />
                </span>
                <div>
                  <h3 className="zy-head font-bold">{title}</h3>
                  <p className="zy-muted text-sm leading-relaxed mt-1">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pantallas reales del sistema (datos ficticios) */}
        <section id="producto" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 scroll-mt-20">
          <h2 className="zy-head font-bold text-3xl tracking-tight max-w-xl">Así se ve tu día en el taller</h2>
          <p className="zy-muted mt-3 max-w-xl">Ejemplos con datos ficticios de las pantallas que vas a usar todos los días.</p>
          <div className="mt-8"><ProductTabs /></div>
        </section>

        {/* Roles */}
        <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 scroll-mt-20">
          <h2 className="zy-head font-bold text-3xl tracking-tight max-w-xl">Cada persona ve solo lo que necesita</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r) => (
              <div key={r.name} className="zy-surface rounded-xl p-5 border-l-4" style={{ borderLeftColor: '#E10600' }}>
                <h3 className="zy-head font-bold">{r.name}</h3>
                {r.soon && <span className="inline-block mt-1 text-xs font-semibold text-[#E10600]">Próximamente</span>}
                <p className="zy-muted text-sm leading-relaxed mt-2">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Flujo: es una secuencia real, por eso va numerado */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="zy-head font-bold text-3xl tracking-tight max-w-xl">Del primer cliente a la próxima visita</h2>
          <ol className="mt-10 grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FLOW.map((step, i) => (
              <li key={step} className="zy-surface rounded-xl p-4">
                <span className="zy-head font-extrabold text-[#E10600] text-lg">{i + 1}</span>
                <p className="font-semibold text-sm mt-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Precios: pendiente definir planes */}
        <section id="precios" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 scroll-mt-20">
          <div className="rounded-3xl bg-[#15151E] text-white p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div aria-hidden className="absolute right-0 top-0 h-full w-1/3 bg-[#E10600]" style={{ clipPath: 'polygon(35% 0,100% 0,100% 100%,0 100%)' }} />
            <div className="relative max-w-lg">
              <h2 className="zy-head font-bold text-2xl sm:text-3xl">Más control. Más eficiencia. Más kilómetros.</h2>
              <p className="text-white/70 mt-3">Crea tu taller en minutos y empieza a registrar órdenes hoy. Los planes y precios se publicarán pronto.</p>
            </div>
            <Link href="/es/onboarding" className="relative self-start md:self-auto bg-white text-[#15151E] hover:bg-[#F3F3F5] px-7 py-3.5 rounded-full font-semibold whitespace-nowrap">
              Comenzar ahora
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t zy-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm zy-muted">
          <span className="flex items-center gap-2"><ZyraMark className="w-6 h-4" /> Zyra AutoSaaS</span>
          <p>© 2026 Zyra. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}