import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import { getWorkshopById } from "@/lib/supabase/workshops";
import { createClient } from "@/lib/supabase/server";
import type { Json, Tables } from "@/types/database";

type ProfileRow = Tables<"profiles">;
type Params     = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id }   = await params;
  const workshop = await getWorkshopById(id);
  if (!workshop) return err("Workshop not found", 404);
  return ok(workshop);
}

const UpdateSchema = z.object({
  name:      z.string().min(2).max(100).optional(),
  address:   z.string().max(200).optional(),
  lat:       z.number().optional(),
  lng:       z.number().optional(),
  city:      z.string().max(100).optional(),
  phone_wa:  z.string().max(20).optional(),
  // ✅ Zod v4: dos argumentos requeridos
  schedule:  z.record(z.string(), z.unknown()).optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(["workshop_admin", "super_admin"]);
  if (error) return error;

  const { id }   = await params;
  const workshop = await getWorkshopById(id);
  if (!workshop) return err("Workshop not found", 404);

  // Only owner or super_admin can update
  const supabase = await createClient();
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const profile = profileData as Pick<ProfileRow, "role"> | null;

  if (profile?.role !== "super_admin" && workshop.owner_id !== user!.id) {
    return err("Forbidden", 403);
  }

  const body   = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  // ✅ cast schedule a Json para compatibilidad con Supabase
  const { schedule, ...rest } = parsed.data;

  const { data, error: dbError } = await supabase
    .from("workshops")
    .update({
      ...rest,
      ...(schedule !== undefined && { schedule: schedule as Json }),
    })
    .eq("id", id)
    .select()
    .single();

  if (dbError) return err(dbError.message, 500);
  return ok(data);
}