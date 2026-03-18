"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppointmentWithDetails, AppointmentStatus } from "@/types";
import type { TablesInsert, Database } from "@/types/database"; // <-- Importar Database

// Alias genérico para InsertDto usando Database
export type InsertDto<TableName extends keyof Database["public"]["Tables"]> = TablesInsert<TableName>;

export function useAppointments(
  userId: string | null,
  role: "client" | "mechanic" | "workshop_admin" = "client"
) {
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
      .select(`
        *,
        workshops (id, name, address, phone_wa),
        services (id, name, category, duration_minutes),
        user_cars (
          *,
          car_years (
            *,
            car_models (*, car_brands (*))
          )
        ),
        profiles!appointments_client_id_fkey (id, full_name, phone)
      `)
      .order("scheduled_at", { ascending: false });

    if (role === "client") query = query.eq("client_id", userId);
    if (role === "mechanic") query = query.eq("mechanic_id", userId);

    const { data } = await query;
    setAppointments((data as AppointmentWithDetails[]) ?? []);
    setIsLoading(false);
  }, [userId, role]);

  useEffect(() => {
    const run = async () => await fetchAppointments();
    run();
  }, [fetchAppointments]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const filter =
      role === "client" ? `client_id=eq.${userId}` :
      role === "mechanic" ? `mechanic_id=eq.${userId}` :
      undefined;

    const channel = supabase
      .channel(`appointments:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", ...(filter ? { filter } : {}) },
        () => fetchAppointments()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, role, fetchAppointments]);

  const createAppointment = async (
    payload: InsertDto<"appointments">
  ) => {
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
    extra?: { mechanic_notes?: string; completed_at?: string }
  ) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("appointments")
      .update({ status, ...extra })
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