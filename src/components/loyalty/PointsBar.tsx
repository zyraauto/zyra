"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StarIcon, TrophyIcon } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth.store";

const TIERS = [
  { label: "Bronze", min: 0,    max: 499,  color: "text-orange-600"  },
  { label: "Silver", min: 500,  max: 1499, color: "text-slate-400"   },
  { label: "Gold",   min: 1500, max: 3999, color: "text-yellow-500"  },
  { label: "Platinum", min: 4000, max: Infinity, color: "text-cyan-400" },
] as const;

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0];
}

function getProgress(points: number) {
  const tier = getTier(points);
  if (tier.max === Infinity) return 100;
  const range = tier.max - tier.min + 1;
  return Math.round(((points - tier.min) / range) * 100);
}

export function PointsBar() {
  const { profile } = useAuthStore();
  const [points,    setPoints]    = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    const supabase = createClient();

    supabase
      .from("profiles")
      .select("loyalty_points")
      .eq("id", profile.id)
      .single()
      .then(({ data }) => {
        setPoints(data?.loyalty_points ?? 0);
        setIsLoading(false);
      });
  }, [profile?.id]);

  if (isLoading) {
    return <Skeleton className="h-20 rounded-xl" />;
  }

  const pts  = points ?? 0;
  const tier = getTier(pts);
  const prog = getProgress(pts);
  const next = TIERS.find((t) => t.min > pts);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophyIcon weight="fill" className={`size-5 ${tier.color}`} />
          <span className={`text-sm font-semibold ${tier.color}`}>
            {tier.label}
          </span>
        </div>
        <Badge variant="secondary" className="gap-1 font-mono">
          <StarIcon weight="fill" className="size-3 text-yellow-500" />
          {pts.toLocaleString()} pts
        </Badge>
      </div>

      {/* Progress bar */}
      <Progress value={prog} className="h-2" />

      {/* Footer */}
      <p className="text-xs text-muted-foreground">
        {next
          ? `${(next.min - pts).toLocaleString()} points to reach ${next.label}`
          : "You've reached the highest tier! 🎉"}
      </p>
    </div>
  );
}