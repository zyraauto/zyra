import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const serviceId = searchParams.get("service_id");
  const yearId    = searchParams.get("year_id");

  if (!serviceId || !yearId) return err("service_id and year_id are required");

  const supabase = await createClient();
  const { data } = await supabase
    .from("service_prices")
    .select("*")
    .eq("service_id", serviceId)
    .eq("year_id", yearId)
    .single();

  if (!data) return err("Price not found", 404);
  return ok(data);
}

const UpsertSchema = z.object({
  service_id:      z.string().uuid(),
  year_id:         z.string().uuid(),
  base_price:      z.number().positive(),
  parts_included:  z.boolean().default(false),
  notes:           z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(["super_admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = UpsertSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("service_prices")
    .upsert(
      { ...parsed.data, updated_by: user!.id, updated_at: new Date().toISOString() },
      { onConflict: "service_id,year_id" }
    )
    .select()
    .single();

  if (dbError) return err(dbError.message, 500);
  return ok(data, 201);
}