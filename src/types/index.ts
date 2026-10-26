import type { Tables } from "./database";

// ─── Domain aliases ───────────────────────────────────────────────
export type Profile      = Tables<"profiles">;
export type Workshop     = Tables<"workshops">;
export type CarBrand     = Tables<"car_brands">;
export type CarModel     = Tables<"car_models">;
export type CarModelYear = Tables<"car_model_years">;
export type UserCar      = Tables<"user_cars">;
export type Service      = Tables<"services">;
export type ServicePrice = Tables<"service_prices">;
export type Appointment  = Tables<"appointments">;
export type LoyaltyEvent = Tables<"loyalty_events">;
export type Promotion    = Tables<"promotions">;

/**
 * @deprecated El catálogo de años es car_model_years. Este alias existe solo
 * para que el código viejo compile; usa CarModelYear y borra este alias
 * cuando ya no lo importe nadie.
 */
export type CarYear = CarModelYear;

// ─── Role ─────────────────────────────────────────────────────────
export type UserRole = Profile["role"];

// ─── Workshop (vista pública: sin RFC, correo ni owner_id) ────────
export type PublicWorkshop = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  phone_wa: string | null;
  logo_url: string | null;
  rating: number | null;
  total_reviews: number | null;
  opening_hours: Record<string, unknown> | null;
  accepts_vehicles: (string | number)[] | null;
  schedule: Record<string, unknown> | null;
};

// ─── Enums (mirrors DB checks) ────────────────────────────────────
export type Customer        = Tables<"customers">;
export type CustomerVehicle = Tables<"customer_vehicles">;
export type WorkshopStaff   = Tables<"workshop_staff">;
export type AppointmentStatus = NonNullable<Appointment["status"]>;
export type ServiceCategory   = NonNullable<Service["category"]>;
export type TransmissionType  = NonNullable<CarModelYear["transmission"]>;
export type FuelType          = NonNullable<CarModelYear["fuel_type"]>;
export type LoyaltyEventType  = LoyaltyEvent["event_type"];
export type DiscountType      = Promotion["discount_type"];
export type TriggerType       = Promotion["trigger_type"];

// ─── Composed types (joins frecuentes) ───────────────────────────
export type UserCarWithDetails = UserCar & {
  car_model_years: (CarModelYear & {
    car_models: CarModel & {
      car_brands: CarBrand;
    };
  }) | null;
};

export type AppointmentWithDetails = Appointment & {
  workshops: Pick<PublicWorkshop, "id" | "name" | "address" | "phone_wa"> | null;
  customer_vehicles: CustomerVehicle | null;
  customers: Pick<Customer, "id" | "user_id" | "first_name" | "last_name" | "phone"> | null;
  workshop_staff: Pick<WorkshopStaff, "id" | "first_name" | "last_name"> | null;
};

export type QuoteItem = {
  service: Service;
  price: ServicePrice;
  carYear: CarModelYear;
};

// ─── Workshop schedule shape (stored as JSONB) ────────────────────
export type DaySchedule = {
  open: string;   // "08:00"
  close: string;  // "18:00"
  enabled: boolean;
};

export type WorkshopSchedule = Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  DaySchedule
>;