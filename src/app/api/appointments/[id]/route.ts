import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "@/lib/supabase/appointments";
import { onServiceCompleted } from "@/lib/loyalty/triggers";

const UpdateSchema = z.object({
  status: z.enum(["confirmed", "in_progress", "completed", "cancelled"]),
  mechanic_notes: z.string().max(1000).optional(),
  final_price: z.number().positive().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const appointment = await getAppointmentById(id);
  if (!appointment) return err("Appointment not found", 404);

  return ok(appointment);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth([
    "mechanic", "workshop_admin", "super_admin",
  ]);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const appointment = await getAppointmentById(id);
  if (!appointment) return err("Appointment not found", 404);

  const extra: Record<string, unknown> = {};
  if (parsed.data.mechanic_notes) extra.mechanic_notes = parsed.data.mechanic_notes;
  if (parsed.data.final_price)    extra.final_price    = parsed.data.final_price;
  if (parsed.data.status === "completed") {
    extra.completed_at = new Date().toISOString();
  }

  const updated = await updateAppointmentStatus(id, parsed.data.status, extra as never);
  if (!updated) return err("Failed to update appointment", 500);

  // Award loyalty points on completion
  if (parsed.data.status === "completed" && appointment.client_id) {
    onServiceCompleted(id, appointment.client_id).catch(() => {});
  }

  return ok({ id, status: parsed.data.status });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const appointment = await getAppointmentById(id);
  if (!appointment) return err("Appointment not found", 404);

  // Only client owner or admin can cancel
  if (
    appointment.client_id !== user!.id
  ) {
    return err("Forbidden", 403);
  }

  const updated = await updateAppointmentStatus(id, "cancelled");
  if (!updated) return err("Failed to cancel appointment", 500);

  return ok({ id, status: "cancelled" });
}