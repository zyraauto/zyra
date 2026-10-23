
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesInsert } from "@/types/database";
import type { UserCarWithDetails } from "@/types";

type CarBrand = Tables<"car_brands">;
type CarModel = Tables<"car_models">;
type CarModelYear = Tables<"car_model_years">;

// ─── Public catalog ──────────────────────────────────────────────

export function useCarBrands() {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        const { data, error: queryError } = await supabase
          .from("car_brands")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (cancelled) return;

        if (queryError) {
          setBrands([]);
          setError(queryError.message);
          return;
        }

        setBrands(data ?? []);
      } catch (err: unknown) {
        if (cancelled) return;

        setBrands([]);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las marcas."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return { brands, isLoading, error };
}

export function useCarModels(brandId: string | null) {
  const [models, setModels] = useState<CarModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!brandId) {
        setModels([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        const { data, error: queryError } = await supabase
          .from("car_models")
          .select("*")
          .eq("brand_id", brandId)
          .eq("is_active", true)
          .order("name");

        if (cancelled) return;

        if (queryError) {
          setModels([]);
          setError(queryError.message);
          return;
        }

        setModels(data ?? []);
      } catch (err: unknown) {
        if (cancelled) return;

        setModels([]);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los modelos."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [brandId]);

  return { models, isLoading, error };
}

export function useCarYears(modelId: string | null) {
  const [years, setYears] = useState<CarModelYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!modelId) {
        setYears([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        const { data, error: queryError } = await supabase
          .from("car_model_years")
          .select("*")
          .eq("model_id", modelId)
          .eq("is_active", true)
          .order("year", { ascending: false })
          .order("trim_name", { ascending: true });

        if (cancelled) return;

        if (queryError) {
          setYears([]);
          setError(queryError.message);
          return;
        }

        setYears(data ?? []);
      } catch (err: unknown) {
        if (cancelled) return;

        setYears([]);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los años y versiones."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [modelId]);

  return { years, isLoading, error };
}

// ─── User garage ─────────────────────────────────────────────────

export function useUserCars(userId: string | null) {
  const [cars, setCars] = useState<UserCarWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!userId) {
      setCars([]);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error: queryError } = await supabase
        .from("user_cars")
        .select(`
          *,
          car_model_years (
            *,
            car_models (
              *,
              car_brands (*)
            )
          )
        `)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("is_favorite", { ascending: false });

      if (queryError) {
        setCars([]);
        setError(queryError.message);
        console.error("useUserCars:", queryError.message);
        return;
      }

      setCars((data as unknown as UserCarWithDetails[]) ?? []);
    } catch (err: unknown) {
      setCars([]);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los vehículos."
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchCars();
  }, [fetchCars]);

  const addCar = async (payload: TablesInsert<"user_cars">) => {
    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("user_cars")
      .insert(payload);

    if (!insertError) {
      await fetchCars();
    }

    return { error: insertError };
  };

  const removeCar = async (carId: string) => {
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("user_cars")
      .delete()
      .eq("id", carId);

    if (!deleteError) {
      setCars((previous) =>
        previous.filter((car) => car.id !== carId)
      );
    }

    return { error: deleteError };
  };

  const toggleFavorite = async (
    carId: string,
    current: boolean
  ) => {
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("user_cars")
      .update({ is_favorite: !current })
      .eq("id", carId);

    if (!updateError) {
      await fetchCars();
    }

    return { error: updateError };
  };

  return {
    cars,
    isLoading,
    error,
    addCar,
    removeCar,
    toggleFavorite,
    refetch: fetchCars,
  };
}
