import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  CarIcon,
  CheckCircleIcon,
  ClipboardTextIcon,
  CurrencyDollarIcon,
  PlusIcon,
  ReceiptIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Enums } from "@/types/database";

export const metadata: Metadata = { title: "Panel del taller" };

// ---------------------------------------------------------------------------
// Tipos y constantes (derivados de @/types/database)
// ---------------------------------------------------------------------------
type WorkOrderStatus = Enums<"work_order_status">;
type InvoiceStatus = Enums<"invoice_status">;

// "Orden abierta" = el vehículo está (o está por estar) en el taller.
// `satisfies` marca un error de compilación si algún valor deja de existir en el enum.
const ACTIVE_ORDER_STATUSES = [
  "received",
  "diagnosing",
  "waiting_approval",
  "approved",
  "in_progress",
  "waiting_parts",
] as const satisfies readonly WorkOrderStatus[];

// Facturas que cuentan como facturadas (excluye borradores y canceladas).
const BILLED_INVOICE_STATUSES = ["sent", "paid", "partial", "overdue"] as const satisfies readonly InvoiceStatus[];
// Facturas con saldo pendiente de cobro.
const RECEIVABLE_INVOICE_STATUSES = ["sent", "partial", "overdue"] as const satisfies readonly InvoiceStatus[];

// Record<WorkOrderStatus, ...> es exhaustivo: si agregas un estado al enum, TypeScript te lo exige aquí.
const STATUS_BADGE: Record<
  WorkOrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Borrador", variant: "outline" },
  received: { label: "Recibida", variant: "secondary" },
  diagnosing: { label: "En diagnóstico", variant: "secondary" },
  waiting_approval: { label: "Esperando aprobación", variant: "secondary" },
  approved: { label: "Aprobada", variant: "default" },
  in_progress: { label: "En proceso", variant: "default" },
  waiting_parts: { label: "Esperando refacciones", variant: "secondary" },
  completed: { label: "Terminada", variant: "outline" },
  delivered: { label: "Entregada", variant: "outline" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

// Rutas internas del ERP (ajústalas a tu estructura).
const ROUTES = {
  orders: "/workshop/orders",
  newOrder: "/workshop/orders/new",
  customers: "/workshop/customers",
  invoices: "/workshop/invoices",
} as const;

const TIME_ZONE = "America/Mexico_City";
const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});
const longDate = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

// Primer día del mes ("YYYY-MM-01") en la zona horaria del taller, no la del servidor (UTC).
function monthStartInTimeZone(): string {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date()); // YYYY-MM-DD
  return `${today.slice(0, 8)}01`;
}

