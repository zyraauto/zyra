import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getWorkshopsByOwner } from "@/lib/supabase/workshops";
import { getAppointmentsByWorkshop } from "@/lib/supabase/appointments";
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
import type { AppointmentWithDetails, AppointmentStatus } from "@/types";

export const metadata: Metadata = { title: "Daily Agenda" };

const STATUS_BADGE: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending:     { label: "Pending",     variant: "secondary"   },
  confirmed:   { label: "Confirmed",   variant: "default"     },
  in_progress: { label: "In progress", variant: "default"     },
  completed:   { label: "Completed",   variant: "outline"     },
  cancelled:   { label: "Cancelled",   variant: "destructive" },
};

const HOUR_SLOTS = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 – 18:00

type Params = { params: { date: string } };

export default async function AgendaDatePage({ params }: Params) {
  const { date } = params;

  // Validación de fecha
  const parsed = parseISO(date);
  if (!isValid(parsed)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Obtener talleres del usuario
  const workshops = await getWorkshopsByOwner(user.id);
  if (!workshops.length) redirect("/workshop/setup");

  const workshop = workshops[0];

  // Obtener citas para el taller y la fecha
  const appointmentsRaw = await getAppointmentsByWorkshop(workshop.id, date);
  const appointments = (appointmentsRaw ?? []) as (AppointmentWithDetails & { final_price: number | null })[];

  // Agrupar por hora
  const byHour: Record<number, typeof appointments> = {};
  HOUR_SLOTS.forEach((h) => (byHour[h] = []));
  appointments.forEach((apt) => {
    if (!apt.scheduled_at) return;
    const hour = new Date(apt.scheduled_at).getHours();
    if (byHour[hour]) byHour[hour].push(apt);
    else byHour[hour] = [apt];
  });

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    revenue: appointments
      .filter((a) => a.status === "completed")
      .reduce((sum, a) => sum + Number(a.final_price ?? 0), 0),
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
                      const status = apt.status ?? "pending";
                      const badge = STATUS_BADGE[status];
                      const car = apt.user_cars;
                      const brand = car?.car_years?.car_models?.car_brands;
                      const model = car?.car_years?.car_models;
                      const year = car?.car_years;

                      return (
                        <div key={apt.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 border">
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium">{apt.services?.name ?? "Service"}</p>
                              <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                            </div>

                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <UserIcon className="size-3" />
                              {apt.profiles?.full_name ?? "Client"}
                              {apt.profiles?.phone && ` · ${apt.profiles.phone}`}
                            </p>

                            {car && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CarIcon className="size-3" />
                                {brand?.name} {model?.name} {year?.year}
                                {car.plate && ` · ${car.plate}`}
                              </p>
                            )}

                            {apt.services?.duration_minutes && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <ClockIcon className="size-3" />
                                {apt.services.duration_minutes} min
                              </p>
                            )}

                            {apt.notes && (
                              <p className="text-xs text-muted-foreground italic truncate max-w-xs">&quot;{apt.notes}&quot;</p>
                            )}
                          </div>

                          {apt.final_price && (
                            <p className="text-sm font-bold shrink-0">${Number(apt.final_price).toLocaleString()}</p>
                          )}
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