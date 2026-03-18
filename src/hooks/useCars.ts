"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import type { UserCarWithDetails } from "@/types";

type CarBrand = Tables<"car_brands">;
type CarModel = Tables<"car_models">;
type CarYear  = Tables<"car_years">;
type UserCar  = Tables<"user_cars">;

// ─── Public catalog ───────────────────────────────────────────────

export function useCarBrands() {
  const [brands,    setBrands]    = useState<CarBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("car_brands")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (cancelled) return;
      setBrands((data as CarBrand[]) ?? []);
      setIsLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return { brands, isLoading };
}

export function useCarModels(brandId: string | null) {
  const [models,    setModels]    = useState<CarModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // ✅ todo el setState dentro del async
    const run = async () => {
      if (!brandId) {
        setModels([]);
        return;
      }

      setIsLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("car_models")
        .select("*")
        .eq("brand_id", brandId)
        .order("name");

      if (cancelled) return;
      setModels((data as CarModel[]) ?? []);
      setIsLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, [brandId]);

  return { models, isLoading };
}

export function useCarYears(modelId: string | null) {
  const [years,     setYears]     = useState<CarYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // ✅ todo el setState dentro del async
    const run = async () => {
      if (!modelId) {
        setYears([]);
        return;
      }

      setIsLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("car_years")
        .select("*")
        .eq("model_id", modelId)
        .order("year", { ascending: false });

      if (cancelled) return;
      setYears((data as CarYear[]) ?? []);
      setIsLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, [modelId]);

  return { years, isLoading };
}

// ─── User garage ──────────────────────────────────────────────────

export function useUserCars(userId: string | null) {
  const [cars,      setCars]      = useState<UserCarWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCars = useCallback(async () => {
    if (!userId) {
      setCars([]);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("user_cars")
      .select(`
        *,
        car_years (
          *,
          car_models (
            *,
            car_brands (*)
          )
        )
      `)
      .eq("user_id", userId)
      .order("is_favorite", { ascending: false });

    setCars((data as UserCarWithDetails[]) ?? []);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    const run = async () => { await fetchCars(); };
    run();
  }, [fetchCars]);

  const addCar = async (payload: Omit<UserCar, "id" | "created_at">) => {
    const supabase = createClient();
    const { error } = await supabase.from("user_cars").insert(payload);
    if (!error) await fetchCars();
    return { error };
  };

  const removeCar = async (carId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_cars")
      .delete()
      .eq("id", carId);
    if (!error) setCars((prev) => prev.filter((c) => c.id !== carId));
    return { error };
  };

  const toggleFavorite = async (carId: string, current: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_cars")
      .update({ is_favorite: !current })
      .eq("id", carId);
    if (!error) await fetchCars();
    return { error };
  };

  return { cars, isLoading, addCar, removeCar, toggleFavorite, refetch: fetchCars };
}