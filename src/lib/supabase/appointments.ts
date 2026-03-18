import { createClient } from "@/lib/supabase/server";
import type { AppointmentWithDetails, AppointmentStatus } from "@/types";
import type { TablesInsert, TablesUpdate } from "@/types/database";

type AppointmentInsert = TablesInsert<"appointments">;
type AppointmentUpdate = TablesUpdate<"appointments">;

export async function getAppointmentById(
  id: string
): Promise<AppointmentWithDetails | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(`
      *,
      workshops (id, name, address, phone_wa),
      services (id, name, category, duration_minutes),
      user_cars (*, car_years (*, car_models (*, car_brands (*)))),
      profiles!appointments_client_id_fkey (id, full_name, phone)
    `)
    .eq("id", id)
    .single();
  return (data as AppointmentWithDetails | null) ?? null;
}

export async function getAppointmentsByClient(
  clientId: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(`
      *,
      workshops (id, name, address, phone_wa),
      services (id, name, category, duration_minutes),
      user_cars (*, car_years (*, car_models (*, car_brands (*)))),
      profiles!appointments_client_id_fkey (id, full_name, phone)
    `)
    .eq("client_id", clientId)
    .order("scheduled_at", { ascending: false });
  return (data as AppointmentWithDetails[]) ?? [];
}

export async function getAppointmentsByWorkshop(
  workshopId: string,
  date?: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select(`
      *,
      workshops (id, name, address, phone_wa),
      services (id, name, category, duration_minutes),
      user_cars (*, car_years (*, car_models (*, car_brands (*)))),
      profiles!appointments_client_id_fkey (id, full_name, phone)
    `)
    .eq("workshop_id", workshopId)
    .order("scheduled_at", { ascending: true });

  if (date) {
    query = query
      .gte("scheduled_at", `${date}T00:00:00`)
      .lte("scheduled_at", `${date}T23:59:59`);
  }

  const { data } = await query;
  return (data as AppointmentWithDetails[]) ?? [];
}

export async function getAppointmentsByMechanic(
  mechanicId: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(`
      *,
      workshops (id, name, address, phone_wa),
      services (id, name, category, duration_minutes),
      user_cars (*, car_years (*, car_models (*, car_brands (*)))),
      profiles!appointments_client_id_fkey (id, full_name, phone)
    `)
    .eq("mechanic_id", mechanicId)
    .order("scheduled_at", { ascending: true });
  return (data as AppointmentWithDetails[]) ?? [];
}

export async function createAppointment(
  payload: AppointmentInsert
): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert(payload)
    .select("id")
    .single();
  if (error) return null;
  return (data as { id: string } | null) ?? null;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  extra?: Pick<AppointmentUpdate, "mechanic_notes" | "completed_at" | "final_price">
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status, ...extra })
    .eq("id", id);
  return !error;
}