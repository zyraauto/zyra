"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppointmentWithDetails, AppointmentStatus } from "@/types";
import type { TablesInsert, Database } from "@/types/database";

export type InsertDto<TableName extends keyof Database["public"]["Tables"]> =
  TablesInsert<TableName>;

type Role = "client" | "mechanic" | "workshop_admin";

// "!inner" convierte el join en filtro: solo vuelven las citas cuyo
// cliente (o mecánico) coincide con el usuario.
function buildSelect(role: Role) {
  const customers = role === "client" ? "customers!inner" : "customers";
  const staff = role === "mechanic" ? "workshop_staff!inner" : "workshop_staff";

  return `
    *,
    workshops (id, name, address, phone_wa),
    customer_vehicles (*),
    ${customers} (id, user_id, first_name, last_name, phone),
    ${staff} (id, first_name, last_name)
  `;
}

export function useAppointments(userId: string | null, role: Role = "client") {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!userId) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let query = supabase
      .from("appointments")
      .select(buildSelect(role))
      .order("scheduled_at", { ascending: false });

    if (role === "client") query = query.eq("customers.user_id", userId);
    if (role === "mechanic") query = query.eq("workshop_staff.user_id", userId);

    const { data, error } = await query;
    if (error) console.error("useAppointments:", error.message);

    setAppointments((data as unknown as AppointmentWithDetails[]) ?? []);
    setIsLoading(false);
  }, [userId, role]);

  useEffect(() => {
    const run = async () => await fetchAppointments();
    run();
  }, [fetchAppointments]);

  // Realtime: sin filtro de columna porque la cita ya no guarda el id del
  // usuario. Supabase solo envía las filas que tus políticas RLS permiten ver.
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`appointments:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => fetchAppointments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchAppointments]);

  const createAppointment = async (payload: InsertDto<"appointments">) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("appointments")
      .insert(payload)
      .select()
      .single();
    if (!error) await fetchAppointments();
    return { data, error };
  };

  const updateStatus = async (
    id: string,
    status: AppointmentStatus,
    extra?: { notes?: string; cancelled_reason?: string }
  ) => {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("appointments")
      .update({
        status,
        ...(status === "confirmed" ? { confirmed_at: now } : {}),
        ...(status === "cancelled" ? { cancelled_at: now } : {}),
        ...extra,
      })
      .eq("id", id);

    if (!error) await fetchAppointments();
    return { error };
  };

  const cancelAppointment = (id: string) => updateStatus(id, "cancelled");

  return {
    appointments,
    isLoading,
    createAppointment,
    updateStatus,
    cancelAppointment,
    refetch: fetchAppointments,
  };
}