// ---------------------------------------------------------------------------
// Página (Server Component)
// ---------------------------------------------------------------------------
export default async function WorkshopDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();

  // getUser() valida el token con Supabase Auth (no confía solo en la cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Contexto del tenant: el claim viaja en el JWT (app_metadata solo lo escribe el servidor).
  // En este esquema el tenant ES el taller: tenant_id === workshops.id, y todas las tablas lo guardan en `workshop_id`.
  const rawTenantId: unknown = user.app_metadata?.tenant_id;
  const workshopId = typeof rawTenantId === "string" && rawTenantId.length > 0 ? rawTenantId : null;
  // El proxy ya lo valida; esto es defensa en profundidad.
  if (!workshopId) redirect(`/${locale}/onboarding`);

  const monthStart = monthStartInTimeZone();

  // Todas las consultas filtran por workshop_id de forma explícita (además de RLS en Postgres).
  const [workshopRes, activeRes, customersRes, billedRes, receivableRes, recentRes] = await Promise.all([
    supabase.from("workshops").select("name").eq("id", workshopId).maybeSingle(),

    // Órdenes abiertas (+ vehículos distintos en taller)
    supabase
      .from("work_orders")
      .select("id, vehicle_id", { count: "exact" })
      .eq("workshop_id", workshopId)
      .in("status", [...ACTIVE_ORDER_STATUSES]),

    // Clientes activos
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("workshop_id", workshopId)
      .eq("is_active", true),

    // Facturación del mes
    supabase
      .from("invoices")
      .select("total")
      .eq("workshop_id", workshopId)
      .in("status", [...BILLED_INVOICE_STATUSES])
      .gte("issue_date", monthStart),

    // Por cobrar (saldo pendiente)
    supabase
      .from("invoices")
      .select("balance, total, paid_amount")
      .eq("workshop_id", workshopId)
      .in("status", [...RECEIVABLE_INVOICE_STATUSES]),

    // Últimas órdenes de servicio
    supabase
      .from("work_orders")
      .select(
        "id, folio, status, total, created_at, customers(first_name, last_name), customer_vehicles(plate, brand_name, model_name, year)"
      )
      .eq("workshop_id", workshopId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const failed = [workshopRes, activeRes, customersRes, billedRes, receivableRes, recentRes].filter((r) => r.error);
  failed.forEach((r) => console.error("[workshop/dashboard] consulta fallida:", r.error?.message));

  const workshopName = workshopRes.data?.name ?? "Panel del taller";

  const openOrders = activeRes.error ? null : (activeRes.count ?? activeRes.data.length);
  const vehiclesInShop = activeRes.error ? null : new Set(activeRes.data.map((o) => o.vehicle_id)).size;
  const customersCount = customersRes.error ? null : (customersRes.count ?? 0);
  const billedMonth = billedRes.error ? null : billedRes.data.reduce((sum, i) => sum + Number(i.total), 0);
  const receivable = receivableRes.error
    ? null
    : receivableRes.data.reduce((sum, i) => sum + Number(i.balance ?? i.total - i.paid_amount), 0);
  const recentOrders = recentRes.error ? [] : recentRes.data;

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{workshopName}</h1>
        <p className="mt-1 text-sm text-muted-foreground first-letter:uppercase">{longDate.format(new Date())}</p>
      </div>

      {failed.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          No pudimos cargar algunas métricas. Recarga la página; si el problema continúa, contacta a soporte.
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Órdenes abiertas"
          value={openOrders === null ? "—" : String(openOrders)}
          hint="Desde recibidas hasta esperando refacciones"
          icon={<ClipboardTextIcon className="size-5 text-primary" />}
        />
        <MetricCard
          label="Vehículos en taller"
          value={vehiclesInShop === null ? "—" : String(vehiclesInShop)}
          hint="Con al menos una orden abierta"
          icon={<CarIcon className="size-5 text-orange-500" />}
        />
        <MetricCard
          label="Clientes activos"
          value={customersCount === null ? "—" : customersCount.toLocaleString("es-MX")}
          hint="Registrados en tu taller"
          icon={<UsersIcon className="size-5 text-sky-500" />}
        />
        <MetricCard
          label="Facturación del mes"
          value={billedMonth === null ? "—" : money.format(billedMonth)}
          hint={receivable === null ? "Por cobrar: —" : `Por cobrar: ${money.format(receivable)}`}
          icon={<CurrencyDollarIcon className="size-5 text-green-600" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Últimas órdenes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Últimas órdenes de servicio</CardTitle>
            <Link href={`/${locale}${ROUTES.orders}`} className="text-xs text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <CheckCircleIcon className="mx-auto mb-2 size-8 opacity-30" />
                <p className="text-sm">Aún no hay órdenes de servicio.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentOrders.map((order) => {
                  const customer = order.customers;
                  const vehicle = order.customer_vehicles;
                  const customerName = customer ? `${customer.first_name} ${customer.last_name}`.trim() : "";
                  const vehicleLabel =
                    [vehicle?.brand_name, vehicle?.model_name, vehicle?.year].filter(Boolean).join(" ") ||
                    "Vehículo sin datos";
                  const badge = STATUS_BADGE[order.status];

                  return (
                    <li
                      key={order.id}
                      className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="truncate text-sm font-medium">
                          {order.folio ?? `#${order.id.slice(0, 8)}`} · {vehicleLabel}
                          {vehicle?.plate ? ` (${vehicle.plate})` : ""}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {customerName || "Cliente sin nombre"} · {dateTime.format(new Date(order.created_at))}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge variant={badge.variant} className="text-[10px]">
                          {badge.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{money.format(Number(order.total))}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Accesos rápidos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <QuickAction href={`/${locale}${ROUTES.newOrder}`} icon={<PlusIcon className="size-4" />}>
              Nueva orden de servicio
            </QuickAction>
            <QuickAction href={`/${locale}${ROUTES.customers}`} icon={<UsersIcon className="size-4" />}>
              Clientes y vehículos
            </QuickAction>
            <QuickAction href={`/${locale}${ROUTES.invoices}`} icon={<ReceiptIcon className="size-4" />}>
              Facturación rápida
            </QuickAction>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componentes de presentación
// ---------------------------------------------------------------------------
function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">{icon}</div>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold">{value}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function QuickAction({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
    >
      {icon}
      {children}
    </Link>
  );
}