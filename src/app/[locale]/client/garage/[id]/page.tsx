import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { getAppointmentsByClient } from "@/lib/supabase/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CarIcon,
  WrenchIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import type { UserCarWithDetails, AppointmentStatus } from "@/types";

export const metadata: Metadata = { title: "Car Details" };

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

type Params = { params: Promise<{ id: string }> };

export default async function CarDetailPage({ params }: Params) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch car with full details
  const { data: car } = await supabase
    .from("user_cars")
    .select(`
      *,
      car_years (
        *,
        car_models (*, car_brands (*))
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!car) notFound();

  const typedCar = car as UserCarWithDetails;
  const brand    = typedCar.car_years?.car_models?.car_brands;
  const model    = typedCar.car_years?.car_models;
  const year     = typedCar.car_years;

  // Service history for this car
  const allAppointments = (await getAppointmentsByClient(user.id)) ?? [];
  const carHistory = allAppointments.filter(
    (a) => a.user_car_id === id && a.status === "completed"
  );

  const totalServices = carHistory.length;
  const totalSpent    = carHistory.reduce(
    (sum, a) => sum + Number(a.final_price ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
        <Link href="/client/garage">
          <ArrowLeftIcon className="size-4" />
          Back to garage
        </Link>
      </Button>

      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center size-16 rounded-xl bg-muted shrink-0">
          {brand?.logo_url ? (
            <Image src={brand.logo_url} alt={brand.name} className="size-12 object-contain" />
          ) : (
            <CarIcon className="size-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {typedCar.nickname ?? `${brand?.name} ${model?.name}`}
          </h1>
          <p className="text-muted-foreground text-sm">
            {brand?.name} {model?.name} · {year?.year}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Vehicle specs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[
            { label: "Brand",        value: brand?.name },
            { label: "Model",        value: model?.name },
            { label: "Year",         value: year?.year },
            { label: "Engine",       value: year?.engine_config },
            { label: "Transmission", value: year?.transmission },
            { label: "Fuel type",    value: year?.fuel_type },
            { label: "Plate",        value: typedCar.plate },
            { label: "Mileage",      value: typedCar.mileage ? `${typedCar.mileage.toLocaleString()} km` : null },
          ]
            .filter((row) => row.value)
            .map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium capitalize">{value}</p>
              </div>
            ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalServices}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total spent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-bold">
              {typedCar.last_service_date
                ? format(new Date(typedCar.last_service_date), "MMM d")
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Last service</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild>
        <Link href={`/public/cotizador?car=${id}`}>
          <WrenchIcon className="size-4" />
          Book a service for this car
        </Link>
      </Button>

      <Separator />

      <div>
        <h2 className="text-base font-semibold mb-4">Service history</h2>

        {carHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
            <WrenchIcon className="size-8 mb-3 opacity-30" />
            <p className="text-sm">No service history yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {carHistory.map((apt) => {
              const status = apt.status ?? "pending";
              const badge = STATUS_BADGE[status];
              return (
                <Link
                  key={apt.id}
                  href={`/client/citas/${apt.id}`}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center size-9 rounded-lg bg-muted shrink-0">
                      <WrenchIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">{apt.services?.name ?? "Service"}</p>
                      <p className="text-xs text-muted-foreground">{apt.workshops?.name}</p>
                      {apt.scheduled_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="size-3" />
                          {format(new Date(apt.scheduled_at), "MMM d, yyyy")}
                        </p>
                      )}
                      {apt.services?.duration_minutes && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ClockIcon className="size-3" />
                          {apt.services.duration_minutes} min
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                    {apt.final_price != null && (
                      <p className="text-sm font-bold">${Number(apt.final_price).toLocaleString()}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}