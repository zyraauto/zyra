import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type LoyaltyEventInsert = {
  user_id:        string;
  appointment_id?: string;
  event_type:     Tables<"loyalty_events">["event_type"];
  points_delta:   number;
  balance_after:  number;
  description:    string;
};

const POINTS_MAP: Record<string, number> = {
  service_completed: 50,
  referral:          100,
  birthday:          200,
  promo_applied:     0,
};

type AwardPointsInput = {
  userId:         string;
  eventType:      Tables<"loyalty_events">["event_type"];
  appointmentId?: string;
  pointsOverride?: number;
  description:    string;
};

export async function awardPoints({
  userId,
  eventType,
  appointmentId,
  pointsOverride,
  description,
}: AwardPointsInput): Promise<void> {
  const supabase    = await createClient();
  const pointsDelta = pointsOverride ?? POINTS_MAP[eventType ?? ""] ?? 0;

  // Get current balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("loyalty_points")
    .eq("id", userId)
    .single();

  const currentPoints  = profile?.loyalty_points ?? 0;
  const balanceAfter   = currentPoints + pointsDelta;

  // Insert loyalty event
  const event: LoyaltyEventInsert = {
    user_id:       userId,
    event_type:    eventType,
    points_delta:  pointsDelta,
    balance_after: balanceAfter,
    description,
  };

  if (appointmentId) event.appointment_id = appointmentId;

  await supabase.from("loyalty_events").insert(event);

  // Update profile points
  if (pointsDelta !== 0) {
    await supabase
      .from("profiles")
      .update({ loyalty_points: balanceAfter })
      .eq("id", userId);
  }
}

export async function getPointsHistory(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loyalty_events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function redeemPoints(
  userId:      string,
  pointsToUse: number
): Promise<{ success: boolean; newBalance: number }> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("loyalty_points")
    .eq("id", userId)
    .single();

  const current = profile?.loyalty_points ?? 0;
  if (current < pointsToUse) return { success: false, newBalance: current };

  const newBalance = current - pointsToUse;

  await supabase
    .from("profiles")
    .update({ loyalty_points: newBalance })
    .eq("id", userId);

  await supabase.from("loyalty_events").insert({
    user_id:       userId,
    event_type:    "promo_applied",
    points_delta:  -pointsToUse,
    balance_after: newBalance,
    description:   `Redeemed ${pointsToUse} points`,
  });

  return { success: true, newBalance };
}
