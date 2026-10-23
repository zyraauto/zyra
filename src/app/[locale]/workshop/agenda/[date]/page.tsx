import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getWorkshopsByOwner } from "@/lib/supabase/workshops";
import { getAppointmentsByWorkshop } from "@/lib/supabase/appointments";
import { customerName, vehicleLabel, hourInShop, SHOP_UTC_OFFSET } from "@/lib/appointmentFormat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CarIcon,
  ClockIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { format, parseISO, isValid } from "date-fns";
import type { Metadata } from "next";
import type { AppointmentStatus } from "@/types";

export const metadata: Metadata = { title: "Daily Agenda" };

const STATUS_BADGE: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  scheduled:  { label: "Scheduled",  variant: "secondary"   },
  confirmed:  { label: "Confirmed",  variant: "default"     },
  checked_in: { label: "Checked in", variant: "default"     },
  completed:  { label: "Completed",  variant: "outline"     },
  no_show:    { label: "No show",    variant: "destructive" },
  cancelled:  { label: "Cancelled",  variant: "destructive" },
};

const HOUR_SLOTS = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 – 18:00

type Props = { params: Promise<{ date: string }> };

export default async function AgendaDatePage({ params }: Props) {
  const { date } = await params;

  // Validación de fecha (formato yyyy-MM-dd)
  const parsed = parseISO(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isValid(parsed)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Obtener talleres del usuario
  const workshops = await getWorkshopsByOwner(user.id);
  if (!workshops.length) redirect("/workshop/setup");

  const workshop = workshops[0];

  // Citas del taller en la fecha
  const appointments = await getAppointmentsByWorkshop(workshop.id, date);

  // Ingresos del día: órdenes de trabajo cerradas ese día
  const { data: orders } = await supabase
    .from("work_orders")
    .select("total")
    .eq("workshop_id", workshop.id)
    .in("status", ["completed", "delivered"])
    .gte("completed_at", `${date}T00:00:00${SHOP_UTC_OFFSET}`)
    .lte("completed_at", `${date}T23:59:59.999${SHOP_UTC_OFFSET}`);

  const revenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  // Agrupar por hora local del taller
  const byHour: Record<number, typeof appointments> = {};
  HOUR_SLOTS.forEach((h) => (byHour[h] = []));
  appointments.forEach((apt) => {
    if (!apt.scheduled_at) return;
    const hour = hourInShop(apt.scheduled_at);
    if (byHour[hour]) byHour[hour].push(apt);
    else byHour[hour] = [apt];
  });

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    revenue,
  };

  // Prev / next date
  const prevDate = new Date(parsed); prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(parsed); nextDate.setDate(nextDate.getDate() + 1);
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Back + navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/workshop/agenda">
            <ArrowLeftIcon className="size-4" />
            Agenda
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/workshop/agenda/${fmt(prevDate)}`}>←</Link>
          </Button>
          <span className="text-sm font-medium px-2">{format(parsed, "EEEE, MMMM d, yyyy")}</span>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/workshop/agenda/${fmt(nextDate)}`}>→</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Confirmed", value: stats.confirmed },
          { label: "Completed", value: stats.completed },
          { label: "Revenue", value: `$${stats.revenue.toLocaleString()}` },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Schedule — {format(parsed, "MMM d")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {HOUR_SLOTS.map((hour) => {
            const slotApts = byHour[hour] ?? [];
            const timeLabel = `${String(hour).padStart(2, "0")}:00`;

            return (
              <div key={hour} className="flex gap-4 py-3 min-h-[56px]">
                <div className="w-14 shrink-0 pt-0.5">
                  <span className="text-xs font-mono text-muted-foreground">{timeLabel}</span>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  {slotApts.length === 0 ? (
                    <div className="h-8 rounded border border-dashed border-border/50" />
                  ) : (
                    slotApts.map((apt) => {
                      const status = apt.status ?? "scheduled";
                      const badge = STATUS_BADGE[status];
                      const vehicle = vehicleLabel(apt);

                      return (
                        <div key={apt.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 border">
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium">{apt.service_type ?? "Service"}</p>
                              <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                            </div>

                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <UserIcon className="size-3" />
                              {customerName(apt)}
                              {apt.customers?.phone && ` · ${apt.customers.phone}`}
                            </p>

                            {vehicle && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CarIcon className="size-3" />
                                {vehicle}
                                {apt.customer_vehicles?.plate && ` · ${apt.customer_vehicles.plate}`}
                              </p>
                            )}

                            {apt.estimated_duration_min ? (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <ClockIcon className="size-3" />
                                {apt.estimated_duration_min} min
                              </p>
                            ) : null}

                            {apt.customer_notes && (
                              <p className="text-xs text-muted-foreground italic truncate max-w-xs">
                                &quot;{apt.customer_notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}