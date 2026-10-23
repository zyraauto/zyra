import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWorkshopsByOwner } from "@/lib/supabase/workshops";
import { getAppointmentsByWorkshop } from "@/lib/supabase/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/workshop/RevenueChart";
import { format, subMonths } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const workshops = await getWorkshopsByOwner(user.id);
  if (!workshops.length) redirect("/workshop/setup");

  const workshop     = workshops[0];
  const appointments = await getAppointmentsByWorkshop(workshop.id);

  // Ingresos: órdenes de trabajo cerradas (completed o delivered)
  const { data: ordersData, error: ordersError } = await supabase
    .from("work_orders")
    .select("id, appointment_id, total, completed_at, delivered_at")
    .eq("workshop_id", workshop.id)
    .in("status", ["completed", "delivered"]);

  if (ordersError) console.error("reportes:", ordersError.message);
  const orders = ordersData ?? [];

  const closedAt = (o: { completed_at: string | null; delivered_at: string | null }) =>
    o.completed_at ?? o.delivered_at;

  // Build monthly revenue for last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date  = subMonths(new Date(), 5 - i);
    const key   = format(date, "yyyy-MM");
    const label = format(date, "MMM");
    return { key, label };
  });

  const revenueByMonth = months.map(({ key, label }) => {
    const monthly = orders.filter((o) => closedAt(o)?.startsWith(key));
    return {
      month:   label,
      revenue: monthly.reduce((sum, o) => sum + Number(o.total ?? 0), 0),
      count:   monthly.length,
    };
  });

  // Service breakdown: el servicio sale de la cita ligada a cada orden
  const serviceByAppointment = new Map(
    appointments.map((a) => [a.id, a.service_type ?? "Unknown"] as const)
  );

  const serviceMap: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach((o) => {
    const name =
      (o.appointment_id && serviceByAppointment.get(o.appointment_id)) || "Walk-in";
    if (!serviceMap[name]) serviceMap[name] = { name, count: 0, revenue: 0 };
    serviceMap[name].count   += 1;
    serviceMap[name].revenue += Number(o.total ?? 0);
  });
  const serviceBreakdown = Object.values(serviceMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const avgTicket    = orders.length ? totalRevenue / orders.length : 0;

  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Performance overview for {workshop.name}.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total services",  value: orders.length.toLocaleString() },
          { label: "Total revenue",   value: `$${totalRevenue.toLocaleString()}` },
          { label: "Avg ticket",      value: `$${Math.round(avgTicket).toLocaleString()}` },
          { label: "Cancellation rate",
            value: appointments.length
              ? `${Math.round((cancelledCount / appointments.length) * 100)}%`
              : "0%"
          },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue — last 6 months</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueByMonth} />
        </CardContent>
      </Card>

      {/* Top services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top services</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {serviceBreakdown.map((s) => (
                <div key={s.name} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.count} services</p>
                  </div>
                  <p className="font-bold">${s.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}