import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type WorkshopRow = Tables<"workshops">;
type AppointmentRow = Pick<Tables<"appointments">, "scheduled_at">;

export async function getWorkshops(city?: string): Promise<WorkshopRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("workshops")
    .select("*")
    .eq("is_active", true)
    .order("rating", { ascending: false });

  if (city) query = query.ilike("city", `%${city}%`);

  const { data } = await query;
  return (data as WorkshopRow[]) ?? [];
}

export async function getWorkshopBySlug(slug: string): Promise<WorkshopRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as WorkshopRow | null) ?? null;
}

export async function getWorkshopById(id: string): Promise<WorkshopRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops")
    .select("*")
    .eq("id", id)
    .single();
  return (data as WorkshopRow | null) ?? null;
}

export async function getWorkshopsByOwner(ownerId: string): Promise<WorkshopRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  return (data as WorkshopRow[]) ?? [];
}

export async function getBookedSlots(
  workshopId: string,
  date: string
): Promise<string[]> {
  const supabase = await createClient();
  const start = `${date}T00:00:00`;
  const end   = `${date}T23:59:59`;

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