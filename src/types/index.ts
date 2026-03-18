import type { Tables } from "./database";

// ─── Domain aliases ───────────────────────────────────────────────
export type Profile      = Tables<"profiles">;
export type Workshop     = Tables<"workshops">;
export type CarBrand     = Tables<"car_brands">;
export type CarModel     = Tables<"car_models">;
export type CarYear      = Tables<"car_years">;
export type UserCar      = Tables<"user_cars">;
export type Service      = Tables<"services">;
export type ServicePrice = Tables<"service_prices">;
export type Appointment  = Tables<"appointments">;
export type LoyaltyEvent = Tables<"loyalty_events">;
export type Promotion    = Tables<"promotions">;

// ─── Role ─────────────────────────────────────────────────────────
export type UserRole = Profile["role"];

// ─── Enums (mirrors DB checks) ────────────────────────────────────
export type AppointmentStatus = NonNullable<Appointment["status"]>;
export type ServiceCategory   = NonNullable<Service["category"]>;
export type BodyType          = NonNullable<CarModel["body_type"]>;
export type TransmissionType  = NonNullable<CarYear["transmission"]>;
export type FuelType          = NonNullable<CarYear["fuel_type"]>;
export type LoyaltyEventType  = LoyaltyEvent["event_type"];
export type DiscountType      = Promotion["discount_type"];
export type TriggerType       = Promotion["trigger_type"];

// ─── Composed types (joins frecuentes) ───────────────────────────
export type UserCarWithDetails = UserCar & {
  car_years: CarYear & {
    car_models: CarModel & {
      car_brands: CarBrand;
    };
  };
};

export type AppointmentWithDetails = Appointment & {
  workshops: Pick<Workshop, "id" | "name" | "address" | "phone_wa">;
  services: Pick<Service, "id" | "name" | "category" | "duration_minutes">;
  user_cars: UserCarWithDetails | null;
  profiles: Pick<Profile, "id" | "full_name" | "phone"> | null;
};

export type QuoteItem = {
  service: Service;
  price: ServicePrice;
  carYear: CarYear;
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