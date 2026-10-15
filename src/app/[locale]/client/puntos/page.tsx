import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Points" };

// Tipo explícito de la fila de perfil
type ProfileRow = {
  id: string;
  loyalty_points: number;
};

export default async function PointsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Traer perfil del usuario
  const profileResult = await supabase
    .from("profiles")
    .select("loyalty_points")
    .eq("id", user.id)
    .single();

  // Convertir data a tipo explícito
  const profile: ProfileRow | null = profileResult.data as ProfileRow | null;

  // Si no hay perfil, asumir 0 puntos
  const balance = profile?.loyalty_points ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Points</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Earn points on every service and redeem them for discounts.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current balance</p>
            <p className="text-4xl font-bold mt-1">{balance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">loyalty points</p>
          </div>
          <div className="flex items-center justify-center size-16 rounded-full bg-primary/10">
            <StarIcon weight="fill" className="size-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to earn points</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {[
            { label: "Complete a service", pts: "+100" },
            { label: "Refer a friend", pts: "+200" },
            { label: "Birthday bonus", pts: "+50" },
            { label: "Redeem for discount", pts: "−pts" },
          ].map(({ label, pts }) => (
            <div
              key={label}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <p className="text-xs">{label}</p>
              <Badge variant="secondary" className="font-mono text-[11px]">
                {pts}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Points history</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          <p className="text-sm text-muted-foreground text-center py-6">
            No activity yet. Complete a service to earn your first points!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}