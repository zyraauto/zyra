import { brandLogoUrl } from "@/lib/brandLogo";
import type { UserCarWithDetails } from "@/types";

export function carInfo(car: UserCarWithDetails) {
  const modelYear = car.car_model_years;
  const model = modelYear?.car_models ?? null;
  const brand = model?.car_brands ?? null;

  const engine =
    modelYear?.engine_description ??
    (modelYear?.engine_cc ? `${modelYear.engine_cc} cc` : null);

  return {
    brandName: brand?.name ?? car.brand_name ?? "",
    modelName: model?.name ?? car.model_name ?? "",
    year: modelYear?.year ?? car.year_manual ?? null,
    engine,
    transmission: car.transmission ?? modelYear?.transmission ?? null,
    fuelType: car.fuel_type ?? modelYear?.fuel_type ?? null,
    brandLogo: brand ? brandLogoUrl(brand) : null,
  };
}