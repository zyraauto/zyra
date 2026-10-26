import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import type { PublicWorkshop } from "@/types";

// Se re-exporta para no romper imports antiguos desde este archivo.
export type { PublicWorkshop };

// Columnas de la vista public.workshops_public
const PUBLIC_WORKSHOP_COLUMNS = `
  id,
  name,
  slug,
  address,
  lat,
  lng,
  city,
  phone_wa,
  logo_url,
  rating,
  total_reviews,
  opening_hours,
  accepts_vehicles,
  schedule
`;

export async function getPublicWorkshops(): Promise<PublicWorkshop[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops_public")
    .select(PUBLIC_WORKSHOP_COLUMNS)
    .order("rating", { ascending: false });

  return (data as unknown as PublicWorkshop[]) ?? [];
}

export async function getPublicWorkshopById(id: string): Promise<PublicWorkshop | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops_public")
    .select(PUBLIC_WORKSHOP_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  return (data as unknown as PublicWorkshop | null) ?? null;
}

// Las tres funciones siguientes leen la tabla base `workshops`.
// Cuando se cierre la tabla solo funcionarán para el dueño o super_admin.
export async function getWorkshopBySlug(slug: string): Promise<Tables<"workshops"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as Tables<"workshops"> | null) ?? null;
}

export async function getWorkshopById(id: string): Promise<Tables<"workshops"> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Tables<"workshops"> | null) ?? null;
}

export async function getWorkshopsByOwner(ownerId: string): Promise<Tables<"workshops">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  return (data as Tables<"workshops">[]) ?? [];
}

type AppointmentRow = {
  scheduled_at: string;
};

export async function getBookedSlots(
  workshopId: string,
  date: string
): Promise<string[]> {
  const supabase = await createClient();
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59`;

  const { data } = await supabase
    .from("appointments")
    .select("scheduled_at")
    .eq("workshop_id", workshopId)
    .gte("scheduled_at", start)
    .lte("scheduled_at", end)
    .not("status", "in", '("cancelled")');

  return ((data as AppointmentRow[]) ?? [])
    .map((a) => a.scheduled_at ?? "")
    .filter(Boolean);
}