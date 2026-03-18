import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import { redeemPoints } from "@/lib/loyalty/engine";

const RedeemSchema = z.object({
  points:      z.number().int().positive().max(10_000),
  description: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(["client", "super_admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = RedeemSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const result = await redeemPoints(
    user!.id,
    parsed.data.points
    // description se ignora — engine usa descripción fija
  );

  if (!result.success) return err("Insufficient points", 400);

  return ok(result);
}