import { ok } from "@/lib/api";
import { getBrands } from "@/lib/supabase/cars";

export async function GET() {
  const brands = await getBrands();
  return ok(brands);
}