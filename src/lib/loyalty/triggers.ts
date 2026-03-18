import { awardPoints } from "./engine";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type PromotionRow = Tables<"promotions">;

export async function onServiceCompleted(
  appointmentId: string,
  clientId: string
): Promise<void> {
  await awardPoints({
    userId:        clientId,
    eventType:     "service_completed",
    appointmentId,
    description:   "Points earned for completed service",
  });
}

export async function onReferralConverted(referrerId: string): Promise<void> {
  await awardPoints({
    userId:      referrerId,
    eventType:   "referral",
    description: "Referral bonus — friend completed first service",
  });
}

export async function onBirthday(userId: string): Promise<void> {
  await awardPoints({
    userId,
    eventType:   "birthday",
    description: "Happy birthday bonus points 🎂",
  });
}

export async function checkAndApplyPromotions(
  userId:        string,
  appointmentId: string
): Promise<{ applied: boolean; discount: number }> {
  const supabase = await createClient();
  const today    = new Date().toISOString().split("T")[0];

  const { data: promosData } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .lte("valid_from", today)
    .gte("valid_until", today);

  const promos = (promosData as PromotionRow[]) ?? [];
  if (!promos.length) return { applied: false, discount: 0 };

  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("client_id", userId)
    .eq("status", "completed");

  let totalDiscount = 0;
  let applied       = false;

  for (const promo of promos) {
    const tv = promo.trigger_value as Record<string, number> | null;
    if (
      promo.trigger_type === "service_count" &&
      tv?.count &&
      (count ?? 0) >= tv.count
    ) {
      totalDiscount += Number(promo.discount_value ?? 0);
      applied        = true;
      await awardPoints({
        userId,
        eventType:      "promo_applied",
        appointmentId,
        pointsOverride: 0,
        description:    `Promo applied: ${promo.title}`,
      });
    }
  }

  return { applied, discount: totalDiscount };
}