import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAppointmentsByWorkshop } from "@/lib/supabase/appointments";
import { getWorkshopsByOwner } from "@/lib/supabase/workshops";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import type { AppointmentStatus } from "@/types";

export const metadata: Metadata = { title: "Workshop Dashboard" };

const STATUS_BADGE: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:     { label: "Pending",     variant: "secondary"   },
  confirmed:   { label: "Confirmed",   variant: "default"     },
  in_progress: { label: "In progress", variant: "default"     },
  completed:   { label: "Completed",   variant: "outline"     },
  cancelled:   { label: "Cancelled",   variant: "destructive" },
};

export default async function WorkshopDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const workshops = await getWorkshopsByOwner(user.id);
  if (!workshops.length) redirect("/workshop/setup");

  const workshop     = workshops[0];
  const today        = new Date().toISOString().split("T")[0];
  const appointments = await getAppointmentsByWorkshop(workshop.id);

  const todayApts = appointments.filter(
    (a) => a.scheduled_at?.startsWith(today)
  );

  const stats = {
    todayTotal:   todayApts.length,
    pending:      appointments.filter((a) => a.status === "pending").length,
    inProgress:   appointments.filter((a) => a.status === "in_progress").length,
    completedMonth: appointments.filter((a) => {
      if (a.status !== "completed" || !a.completed_at) return false;
      const d = new Date(a.completed_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    revenue: appointments
      .filter((a) => a.status === "completed")
      .reduce((sum, a) => sum + Number(a.final_price ?? 0), 0),
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{workshop.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today",         value: stats.todayTotal,     icon: <CalendarIcon className="size-5 text-primary" />          },
          { label: "Pending",       value: stats.pending,        icon: <ClockIcon className="size-5 text-yellow-500" />          },
          { label: "In progress",   value: stats.inProgress,     icon: <ClockIcon className="size-5 text-orange-500" />          },
          { label: "Revenue (month)", value: `$${stats.revenue.toLocaleString()}`, icon: <CurrencyDollarIcon className="size-5 text-green-600" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">
            Today&apos;s agenda
            <span className="ml-2 text-muted-foreground font-normal text-sm">
              ({todayApts.length})
            </span>
          </CardTitle>
          <Link
            href="/workshop/agenda"
            className="text-xs text-primary hover:underline"
          >
            View full agenda
          </Link>
        </CardHeader>
        <CardContent>
          {todayApts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircleIcon className="size-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayApts.map((apt) => {
                const status = apt.status ?? "pending";
                const badge = STATUS_BADGE[status];
                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card gap-4"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {apt.services?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apt.profiles?.full_name ?? "Client"}
                        {apt.scheduled_at && (
                          <> · {format(new Date(apt.scheduled_at), "h:mm a")}</>
                        )}
                      </p>
                    </div>
                    <Badge variant={badge.variant} className="text-[10px] shrink-0">
                      {badge.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}