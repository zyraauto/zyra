import { ok, err, requireAuth } from "@/lib/api";
import { getPointsHistory } from "@/lib/loyalty/engine";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("loyalty_points")
    .eq("id", user!.id)
    .single();

  if (!profile) return err("Profile not found", 404);

  const history = await getPointsHistory(user!.id);

  return ok({
    balance: profile.loyalty_points,
    history,
  });
}