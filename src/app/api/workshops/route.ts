import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import { getWorkshops } from "@/lib/supabase/workshops";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export async function GET(req: NextRequest) {
  const city      = req.nextUrl.searchParams.get("city") ?? undefined;
  const workshops = await getWorkshops(city);
  return ok(workshops);
}

const CreateSchema = z.object({
  name:     z.string().min(2).max(100),
  slug:     z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  address:  z.string().max(200).optional(),
  lat:      z.number().optional(),
  lng:      z.number().optional(),
  city:     z.string().max(100).optional(),
  phone_wa: z.string().max(20).optional(),
  // ✅ Zod v4 requiere key + value type, cast a Json para Supabase
  schedule: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(["super_admin", "workshop_admin"]);
  if (error) return error;

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { schedule, ...rest } = parsed.data;

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("workshops")
    .insert({
      ...rest,
      owner_id: user!.id,
      // ✅ cast explícito a Json para compatibilidad con Supabase
      ...(schedule !== undefined && { schedule: schedule as Json }),
    })
    .select()
    .single();

  if (dbError) return err(dbError.message, 500);
  return ok(data, 201);
}