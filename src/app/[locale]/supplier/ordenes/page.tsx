import { createClient } from "@/lib/supabase/server"; 
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  CalendarIcon,
} from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import type { Metadata } from "next";
import type { AppointmentWithDetails, AppointmentStatus } from "@/types";

export const metadata: Metadata = { title: "Orders" };

// Estado de citas a badges
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

export default async function SupplierOrdenesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch de citas con relaciones
  const { data: appointmentsData } = await supabase
    .from("appointments") // no usar <AppointmentWithDetails>
    .select(`
      *,
      workshops  (id, name, address, phone_wa),
      services   (id, name, category, duration_minutes),
      user_cars  (
        *,
        car_years (*, car_models (*, car_brands (*)))
      ),
      profiles!appointments_client_id_fkey (id, full_name, phone),
      service_prices!appointments_price_id_fkey (parts_included, base_price)
    `)
    .order("scheduled_at", { ascending: false })
    .limit(100);

  // Casteo seguro a AppointmentWithDetails con service_prices
  const all = (appointmentsData ?? []) as (AppointmentWithDetails & {
    service_prices: { parts_included: boolean; base_price: number } | null;
  })[];

  // Filtrar solo citas que incluyen partes
  const withParts = all.filter((a) => a.service_prices?.parts_included === true);

  const incoming  = withParts.filter((a) => ["pending", "confirmed"].includes(a.status ?? "pending"));
  const active    = withParts.filter((a) => a.status === "in_progress");
  const fulfilled = withParts.filter((a) => a.status === "completed");
  const cancelled = withParts.filter((a) => a.status === "cancelled");

  const stats = {
    incoming:  incoming.length,
    active:    active.length,
    fulfilled: fulfilled.length,
    revenue:   fulfilled.reduce(
      (sum, a) => sum + Number(a.service_prices?.base_price ?? 0), 0
    ),
  };

  const tabs = [
    { value: "incoming",  label: "Incoming",  items: incoming,  icon: <PackageIcon className="size-4" />      },
    { value: "active",    label: "Active",    items: active,    icon: <TruckIcon className="size-4" />         },
    { value: "fulfilled", label: "Fulfilled", items: fulfilled, icon: <CheckCircleIcon className="size-4" />  },
    { value: "cancelled", label: "Cancelled", items: cancelled, icon: <ClockIcon className="size-4" />        },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Service orders that require parts supply.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Incoming",     value: stats.incoming,  icon: <PackageIcon className="size-5 text-primary" /> },
          { label: "Active",       value: stats.active,    icon: <TruckIcon className="size-5 text-orange-500" /> },
          { label: "Fulfilled",    value: stats.fulfilled, icon: <CheckCircleIcon className="size-5 text-green-600" /> },
          { label: "Parts revenue",value: `$${stats.revenue.toLocaleString()}`, icon: <PackageIcon className="size-5 text-blue-500" /> },
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

      {/* Tabs */}
      <Tabs defaultValue="incoming">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              {t.items.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5">
                  {t.items.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <div className="flex justify-center mb-3 opacity-30">{tab.icon}</div>
                  <p className="text-sm">No {tab.label.toLowerCase()} orders.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {tab.items.map((apt) => {
                  const status = apt.status ?? "pending";
                  const badge = STATUS_BADGE[status];
                  const car   = apt.user_cars;
                  const brand = car?.car_years?.car_models?.car_brands;
                  const model = car?.car_years?.car_models;
                  const year  = car?.car_years;

                  return (
                    <Card key={apt.id}>
                      <CardContent className="p-4 flex flex-col gap-3">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm">{apt.services?.name ?? "Service"}</p>
                              <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {apt.workshops?.name ?? "Workshop"}
                              {apt.workshops?.address && ` · ${apt.workshops.address}`}
                            </p>
                          </div>
                          {apt.service_prices?.base_price && (
                            <p className="font-bold text-sm shrink-0">
                              ${Number(apt.service_prices.base_price).toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Vehicle */}
                        {car && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <PackageIcon className="size-3 shrink-0" />
                            {brand?.name} {model?.name} {year?.year}
                            {car.plate && ` · ${car.plate}`}
                          </div>
                        )}

                        {/* Schedule + client */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          {apt.scheduled_at && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarIcon className="size-3" />
                              {format(new Date(apt.scheduled_at), "EEEE, MMM d · h:mm a")}
                            </p>
                          )}
                          {apt.profiles?.full_name && (
                            <p className="text-xs text-muted-foreground">
                              Client: {apt.profiles.full_name}
                            </p>
                          )}
                        </div>

                        {/* Workshop contact */}
                        {apt.workshops?.phone_wa && (
                          <Button variant="outline" size="sm" className="w-fit" asChild>
                            <a
                              href={`https://wa.me/${apt.workshops.phone_wa}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Contact workshop
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}