import type { AppointmentWithDetails } from "@/types";

// Zona horaria de los talleres (centro de México, sin horario de verano)
export const SHOP_TIMEZONE = "America/Mexico_City";
export const SHOP_UTC_OFFSET = "-06:00";

export function customerName(apt: AppointmentWithDetails): string {
  const c = apt.customers;
  const name = c ? [c.first_name, c.last_name].filter(Boolean).join(" ") : "";
  return name || "Client";
}

export function vehicleLabel(apt: AppointmentWithDetails): string | null {
  const v = apt.customer_vehicles;
  if (!v) return null;
  const label = [v.brand_name, v.model_name, v.year].filter(Boolean).join(" ");
  return label || null;
}

// Hora local del taller (0-23) de una fecha ISO, sin depender de la zona del servidor
export function hourInShop(iso: string): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: SHOP_TIMEZONE,
    }).format(new Date(iso))
  );
}