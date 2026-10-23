"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useAppointments } from "@/hooks/useAppointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, CarIcon, ClipboardTextIcon } from "@phosphor-icons/react";
import { customerName, vehicleLabel } from "@/lib/appointmentFormat";
import type { AppointmentStatus, AppointmentWithDetails } from "@/types";

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

function AppointmentSheet({
  apt,
  onUpdate,
}: {
  apt: AppointmentWithDetails;
  onUpdate: (id: string, status: AppointmentStatus, notes?: string) => Promise<void>;
}) {
  const [notes,    setNotes]    = useState(apt.notes ?? "");
  const [updating, setUpdating] = useState(false);

  const vehicle = apt.customer_vehicles;
  const vLabel  = vehicleLabel(apt);

  const handleUpdate = async (status: AppointmentStatus) => {
    setUpdating(true);
    await onUpdate(apt.id, status, notes || undefined);
    setUpdating(false);
  };

  return (
    <SheetContent className="flex flex-col gap-5 overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{apt.service_type ?? "Service"}</SheetTitle>
      </SheetHeader>

      <div className="flex flex-col gap-4">
        {/* Client */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Client</p>
          <p className="font-medium">{customerName(apt)}</p>
          {apt.customers?.phone && (
            <p className="text-sm text-muted-foreground">{apt.customers.phone}</p>
          )}
        </div>

        {/* Vehicle */}
        {vehicle && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Vehicle</p>
            <p className="font-medium">{vLabel ?? "—"}</p>
            {vehicle.plate && (
              <p className="text-sm font-mono text-muted-foreground">{vehicle.plate}</p>
            )}
            {vehicle.mileage_km ? (
              <p className="text-sm text-muted-foreground">
                {vehicle.mileage_km.toLocaleString()} km
              </p>
            ) : null}
          </div>
        )}

        {/* Schedule */}
        {apt.scheduled_at && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Scheduled</p>
            <p className="text-sm">
              {format(new Date(apt.scheduled_at), "EEEE, MMMM d · h:mm a")}
            </p>
          </div>
        )}

        {/* Client notes */}
        {apt.customer_notes && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Client notes</p>
            <p className="text-sm italic">&quot;{apt.customer_notes}&quot;</p>
          </div>
        )}

        {/* Mechanic notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="mechanic-notes">My notes</Label>
          <Textarea
            id="mechanic-notes"
            rows={3}
            placeholder="Observations, parts needed…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {apt.status === "confirmed" && (
            <Button onClick={() => handleUpdate("checked_in")} disabled={updating}>
              Start service
            </Button>
          )}
          {apt.status === "checked_in" && (
            <Button onClick={() => handleUpdate("completed")} disabled={updating}>
              Mark as completed
            </Button>
          )}
        </div>
      </div>
    </SheetContent>
  );
}

export default function MisCitasPage() {
  const { profile } = useAuthStore();
  const { appointments, isLoading, updateStatus } = useAppointments(
    profile?.id ?? null,
    "mechanic"
  );

  const handleUpdate = async (
    id: string,
    status: AppointmentStatus,
    notes?: string
  ) => {
    const { error } = await updateStatus(id, status, notes ? { notes } : undefined);
    if (error) toast.error("Failed to update.");
    else       toast.success("Updated successfully.");
  };

  const active    = appointments.filter((a) => ["confirmed", "checked_in"].includes(a.status ?? "scheduled"));
  const scheduled = appointments.filter((a) => a.status === "scheduled");
  const completed = appointments.filter((a) => a.status === "completed");

  const tabs = [
    { value: "active",    label: "Active",    items: active    },
    { value: "scheduled", label: "Scheduled", items: scheduled },
    { value: "completed", label: "Completed", items: completed },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and update your assigned services.
        </p>
      </div>

      <Tabs defaultValue="active">
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
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : tab.items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ClipboardTextIcon className="size-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No appointments in this category.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {tab.items.map((apt) => {
                  const status = apt.status ?? "scheduled";
                  const badge = STATUS_BADGE[status];
                  const vLabel = vehicleLabel(apt);

                  return (
                    <Sheet key={apt.id}>
                      <SheetTrigger asChild>
                        <Card className="cursor-pointer hover:bg-accent transition-colors">
                          <CardContent className="p-4 flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-1.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">
                                  {apt.service_type ?? "Service"}
                                </p>
                                <Badge variant={badge.variant} className="text-[10px]">
                                  {badge.label}
                                </Badge>
                              </div>
                              {vLabel && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CarIcon className="size-3" />
                                  {vLabel}
                                  {apt.customer_vehicles?.plate
                                    ? ` · ${apt.customer_vehicles.plate}`
                                    : ""}
                                </p>
                              )}
                              {apt.scheduled_at && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CalendarIcon className="size-3" />
                                  {format(new Date(apt.scheduled_at), "MMM d · h:mm a")}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </SheetTrigger>
                      <AppointmentSheet apt={apt} onUpdate={handleUpdate} />
                    </Sheet>
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