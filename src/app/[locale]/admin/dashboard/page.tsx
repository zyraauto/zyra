import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/workshop/RevenueChart";
import {
  UsersIcon,
  BuildingsIcon,
  CalendarCheckIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react/dist/ssr";
import { format, subMonths } from "date-fns";
import type { Metadata } from "next";
import type { Tables } from "@/types/database";

export const metadata: Metadata = { title: "Admin Dashboard" };

type UserRow      = Pick<Tables<"profiles">,     "id" | "role" | "created_at">;
type WorkshopRow  = Pick<Tables<"workshops">,    "id" | "is_active">;
type AppointmentRow = Pick<Tables<"appointments">,
  "id" | "status" | "final_price" | "created_at" | "completed_at"
>;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [usersResult, workshopsResult, appointmentsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, role, created_at"),
    supabase
      .from("workshops")
      .select("id, is_active"),
    supabase
      .from("appointments")
      .select("id, status, final_price, created_at, completed_at"),
  ]);

  const users        = (usersResult.data        ?? []) as UserRow[];
  const workshops    = (workshopsResult.data    ?? []) as WorkshopRow[];
  const appointments = (appointmentsResult.data ?? []) as AppointmentRow[];

  const completed    = appointments.filter((a) => a.status === "completed");
  const totalRevenue = completed.reduce(
    (sum, a) => sum + Number(a.final_price ?? 0), 0
  );

  // Monthly revenue — last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date  = subMonths(new Date(), 5 - i);
    const key   = format(date, "yyyy-MM");
    const label = format(date, "MMM");
    return { key, label };
  });

  const revenueData = months.map(({ key, label }) => ({
    month:   label,
    revenue: completed
      .filter((a) => a.completed_at?.startsWith(key))
      .reduce((sum, a) => sum + Number(a.final_price ?? 0), 0),
    count: completed
      .filter((a) => a.completed_at?.startsWith(key))
      .length,
  }));

  // Role breakdown
  const roleCount = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const stats = [
    {
      label: "Total users",
      value: users.length,
      icon:  <UsersIcon className="size-5 text-primary" />,
    },
    {
      label: "Active workshops",
      value: workshops.filter((w) => w.is_active).length,
      icon:  <BuildingsIcon className="size-5 text-blue-500" />,
    },
    {
      label: "Total appointments",
      value: appointments.length,
      icon:  <CalendarCheckIcon className="size-5 text-orange-500" />,
    },
    {
      label: "Total revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon:  <CurrencyDollarIcon className="size-5 text-green-600" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform overview — {format(new Date(), "MMMM yyyy")}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon }) => (
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

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Platform revenue — last 6 months
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueData} />
        </CardContent>
      </Card>

      {/* Role breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users by role</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(roleCount).map(([role, count]) => (
            <div
              key={role}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <p className="text-sm capitalize">{role.replace("_", " ")}</p>
              <p className="font-bold">{count}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}