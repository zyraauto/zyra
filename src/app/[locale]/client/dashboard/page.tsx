import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAppointmentsByClient } from "@/lib/supabase/appointments";
import { PointsBar } from "@/components/loyalty/PointsBar";
import { PromoCard } from "@/components/loyalty/PromoCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CarIcon,
  ArrowRightIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import type { Promotion } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:     { label: "Pending",     variant: "secondary"   },
  confirmed:   { label: "Confirmed",   variant: "default"     },
  in_progress: { label: "In progress", variant: "default"     },
  completed:   { label: "Completed",   variant: "outline"     },
  cancelled:   { label: "Cancelled",   variant: "destructive" },
};

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Parallel fetches
  const [appointments, carsResult, promosResult] = await Promise.all([
    getAppointmentsByClient(user.id),
    supabase
      .from("user_cars")
      .select("id")
      .eq("user_id", user.id),
    supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .lte("valid_from", new Date().toISOString().split("T")[0])
      .gte("valid_until", new Date().toISOString().split("T")[0])
      .limit(2),
  ]);

  const upcoming = appointments
    .filter((a) => ["pending", "confirmed"].includes(a.status ?? "pending"))
    .slice(0, 3);

  const carsCount  = carsResult.data?.length ?? 0;
  const promotions = (promosResult.data ?? []) as Promotion[];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here an overview of your activity.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                <CalendarIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcoming.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                <WrenchIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                <CarIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{carsCount}</p>
                <p className="text-xs text-muted-foreground">Cars in garage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points bar */}
      <PointsBar />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Upcoming appointments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/client/citas">
                View all <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarIcon className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No upcoming appointments.</p>
                <Button size="sm" className="mt-3" asChild>
                  <Link href="/public/cotizador">Book a service</Link>
                </Button>
              </div>
            ) : (
              upcoming.map((apt) => {
                const status = apt.status ?? "pending";
                const badge = STATUS_BADGE[status];
                return (
                  <Link
                    key={apt.id}
                    href={`/client/citas/${apt.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">
                        {apt.services?.name ?? "Service"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apt.workshops?.name ?? "Workshop"}
                        {apt.scheduled_at && (
                          <> · {format(new Date(apt.scheduled_at), "MMM d, h:mm a")}</>
                        )}
                      </p>
                    </div>
                    <Badge variant={badge.variant} className="text-[10px]">
                      {badge.label}
                    </Badge>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Active promotions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Active promotions</h2>
          </div>
          {promotions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No active promotions right now.</p>
              </CardContent>
            </Card>
          ) : (
            promotions.map((p) => <PromoCard key={p.id} promo={p} />)
          )}
        </div>
      </div>
    </div>
  );
}