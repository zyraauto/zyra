import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL!}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export type PushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type PushPayload = {
  title: string;
  body:  string;
  url?:  string;
  icon?: string;
};

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body:  payload.body,
        url:   payload.url ?? "/",
        icon:  payload.icon ?? "/icons/icon-192x192.png",
      })
    );
    return true;
  } catch {
    return false;
  }
}

// Predefined notification templates
export const PushTemplates = {
  appointmentConfirmed: (workshopName: string): PushPayload => ({
    title: "Appointment confirmed ✅",
    body:  `Your appointment at ${workshopName} is confirmed.`,
    url:   "/client/citas",
  }),

  appointmentReminder: (serviceName: string): PushPayload => ({
    title: "Appointment tomorrow 🔧",
    body:  `Your ${serviceName} is scheduled for tomorrow.`,
    url:   "/client/citas",
  }),

  appointmentReady: (): PushPayload => ({
    title: "Your car is ready 🚗",
    body:  "Service completed. Pick up your vehicle.",
    url:   "/client/citas",
  }),

  pointsEarned: (points: number): PushPayload => ({
    title: "Points earned 🌟",
    body:  `You earned ${points} loyalty points!`,
    url:   "/client/puntos",
  }),
};