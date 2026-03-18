import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import { sendPushNotification, PushTemplates } from "@/lib/notifications/push";
import type { PushSubscription, PushPayload } from "@/lib/notifications/push";
import webpush from "web-push";

const SubscriptionSchema = z.object({
  userId: z.string().uuid(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

const SendSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
  template: z.enum([
    "appointmentConfirmed",
    "appointmentReminder",
    "appointmentReady",
    "pointsEarned",
  ]),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  // ✅ Configuración VAPID en runtime
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return err("VAPID keys are not set in environment variables", 500);
  }

  webpush.setVapidDetails(
    `mailto:zyra@zyraauto.com`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();

  // Route: send notification
  if ("template" in body) {
    const parsed = SendSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const { subscription, template, payload } = parsed.data;

    let pushPayload: PushPayload;

    switch (template) {
      case "appointmentConfirmed":
        pushPayload = PushTemplates.appointmentConfirmed(
          (payload?.workshopName as string) ?? "the workshop"
        );
        break;
      case "appointmentReminder":
        pushPayload = PushTemplates.appointmentReminder(
          (payload?.serviceName as string) ?? "your service"
        );
        break;
      case "appointmentReady":
        pushPayload = PushTemplates.appointmentReady();
        break;
      case "pointsEarned":
        pushPayload = PushTemplates.pointsEarned(
          (payload?.points as number) ?? 0
        );
        break;
      default:
        return err("Unknown template", 400);
    }

    const sent = await sendPushNotification(
      subscription as PushSubscription,
      pushPayload
    );

    if (!sent) return err("Failed to send push notification", 500);
    return ok({ sent: true });
  }

  // Route: register subscription
  const parsed = SubscriptionSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  if (parsed.data.userId !== user!.id) return err("Forbidden", 403);

  return ok({ registered: true });
}