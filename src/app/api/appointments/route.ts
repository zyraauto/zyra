import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import { getAppointmentsByClient, createAppointment } from "@/lib/supabase/appointments";
import { sendAppointmentConfirmation } from "@/lib/notifications/email";
import { createClient } from "@/lib/supabase/server";

// TODO: implementar en Fase 2
// import { onServiceCompleted, checkAndApplyPromotions } from "@/lib/loyalty/triggers";

const CreateSchema = z.object({
  workshop_id:  z.string().uuid(),
  user_car_id:  z.string().uuid(),
  service_id:   z.string().uuid(),
  price_id:     z.string().uuid(),
  scheduled_at: z.string().datetime().optional(),
  is_immediate: z.boolean().default(false),
  notes:        z.string().max(500).optional(),
});

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const appointments = await getAppointmentsByClient(user!.id);
  return ok(appointments);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(["client", "super_admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const supabase = await createClient();
  const { data: priceRow } = await supabase
    .from("service_prices")
    .select("base_price")
    .eq("id", parsed.data.price_id)
    .single();

  if (!priceRow) return err("Price not found", 404);

  // TODO: aplicar descuentos de promociones en Fase 2
  const finalPrice = Number(priceRow.base_price);

  const appointment = await createAppointment({
    ...parsed.data,
    client_id:   user!.id,
    final_price: finalPrice,
    status:      "pending",
  });

  if (!appointment) return err("Failed to create appointment", 500);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { data: service } = await supabase
    .from("services")
    .select("name")
    .eq("id", parsed.data.service_id)
    .single();

  const { data: workshop } = await supabase
    .from("workshops")
    .select("name")
    .eq("id", parsed.data.workshop_id)
    .single();

  const { data: authUser } = await supabase.auth.getUser();

  if (authUser.user?.email && profile && service && workshop) {
    sendAppointmentConfirmation({
      to:            authUser.user.email,
      clientName:    profile.full_name ?? "Client",
      serviceName:   service.name,
      workshopName:  workshop.name,
      scheduledAt:   parsed.data.scheduled_at ?? new Date().toISOString(),
      appointmentId: appointment.id,
    }).catch(() => {});
  }

  return ok(appointment, 201);
}