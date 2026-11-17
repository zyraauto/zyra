"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppointmentWithDetails, AppointmentStatus } from "@/types";
import type { TablesInsert, Database } from "@/types/database";

export type InsertDto<TableName extends keyof Database["public"]["Tables"]> =
  TablesInsert<TableName>;

type Role = "client" | "mechanic" | "workshop_admin";

// Cliente: la base de datos (RLS, con my_customer_ids()) ya devuelve solo sus
// citas, asi que no se filtra ni se embebe nada por codigo. El cliente no puede
// leer customers, customer_vehicles ni workshop_staff; embeberlos con "!inner"
// descartaba todas sus citas. Solo se embebe workshops_public (vista segura).
// El vehiculo se pide aparte a la vista client_vehicles (ver fetchAppointments).
//
// Mecanico: "!inner" sobre workshop_staff convierte el join en filtro: solo
// vuelven las citas cuyo tecnico coincide con el usuario.
function buildSelect(role: Role) {
  if (role === "client") {
    return `
      *,
      workshops:workshops_public (id, name, address, phone_wa)
    `;
  }

  const staff = role === "mechanic" ? "workshop_staff!inner" : "workshop_staff";

  return `
    *,
    workshops:workshops_public (id, name, address, phone_wa),
    customer_vehicles (*),
    customers (id, user_id, first_name, last_name, phone),
    ${staff} (id, first_name, last_name)
  `;
}

type ClientVehicle = {
  id: string;
  brand_name: string | null;
  model_name: string | null;
  year: number | null;
  plate: string | null;
};

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

    if (role === "mechanic") query = query.eq("workshop_staff.user_id", userId);

    const { data, error } = await query;
    if (error) console.error("useAppointments:", error.message);

    let rows = (data as unknown as AppointmentWithDetails[]) ?? [];

    // Cliente: segunda consulta a la vista client_vehicles y se pega a cada
    // cita como customer_vehicles, para que la pagina no cambie.
    if (role === "client" && rows.length > 0) {
      const ids = Array.from(
        new Set(
          rows
            .map((r) => (r as unknown as { vehicle_id: string | null }).vehicle_id)
            .filter((v): v is string => Boolean(v))
        )
      );

      if (ids.length > 0) {
        // client_vehicles es una vista y database.ts aun no la incluye
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const untyped = supabase as unknown as { from: (t: string) => any };
        const { data: vData, error: vError } = await untyped
          .from("client_vehicles")
          .select("id, brand_name, model_name, year, plate")
          .in("id", ids);

        if (vError) console.error("useAppointments vehicles:", vError.message);

        const byId = new Map<string, ClientVehicle>(
          ((vData as ClientVehicle[]) ?? []).map((v) => [v.id, v])
        );

        rows = rows.map((r) => {
          const vid = (r as unknown as { vehicle_id: string | null }).vehicle_id;
          return {
            ...r,
            customer_vehicles: (vid ? byId.get(vid) : null) ?? null,
          } as unknown as AppointmentWithDetails;
        });
      }
    }

    setAppointments(rows);
    setIsLoading(false);
  }, [userId, role]);

  useEffect(() => {
    const run = async () => await fetchAppointments();
    run();
  }, [fetchAppointments]);

  // Realtime: sin filtro de columna porque la cita ya no guarda el id del
  // usuario. Supabase solo envia las filas que tus politicas RLS permiten ver.
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