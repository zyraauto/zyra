"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useAppointments } from "@/hooks/useAppointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarIcon, ArrowRightIcon, XCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import type { AppointmentStatus } from "@/types";

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

const TABS = [
  { value: "upcoming",  label: "Upcoming"  },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export default function AppointmentsPage() {
  const { profile } = useAuthStore();
  const { appointments = [], isLoading, cancelAppointment } = useAppointments(
    profile?.id ?? null,
    "client"
  );

  const [cancelling, setCancelling] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    const { error } = await cancelAppointment(id);
    if (error) toast.error("Failed to cancel appointment.");
    else       toast.success("Appointment cancelled.");
    setCancelling(null);
  };

  const byTab: Record<string, typeof appointments> = {
    upcoming:  appointments.filter((a) => ["pending", "confirmed", "in_progress"].includes(a.status ?? "pending")),
    completed: appointments.filter((a) => a.status === "completed"),
    cancelled: appointments.filter((a) => a.status === "cancelled"),
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage your service history.
          </p>
        </div>

        <Button size="sm" asChild>
          <Link href="/public/cotizador">
            Book service
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              {byTab[t.value]?.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5">
                  {byTab[t.value].length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-4">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : byTab[t.value]?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                <CalendarIcon className="size-10 mb-3 opacity-30" />
                <p className="text-sm">No {t.label.toLowerCase()} appointments.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {byTab[t.value].map((apt) => {
                  const status = apt.status ?? "pending";
                  const badge   = STATUS_BADGE[status];
                  const canCancel = ["pending", "confirmed"].includes(status);

                  return (
                    <div
                      key={apt.id}
                      className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card"
                    >
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {apt.services?.name ?? "Service"}
                          </p>
                          <Badge
                            variant={badge.variant}
                            className="text-[10px]"
                          >
                            {badge.label}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {apt.workshops?.name ?? "Workshop"}
                        </p>

                        {apt.scheduled_at && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="size-3" />
                            {format(new Date(apt.scheduled_at), "EEEE, MMMM d · h:mm a")}
                          </p>
                        )}

                        {apt.final_price != null && (
                          <p className="text-xs font-medium">
                            ${Number(apt.final_price).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                          <Link href={`/client/citas/${apt.id}`}>
                            <ArrowRightIcon className="size-4" />
                          </Link>
                        </Button>

                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            disabled={cancelling === apt.id}
                            onClick={() => handleCancel(apt.id)}
                          >
                            <XCircleIcon className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
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