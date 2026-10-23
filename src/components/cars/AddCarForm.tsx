"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCarBrands, useCarModels, useUserCars } from "@/hooks/useCars";
import { useAuthStore } from "@/stores/auth.store";

const CURRENT_YEAR = new Date().getFullYear();

const AddCarSchema = z.object({
  brand_id: z.string().uuid("Select a brand"),
  model_id: z.string().uuid("Select a model"),
  year: z.coerce
    .number()
    .int()
    .min(1950, "Enter a valid year")
    .max(CURRENT_YEAR + 1, "Enter a valid year"),
  nickname: z.string().max(50).optional(),
  plate:    z.string().max(20).optional(),
  mileage:  z.coerce.number().int().min(0).optional(),
});

type AddCarValues = z.infer<typeof AddCarSchema>;

// ✅ Resolver manual compatible con Zod v4
function zodResolver<T extends z.ZodType>(schema: T) {
  return async (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (path) errors[path] = { type: "validation", message: issue.message };
    }
    return { values: {}, errors };
  };
}

type Props = {
  onSuccess?: () => void;
};

export function AddCarForm({ onSuccess }: Props) {
  const { profile } = useAuthStore();
  const { addCar }  = useUserCars(profile?.id ?? null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCarValues>({
    resolver: zodResolver(AddCarSchema),
  });

  const brandId = watch("brand_id");

  const { brands, isLoading: loadingBrands } = useCarBrands();
  const { models, isLoading: loadingModels } = useCarModels(brandId ?? null);

  // Reset model when brand changes
  useEffect(() => {
    const run = async () => {
      setValue("model_id", "" as never);
    };
    run();
  }, [brandId, setValue]);

  const onSubmit = async (values: AddCarValues) => {
    if (!profile?.id) return;

    const brand = brands.find((b) => b.id === values.brand_id);
    const model = models.find((m) => m.id === values.model_id);

    const { error } = await addCar({
      user_id:      profile.id,
      brand_name:   brand?.name ?? null,
      model_name:   model?.name ?? null,
      year_manual:  values.year,
      vehicle_type: model?.vehicle_type,
      nickname:     values.nickname || null,
      plate:        values.plate || null,
      mileage:      values.mileage ?? null,
      is_favorite:  false,
    });

    if (error) {
      toast.error("Failed to add car. Please try again.");
      return;
    }

    toast.success("Car added to your garage!");
    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Brand */}
      <div className="flex flex-col gap-2">
        <Label>Brand</Label>
        <Select
          disabled={loadingBrands}
          onValueChange={(v) => setValue("brand_id", v)}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={loadingBrands ? "Loading…" : "Select brand"}
            />
          </SelectTrigger>
          <SelectContent>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.brand_id && (
          <p className="text-xs text-destructive">{errors.brand_id.message}</p>
        )}
      </div>

      {/* Model */}
      <div className="flex flex-col gap-2">
        <Label>Model</Label>
        <Select
          disabled={!brandId || loadingModels}
          onValueChange={(v) => setValue("model_id", v)}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !brandId      ? "Select brand first" :
                loadingModels ? "Loading…"           :
                "Select model"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.model_id && (
          <p className="text-xs text-destructive">{errors.model_id.message}</p>
        )}
      </div>

      {/* Year */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="year">Year</Label>
        <Input
          id="year"
          type="number"
          placeholder={String(CURRENT_YEAR - 5)}
          {...register("year")}
        />
        {errors.year && (
          <p className="text-xs text-destructive">{errors.year.message}</p>
        )}
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nickname">
            Nickname
            <span className="text-muted-foreground ml-1 text-xs">(optional)</span>
          </Label>
          <Input
            id="nickname"
            placeholder="My daily driver"
            {...register("nickname")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="plate">
            Plate
            <span className="text-muted-foreground ml-1 text-xs">(optional)</span>
          </Label>
          <Input
            id="plate"
            placeholder="ABC-1234"
            {...register("plate")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="mileage">
          Current mileage
          <span className="text-muted-foreground ml-1 text-xs">(optional)</span>
        </Label>
        <Input
          id="mileage"
          type="number"
          placeholder="50000"
          {...register("mileage")}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding car…" : "Add to garage"}
      </Button>
    </form>
  );
}