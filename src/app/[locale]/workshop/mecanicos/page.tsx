"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon } from "@phosphor-icons/react";
import type { Tables } from "@/types/database";

type ProfileRow  = Tables<"profiles">;
type WorkshopRow = Tables<"workshops">;

export default function MecanicosPage() {
  const { profile }                   = useAuthStore();
  const [mechanics, setMechanics]     = useState<ProfileRow[]>([]);
  const [countMap,  setCountMap]      = useState<Record<string, number>>({});
  const [workshop,  setWorkshop]      = useState<WorkshopRow | null>(null);
  const [isLoading, setIsLoading]     = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    const run = async () => {
      const supabase = createClient();

      // Workshops for this owner
      const { data: wsData, error: wsError } = await supabase
        .from("workshops")
        .select("*")
        .eq("owner_id", profile.id);

      if (wsError) { console.error(wsError); setIsLoading(false); return; }

      const workshops = (wsData as WorkshopRow[]) ?? [];
      if (!workshops.length) { setIsLoading(false); return; }

      const currentWorkshop = workshops[0];
      // ✅ cast explícito — evita que TS infiera {}
      setWorkshop(currentWorkshop as WorkshopRow);

      // Mechanics
      const { data: mechData, error: mechError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "mechanic");

      if (mechError) { console.error(mechError); setIsLoading(false); return; }

      setMechanics((mechData as ProfileRow[]) ?? []);

      // Appointment count per mechanic
      const { data: aptData, error: aptError } = await supabase
        .from("appointments")
        .select("mechanic_id")
        .eq("workshop_id", currentWorkshop.id)
        .not("mechanic_id", "is", null);

      if (aptError) { console.error(aptError); setIsLoading(false); return; }

      type AptRow = { mechanic_id: string | null };
      const map: Record<string, number> = {};
      ((aptData as AptRow[]) ?? []).forEach((a) => {
        if (a.mechanic_id) map[a.mechanic_id] = (map[a.mechanic_id] ?? 0) + 1;
      });

      setCountMap(map);
      setIsLoading(false);
    };

    run();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mechanics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Team members for {workshop?.name ?? "your workshop"}.
        </p>
      </div>

      {!mechanics.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <UserIcon className="size-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No mechanics assigned yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {mechanics.map((m) => {
            const initials = (m.full_name ?? "M")
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <Card key={m.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="size-12">
                    <AvatarImage src={m.avatar_url ?? ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {m.full_name ?? "Mechanic"}
                    </p>
                    {m.phone && (
                      <p className="text-xs text-muted-foreground">{m.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {countMap[m.id] ?? 0} services
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}