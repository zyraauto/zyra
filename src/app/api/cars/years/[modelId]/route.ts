import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api";
import { getYearsByModel } from "@/lib/supabase/cars";

type Params = { params: Promise<{ modelId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { modelId } = await params;
  if (!modelId) return err("modelId required");

  const years = await getYearsByModel(modelId);
  return ok(years);
}