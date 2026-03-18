import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api";
import { getModelsByBrand } from "@/lib/supabase/cars";

type Params = { params: Promise<{ brandId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { brandId } = await params;
  if (!brandId) return err("brandId required");

  const models = await getModelsByBrand(brandId);
  return ok(models);
}