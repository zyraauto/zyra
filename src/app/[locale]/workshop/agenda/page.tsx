"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentCalendar } from "@/components/booking/AppointmentCalendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";
import type { AppointmentStatus } from "@/types";

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: "confirmed",   label: "Confirm"      },
  { value: "in_progress", label: "Start"        },
  { value: "completed",   label: "Complete"     },
  { value: "cancelled",   label: "Cancel"       },
];

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

export default function AgendaPage() {
  const { profile } = useAuthStore();
  const workshopId = profile?.id ?? "";

  const { appointments = [], isLoading, updateStatus } = useAppointments(workshopId, "workshop_admin");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [updating, setUpdating] = useState<string | null>(null);

  const dayApts = appointments.filter(
    (a) => a.scheduled_at && isSameDay(new Date(a.scheduled_at), selectedDate)
  );

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    setUpdating(id);
    const extra = status === "completed" ? { completed_at: new Date().toISOString() } : undefined;
    try {
      const { error } = await updateStatus(id, status, extra);
      if (error) throw new Error("Failed to update status");
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage daily appointments.</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Calendar */}
        <Card>
          <CardContent className="p-4">
            <AppointmentCalendar
              workshopId={workshopId}
              selectedDate={selectedDate}
              onSelectDate={(d) => d && setSelectedDate(d)}
            />
          </CardContent>
        </Card>

        {/* Day appointments */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{format(selectedDate, "EEEE, MMMM d")}</h2>
            <span className="text-sm text-muted-foreground">
              {dayApts.length} appointment{dayApts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : dayApts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-sm">No appointments for this day.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {dayApts
                .sort((a, b) => (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? ""))
                .map((apt) => {
                  const status = apt.status ?? "pending";
                  const badge = STATUS_BADGE[status];
                  return (
                    <Card key={apt.id}>
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{apt.services?.name ?? "Service"}</p>
                              <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {apt.profiles?.full_name ?? "Client"}
                              {apt.profiles?.phone && ` · ${apt.profiles.phone}`}
                            </p>
                            {apt.scheduled_at && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(apt.scheduled_at), "h:mm a")}
                                {apt.services?.duration_minutes && ` · ${apt.services.duration_minutes} min`}
                              </p>
                            )}
                            {apt.notes && (
                              <p className="text-xs text-muted-foreground italic">&quot;{apt.notes}&quot;</p>
                            )}
                          </div>

                          {apt.final_price && (
                            <p className="font-bold text-sm shrink-0">
                              ${Number(apt.final_price).toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Status changer */}
                        {apt.status !== "completed" && apt.status !== "cancelled" && (
                          <div className="flex items-center gap-2">
                            <Select
                              onValueChange={(v) => handleStatusChange(apt.id, v as AppointmentStatus)}
                              disabled={updating === apt.id}
                            >
                              <SelectTrigger className="h-8 text-xs flex-1">
                                <SelectValue placeholder="Update status…" />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.filter((o) => o.value !== apt.status).map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}