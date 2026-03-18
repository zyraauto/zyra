"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BellIcon, BellRingingIcon } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth.store";
import { formatDistanceToNow } from "date-fns";
import type { AppointmentWithDetails } from "@/types";

type Notification = {
  id:        string;
  message:   string;
  href:      string;
  createdAt: string;
  read:      boolean;
};

function appointmentToNotif(a: AppointmentWithDetails): Notification {
  const label =
    a.status === "confirmed"    ? "Appointment confirmed ✅" :
    a.status === "in_progress"  ? "Service in progress 🔧"   :
    a.status === "completed"    ? "Service completed 🚗"      :
    a.status === "cancelled"    ? "Appointment cancelled ❌"  :
    "Appointment update";

  return {
    id:        a.id,
    message:   label,
    href:      `/client/citas/${a.id}`,
    createdAt: a.created_at ?? new Date().toISOString(), // fallback si es null
    read:      false,
  };
}

function isAppointmentWithDetails(
  value: unknown
): value is AppointmentWithDetails {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id         === "string" &&
    typeof obj.status     === "string" &&
    typeof obj.created_at === "string" &&
    (obj.services  === null || typeof obj.services  === "object") &&
    (obj.workshops === null || typeof obj.workshops === "object")
  );
}

export function NotifBell() {
  const { profile } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open,          setOpen]          = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!profile?.id) return;

    let mounted = true;
    const supabase = createClient();

    const run = async () => {
      const { data } = await supabase
        .from("appointments")
        .select(`
          *,
          workshops (id, name, address, phone_wa),
          services (id, name, category, duration_minutes),
          user_cars (*, car_years (*, car_models (*, car_brands (*)))),
          profiles!appointments_client_id_fkey (id, full_name, phone)
        `)
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!data || !mounted) return;

      const notifs = data
        .filter(isAppointmentWithDetails)
        .map(appointmentToNotif);

      setNotifications(notifs);
    };

    run();
    return () => { mounted = false; };
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notif:${profile.id}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "appointments",
          filter: `client_id=eq.${profile.id}`,
        },
        (payload) => {
          const newAppointment = payload.new;
          if (!isAppointmentWithDetails(newAppointment)) return;

          setNotifications((prev) =>
            prev.map((n) =>
              n.id === newAppointment.id
                ? {
                    ...n,
                    message: appointmentToNotif(newAppointment).message,
                    read:    false,
                  }
                : n
            )
          );
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [profile?.id]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unread > 0 ? (
            <BellRingingIcon weight="fill" className="size-5 text-primary" />
          ) : (
            <BellIcon className="size-5" />
          )}
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px]"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 6).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={cn(
                "flex flex-col gap-0.5 cursor-pointer px-3 py-2",
                !n.read && "bg-muted/50"
              )}
              onClick={() =>
                setNotifications((prev) =>
                  prev.map((x) =>
                    x.id === n.id ? { ...x, read: true } : x
                  )
                )
              }
              asChild
            >
              <Link href={n.href}>
                <span className="text-sm font-medium">{n.message}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}