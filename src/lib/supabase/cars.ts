import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type CarBrand     = Tables<"car_brands">;
type CarModel     = Tables<"car_models">;
type CarModelYear = Tables<"car_model_years">;

export async function getBrands(): Promise<CarBrand[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("car_brands")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return (data as CarBrand[]) ?? [];
}

export async function getModelsByBrand(brandId: string): Promise<CarModel[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("car_models")
    .select("*")
    .eq("brand_id", brandId)
    .order("name");
  return (data as CarModel[]) ?? [];
}

export async function getYearsByModel(modelId: string): Promise<CarModelYear[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("car_model_years")
    .select("*")
    .eq("model_id", modelId)
    .eq("is_active", true)
    .order("year", { ascending: false })
    .order("trim_name", { ascending: true });
  return (data as CarModelYear[]) ?? [];
}

export async function getYearById(yearId: string): Promise<CarModelYear | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("car_model_years")
    .select("*")
    .eq("id", yearId)
    .maybeSingle();
  return (data as CarModelYear | null) ?? null;
}