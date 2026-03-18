import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type CarBrand = Tables<"car_brands">;
type CarModel = Tables<"car_models">;
type CarYear  = Tables<"car_years">;

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

export async function getYearsByModel(modelId: string): Promise<CarYear[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("car_years")
    .select("*")
    .eq("model_id", modelId)
    .order("year", { ascending: false });
  return (data as CarYear[]) ?? [];
}

export async function getYearById(yearId: string): Promise<CarYear | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("car_years")
    .select("*")
    .eq("id", yearId)
    .single();
  return (data as CarYear | null) ?? null;
}