import { createClient } from "@/lib/supabase/server";
import { SHOP_UTC_OFFSET } from "@/lib/appointmentFormat";
import type { AppointmentWithDetails, AppointmentStatus } from "@/types";
import type { TablesInsert, TablesUpdate } from "@/types/database";

type AppointmentInsert = TablesInsert<"appointments">;
type AppointmentUpdate = TablesUpdate<"appointments">;

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;
type AppointmentRow = Omit<AppointmentWithDetails, "workshops">;
type WorkshopSummary = NonNullable<AppointmentWithDetails["workshops"]>;

// "!inner" convierte el join en filtro: solo vuelven las citas cuyo
// cliente (o mecánico) coincide con el usuario que se pide.
// El taller NO se anida aquí: la tabla workshops no es legible desde el
// navegador; sus datos públicos se piden aparte con withWorkshops().
function buildSelect(inner?: "customers" | "workshop_staff") {
  const customers = inner === "customers" ? "customers!inner" : "customers";
  const staff = inner === "workshop_staff" ? "workshop_staff!inner" : "workshop_staff";

  return `
    *,
    customer_vehicles (*),
    ${customers} (id, user_id, first_name, last_name, phone),
    ${staff} (id, first_name, last_name)
  `;
}

// Une los datos públicos del taller (vista workshops_public) a cada cita.
async function withWorkshops(
  supabase: SupabaseServer,
  rows: AppointmentRow[]
): Promise<AppointmentWithDetails[]> {
  const ids = Array.from(
    new Set(rows.map((r) => r.workshop_id).filter((id): id is string => !!id))
  );

  if (!ids.length) {
    return rows.map((r) => ({ ...r, workshops: null }));
  }

  const { data, error } = await supabase
    .from("workshops_public")
    .select("id, name, address, phone_wa")
    .in("id", ids);

  if (error) console.error("withWorkshops:", error.message);

  const byId = new Map(
    ((data ?? []) as unknown as WorkshopSummary[]).map((w) => [w.id, w])
  );

  return rows.map((r) => ({
    ...r,
    workshops: r.workshop_id ? byId.get(r.workshop_id) ?? null : null,
  }));
}

export async function getAppointmentById(
  id: string
): Promise<AppointmentWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(buildSelect())
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getAppointmentById:", error.message);
    return null;
  }
  if (!data) return null;

  const [full] = await withWorkshops(supabase, [data as unknown as AppointmentRow]);
  return full ?? null;
}

// userId = id del usuario autenticado (customers.user_id)
export async function getAppointmentsByClient(
  userId: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(buildSelect("customers"))
    .eq("customers.user_id", userId)
    .order("scheduled_at", { ascending: false });

  if (error) console.error("getAppointmentsByClient:", error.message);
  return withWorkshops(supabase, (data as unknown as AppointmentRow[]) ?? []);
}

export async function getAppointmentsByWorkshop(
  workshopId: string,
  date?: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select(buildSelect())
    .eq("workshop_id", workshopId)
    .order("scheduled_at", { ascending: true });

  if (date) {
    query = query
      .gte("scheduled_at", `${date}T00:00:00${SHOP_UTC_OFFSET}`)
      .lte("scheduled_at", `${date}T23:59:59.999${SHOP_UTC_OFFSET}`);
  }

  const { data, error } = await query;
  if (error) console.error("getAppointmentsByWorkshop:", error.message);
  return withWorkshops(supabase, (data as unknown as AppointmentRow[]) ?? []);
}

// userId = id del usuario autenticado (workshop_staff.user_id)
export async function getAppointmentsByMechanic(
  userId: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(buildSelect("workshop_staff"))
    .eq("workshop_staff.user_id", userId)
    .order("scheduled_at", { ascending: true });

  if (error) console.error("getAppointmentsByMechanic:", error.message);
  return withWorkshops(supabase, (data as unknown as AppointmentRow[]) ?? []);
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

  if (error) {
    console.error("createAppointment:", error.message);
    return null;
  }
  return (data as { id: string } | null) ?? null;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  extra?: Pick<AppointmentUpdate, "notes" | "cancelled_reason">
): Promise<boolean> {
  const supabase = await createClient();
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

  if (error) console.error("updateAppointmentStatus:", error.message);
  return !error;
}