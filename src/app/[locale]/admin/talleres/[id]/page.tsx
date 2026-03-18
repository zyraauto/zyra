import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getWorkshopById } from "@/lib/supabase/workshops";
import { getAppointmentsByWorkshop } from "@/lib/supabase/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { format, subMonths } from "date-fns";
import { RevenueChart } from "@/components/workshop/RevenueChart";
import type { Metadata } from "next";
import type { AppointmentStatus, WorkshopSchedule } from "@/types";
import type { Tables } from "@/types/database";

export const metadata: Metadata = {
  title: "Workshop Details",
};

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

const DAY_LABELS = {
  monday:    "Monday",
  tuesday:   "Tuesday",
  wednesday: "Wednesday",
  thursday:  "Thursday",
  friday:    "Friday",
  saturday:  "Saturday",
  sunday:    "Sunday",
} as const;

type OwnerRow = Pick<Tables<"profiles">, "full_name" | "phone" | "avatar_url">;

// ✅ Next.js 16 — params es Promise
type Params = { params: Promise<{ id: string; locale: string }> };

export default async function AdminWorkshopDetailPage({ params }: Params) {
  const { id, locale } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const [workshop, appointments] = await Promise.all([
    getWorkshopById(id),
    getAppointmentsByWorkshop(id),
  ]);

  if (!workshop) notFound();

  // Owner
  const { data: ownerData } = workshop.owner_id
    ? await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("id", workshop.owner_id)
        .single()
    : { data: null };

  const owner = ownerData as OwnerRow | null;

  // Stats
  const completed = appointments.filter((a) => a.status === "completed");

  const totalRevenue = completed.reduce(
    (sum, a) => sum + Number(a.final_price ?? 0),
    0
  );

  // ✅ Fix — filtra nulls antes de indexar
  const statusCount = appointments.reduce<Record<AppointmentStatus, number>>(
    (acc, a) => {
      if (!a.status) return acc;
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<AppointmentStatus, number>
  );

  // Revenue últimos 6 meses
  const months = Array.from({ length: 6 }, (_, i) => {
    const date  = subMonths(new Date(), 5 - i);
    const key   = format(date, "yyyy-MM");
    const label = format(date, "MMM");
    return { key, label };
  });

  const revenueData = months.map(({ key, label }) => {
    const monthly = completed.filter((a) => a.completed_at?.startsWith(key));
    return {
      month:   label,
      revenue: monthly.reduce((sum, a) => sum + Number(a.final_price ?? 0), 0),
      count:   monthly.length,
    };
  });

  const schedule = workshop.schedule as WorkshopSchedule | null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* Back */}
      <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
        <Link href={`/${locale}/admin/talleres`}>
          <ArrowLeftIcon className="size-4" />
          Back to workshops
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {workshop.logo_url ? (
            <div className="size-14 rounded-xl overflow-hidden border bg-muted shrink-0">
              <Image
                src={workshop.logo_url}
                alt={workshop.name}
                width={56}
                height={56}
                className="object-contain w-full h-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center size-14 rounded-xl bg-muted shrink-0">
              <WrenchIcon className="size-7 text-muted-foreground" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{workshop.name}</h1>
              <Badge variant={workshop.is_active ? "default" : "secondary"}>
                {workshop.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm font-mono">
              /{workshop.slug}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm">
          Edit workshop
        </Button>
      </div>

      {/* Details + Owner */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {workshop.address && (
              <div className="flex items-start gap-2">
                <MapPinIcon className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">{workshop.address}</p>
                  {workshop.city && (
                    <p className="text-xs text-muted-foreground">{workshop.city}</p>
                  )}
                </div>
              </div>
            )}

            {workshop.phone_wa && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="size-4 text-muted-foreground" />

                <a
                  href={`https://wa.me/${workshop.phone_wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {workshop.phone_wa}
                </a>
              </div>
            )}

            {workshop.rating !== null && workshop.rating > 0 && (
              <div className="flex items-center gap-2">
                <StarIcon weight="fill" className="size-4 text-yellow-500" />
                <p className="text-sm">{workshop.rating.toFixed(1)} / 5.0</p>
              </div>
            )}

            {workshop.lat && workshop.lng && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="size-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-mono">
                  {workshop.lat.toFixed(5)}, {workshop.lng.toFixed(5)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            {owner ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-muted">
                  <UserIcon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{owner.full_name ?? "—"}</p>
                  {owner.phone && (
                    <p className="text-sm text-muted-foreground">{owner.phone}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No owner assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total appointments"
          value={appointments.length}
          icon={<CalendarIcon className="size-5 text-primary" />}
        />
        <StatCard
          label="Completed"
          value={completed.length}
          icon={<WrenchIcon className="size-5 text-green-600" />}
        />
        <StatCard
          label="Cancellation rate"
          value={
            appointments.length
              ? `${Math.round(((statusCount.cancelled ?? 0) / appointments.length) * 100)}%`
              : "0%"
          }
          icon={<CalendarIcon className="size-5 text-red-500" />}
        />
        <StatCard
          label="Total revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="size-5 text-green-600" />}
        />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue — last 6 months</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueData} />
        </CardContent>
      </Card>

      {/* Schedule */}
      {schedule && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(DAY_LABELS).map(([day, label]) => {
                const slot = schedule[day as keyof WorkshopSchedule];
                return (
                  <div key={day} className="p-3 rounded-lg bg-muted border">
                    <p className="text-xs font-medium">{label}</p>
                    {slot?.enabled ? (
                      <p className="text-xs text-muted-foreground">
                        {slot.open} – {slot.close}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Closed</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No appointments yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {appointments.slice(0, 8).map((apt) => {
                if (!apt.status) return null;
                const badge = STATUS_BADGE[apt.status];

                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {apt.services?.name ?? "Service"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apt.profiles?.full_name ?? "Client"}
                        {apt.scheduled_at && (
                          <>
                            {" · "}
                            {format(new Date(apt.scheduled_at), "MMM d, h:mm a")}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {apt.final_price && (
                        <p className="text-sm font-bold">
                          ${Number(apt.final_price).toLocaleString()}
                        </p>
                      )}
                      <Badge variant={badge.variant} className="text-[10px]">
                        {badge.label}
                      </Badge>
                    </div>
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

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-muted">
            {icon}
          </div>
          <div>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}