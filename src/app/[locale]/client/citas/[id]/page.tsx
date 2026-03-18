import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getAppointmentById } from "@/lib/supabase/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CarIcon,
  WrenchIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import type { AppointmentStatus } from "@/types";

export const metadata: Metadata = { title: "Appointment Details" };

const STATUS_CONFIG: Record<
  AppointmentStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    color: string;
  }
> = {
  pending:     { label: "Pending",     variant: "secondary",   color: "text-yellow-600" },
  confirmed:   { label: "Confirmed",   variant: "default",     color: "text-blue-600"   },
  in_progress: { label: "In progress", variant: "default",     color: "text-orange-600" },
  completed:   { label: "Completed",   variant: "outline",     color: "text-green-600"  },
  cancelled:   { label: "Cancelled",   variant: "destructive", color: "text-red-600"    },
};

const TIMELINE: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
];

type Params = { params: { id: string } };

export default async function AppointmentDetailPage({ params }: Params) {
  const { id } = params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const appointment = await getAppointmentById(id);

  if (!appointment || appointment.client_id !== user.id) notFound();

  const status = appointment.status ?? "pending";

  const config = STATUS_CONFIG[status];
  const isCancelled = status === "cancelled";

  const timelineIndex = TIMELINE.indexOf(status);
  const currentStep =
    isCancelled ? -1 : Math.max(timelineIndex, 0);

  const car   = appointment.user_cars;
  const brand = car?.car_years?.car_models?.car_brands;
  const model = car?.car_years?.car_models;
  const year  = car?.car_years;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
        <Link href="/client/citas">
          <ArrowLeftIcon className="size-4" />
          Back to appointments
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {appointment.services?.name ?? "Service"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            ID:{" "}
            <span className="font-mono">
              {appointment.id.slice(0, 8).toUpperCase()}
            </span>
          </p>
        </div>

        <Badge variant={config.variant} className="text-sm px-3 py-1">
          {config.label}
        </Badge>
      </div>

      {!isCancelled && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              {TIMELINE.map((step, idx) => {
                const isDone = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const stepLabel = STATUS_CONFIG[step].label;

                return (
                  <div key={step} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div
                        className={`flex items-center justify-center size-8 rounded-full border-2 ${
                          isDone
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircleIcon weight="fill" className="size-4" />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-medium hidden sm:block ${
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {stepLabel}
                      </span>
                    </div>

                    {idx < TIMELINE.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 ${
                          idx < currentStep ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <WrenchIcon className="size-4" /> Service details
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">

            <div>
              <p className="text-xs text-muted-foreground">Service</p>
              <p className="font-medium">{appointment.services?.name}</p>
            </div>

            {appointment.services?.duration_minutes && (
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm flex items-center gap-1">
                  <ClockIcon className="size-3" />
                  {appointment.services.duration_minutes} min
                </p>
              </div>
            )}

            {appointment.scheduled_at && (
              <div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
                <p className="text-sm flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  {format(
                    new Date(appointment.scheduled_at),
                    "EEEE, MMMM d · h:mm a"
                  )}
                </p>
              </div>
            )}

            {appointment.final_price && (
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-lg font-bold">
                  ${Number(appointment.final_price).toLocaleString()}
                </p>
              </div>
            )}

            {appointment.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Your notes</p>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            )}

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPinIcon className="size-4" /> Workshop
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">

            <div>
              <p className="font-medium">{appointment.workshops?.name}</p>

              {appointment.workshops?.address && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {appointment.workshops.address}
                </p>
              )}
            </div>

            {appointment.workshops?.phone_wa && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://wa.me/${appointment.workshops.phone_wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PhoneIcon className="size-4" />
                  Contact on WhatsApp
                </a>
              </Button>
            )}

          </CardContent>
        </Card>

        {car && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CarIcon className="size-4" /> Vehicle
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              <p className="font-medium">
                {brand?.name} {model?.name} {year?.year}
              </p>

              {car.plate && (
                <p className="text-sm font-mono text-muted-foreground">
                  {car.plate}
                </p>
              )}

              {year?.engine_config && (
                <p className="text-sm text-muted-foreground">
                  {year.engine_config}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {appointment.mechanic_notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Mechanic notes</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm">{appointment.mechanic_notes}</p>

              {appointment.completed_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Completed on{" "}
                  {format(
                    new Date(appointment.completed_at),
                    "MMM d, yyyy"
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}