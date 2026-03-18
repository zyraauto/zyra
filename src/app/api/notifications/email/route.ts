import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendWelcomeEmail,
} from "@/lib/notifications/email";

const TEMPLATES = [
  "appointment_confirmation",
  "appointment_reminder",
  "appointment_cancellation",
  "welcome",
] as const;

const EmailSchema = z.discriminatedUnion("template", [
  z.object({
    template:      z.literal("appointment_confirmation"),
    to:            z.string().email(),
    clientName:    z.string(),
    serviceName:   z.string(),
    workshopName:  z.string(),
    scheduledAt:   z.string().datetime(),
    appointmentId: z.string().uuid(),
  }),
  z.object({
    template:      z.literal("appointment_reminder"),
    to:            z.string().email(),
    clientName:    z.string(),
    serviceName:   z.string(),
    workshopName:  z.string(),
    scheduledAt:   z.string().datetime(),
    appointmentId: z.string().uuid(),
  }),
  z.object({
    template:    z.literal("appointment_cancellation"),
    to:          z.string().email(),
    clientName:  z.string(),
    serviceName: z.string(),
  }),
  z.object({
    template: z.literal("welcome"),
    to:       z.string().email(),
    name:     z.string(),
  }),
]);

export async function POST(req: NextRequest) {
  // Only internal services or super_admin can trigger emails directly
  const { error } = await requireAuth(["super_admin", "workshop_admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = EmailSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  let sent = false;

  switch (parsed.data.template) {
    case "appointment_confirmation":
      sent = await sendAppointmentConfirmation(parsed.data);
      break;
    case "appointment_reminder":
      sent = await sendAppointmentReminder(parsed.data);
      break;
    case "appointment_cancellation":
      sent = await sendAppointmentCancellation(parsed.data);
      break;
    case "welcome":
      sent = await sendWelcomeEmail(parsed.data);
      break;
  }

  if (!sent) return err("Failed to send email", 500);
  return ok({ sent: true });
}