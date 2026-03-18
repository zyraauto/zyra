import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPointsHistory } from "@/lib/loyalty/engine";
import { PointsBar } from "@/components/loyalty/PointsBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarIcon, ArrowUpIcon, ArrowDownIcon } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import type { Metadata } from "next";
import type { LoyaltyEvent } from "@/types";

export const metadata: Metadata = { title: "My Points" };

const EVENT_LABEL: Record<
  NonNullable<LoyaltyEvent["event_type"]>,
  string
> = {
  service_completed: "Service completed",
  referral: "Referral bonus",
  promo_applied: "Promotion applied",
  birthday: "Birthday bonus",
};


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

  // Traer perfil y historial en paralelo
  const [profileResult, historyData] = await Promise.all([
    supabase
      .from("profiles")
      .select("loyalty_points")
      .eq("id", user.id)
      .single(),
    getPointsHistory(user.id),
  ]);

  // Convertir data a tipo explícito
  const profile: ProfileRow | null = profileResult.data as ProfileRow | null;

  // Si no hay perfil, asumir 0 puntos
  const balance = profile?.loyalty_points ?? 0;

  const history: LoyaltyEvent[] = historyData ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Points</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Earn points on every service and redeem them for discounts.
        </p>
      </div>

      <PointsBar />

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
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No activity yet. Complete a service to earn your first points!
            </p>
          ) : (
            history.map((event) => {
              const isGain = event.points_delta > 0;
              const type = event.event_type ?? "service_completed";

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-3 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center size-8 rounded-full ${
                        isGain
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {isGain ? (
                        <ArrowUpIcon weight="bold" className="size-4" />
                      ) : (
                        <ArrowDownIcon weight="bold" className="size-4" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {EVENT_LABEL[type]}
                      </p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {event.created_at && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.created_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`font-bold text-sm ${
                        isGain ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isGain ? "+" : ""}
                      {event.points_delta}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.balance_after ?? 0} total
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}