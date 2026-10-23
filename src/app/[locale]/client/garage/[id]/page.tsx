import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { getAppointmentsByClient } from "@/lib/supabase/appointments";
import { carInfo } from "@/lib/carFormat";
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
  scheduled:  { label: "Scheduled",  variant: "secondary"   },
  confirmed:  { label: "Confirmed",  variant: "default"     },
  checked_in: { label: "Checked in", variant: "default"     },
  completed:  { label: "Completed",  variant: "outline"     },
  no_show:    { label: "No show",    variant: "destructive" },
  cancelled:  { label: "Cancelled",  variant: "destructive" },
};

type Params = { params: Promise<{ id: string }> };

// Placa/VIN sin espacios ni guiones, en mayúsculas, para compararlos
const normalize = (s: string | null | undefined) =>
  s ? s.replace(/[\s-]/g, "").toUpperCase() : null;

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
      car_model_years (
        *,
        car_models (*, car_brands (*))
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!car) notFound();

  const typedCar = car as unknown as UserCarWithDetails;
  const info = carInfo(typedCar);

  // Citas de este auto: se enlazan por placa o VIN con el vehículo del taller
  const allAppointments = (await getAppointmentsByClient(user.id)) ?? [];
  const carPlate = normalize(typedCar.plate);
  const carVin   = normalize(typedCar.vin);

  const carAppointments = allAppointments.filter((a) => {
    const v = a.customer_vehicles;
    if (!v) return false;
    const samePlate = carPlate !== null && normalize(v.plate) === carPlate;
    const sameVin   = carVin !== null && normalize(v.vin) === carVin;
    return samePlate || sameVin;
  });

  const carHistory = carAppointments.filter((a) => a.status === "completed");

  // Gasto: órdenes de trabajo cerradas de esos vehículos
  const vehicleIds = Array.from(
    new Set(
      carAppointments
        .map((a) => a.vehicle_id)
        .filter((v): v is string => !!v)
    )
  );

  let orders: { appointment_id: string | null; total: number | null }[] = [];
  if (vehicleIds.length > 0) {
    const { data } = await supabase
      .from("work_orders")
      .select("appointment_id, total")
      .in("vehicle_id", vehicleIds)
      .in("status", ["completed", "delivered"]);
    orders = data ?? [];
  }

  const priceByAppointment = new Map<string, number>();
  orders.forEach((o) => {
    if (o.appointment_id) priceByAppointment.set(o.appointment_id, Number(o.total ?? 0));
  });

  const totalServices = carHistory.length;
  const totalSpent    = orders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

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
          {info.brandLogo ? (
            <Image
              src={info.brandLogo}
              alt={info.brandName}
              width={48}
              height={48}
              className="size-12 object-contain"
            />
          ) : (
            <CarIcon className="size-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {typedCar.nickname ?? `${info.brandName} ${info.modelName}`.trim()}
          </h1>
          <p className="text-muted-foreground text-sm">
            {info.brandName} {info.modelName}
            {info.year ? ` · ${info.year}` : ""}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Vehicle specs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[
            { label: "Brand",        value: info.brandName },
            { label: "Model",        value: info.modelName },
            { label: "Year",         value: info.year },
            { label: "Engine",       value: info.engine },
            { label: "Transmission", value: info.transmission },
            { label: "Fuel type",    value: info.fuelType },
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
              const status = apt.status ?? "scheduled";
              const badge = STATUS_BADGE[status];
              const price = priceByAppointment.get(apt.id);

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
                      <p className="text-sm font-medium">{apt.service_type ?? "Service"}</p>
                      <p className="text-xs text-muted-foreground">{apt.workshops?.name}</p>
                      {apt.scheduled_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="size-3" />
                          {format(new Date(apt.scheduled_at), "MMM d, yyyy")}
                        </p>
                      )}
                      {apt.estimated_duration_min ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ClockIcon className="size-3" />
                          {apt.estimated_duration_min} min
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                    {price != null && (
                      <p className="text-sm font-bold">${price.toLocaleString()}</p>
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