import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import type { ServiceCategory } from "@/types";

const CATEGORIES: ServiceCategory[] = ["tuning", "brakes", "oil", "other"];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") as ServiceCategory | null;

  const supabase = await createClient();
  let query = supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (category && CATEGORIES.includes(category)) {
    query = query.eq("category", category);
  }

  const { data } = await query;
  return ok(data ?? []);
}

const CreateSchema = z.object({
  name:             z.string().min(2).max(100),
  category:         z.enum(["tuning", "brakes", "oil", "other"]),
  description:      z.string().max(500).optional(),
  duration_minutes: z.number().int().positive().optional(),
  sort_order:       z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(["super_admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("services")
    .insert(parsed.data)
    .select()
    .single();

  if (dbError) return err(dbError.message, 500);
  return ok(data, 201);
}