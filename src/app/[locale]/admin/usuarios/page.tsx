import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { Metadata } from "next";
import type { Profile, UserRole } from "@/types";

export const metadata: Metadata = { title: "Users" };

const ROLE_BADGE: Record<
  UserRole,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  super_admin:    { label: "Super Admin",    variant: "destructive" },
  workshop_admin: { label: "Workshop Admin", variant: "default"     },
  mechanic:       { label: "Mechanic",       variant: "secondary"   },
  client:         { label: "Client",         variant: "outline"     },
  supplier:       { label: "Supplier",       variant: "secondary"   },
  visitor:        { label: "Visitor",        variant: "outline"     },
};

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  // 🔐 Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // 📦 Query
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const list = (data ?? []) as Profile[];

  // 📊 Role counts tipado
  const roleCounts = list.reduce<Record<UserRole, number>>(
    (acc, p) => {
      acc[p.role] = (acc[p.role] ?? 0) + 1;
      return acc;
    },
    {} as Record<UserRole, number>
  );

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {list.length} user{list.length !== 1 ? "s" : ""} registered.
        </p>
      </div>

      {/* Role summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(roleCounts).map(([role, count]) => {
          const cfg = ROLE_BADGE[role as UserRole];

          return (
            <Badge key={role} variant={cfg?.variant ?? "outline"}>
              {cfg?.label ?? role}: {count}
            </Badge>
          );
        })}
      </div>

      {/* User list */}
      <div className="flex flex-col gap-3">
        {list.map((profile) => {
          const badge = ROLE_BADGE[profile.role];

          const initials = (profile.full_name ?? "U")
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return (
            <Card key={profile.id}>
              <CardContent className="p-4 flex items-center gap-4">

                {/* Avatar */}
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0 grid sm:grid-cols-3 gap-1">

                  <div>
                    <p className="text-sm font-medium truncate">
                      {profile.full_name ?? "No name"}
                    </p>

                    {profile.phone && (
                      <p className="text-xs text-muted-foreground">
                        {profile.phone}
                      </p>
                    )}
                  </div>

                  <div className="hidden sm:block">
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {profile.id.slice(0, 16)}…
                    </p>

                    {profile.created_at && (
                      <p className="text-xs text-muted-foreground">
                        Joined{" "}
                        {format(
                          new Date(profile.created_at),
                          "MMM d, yyyy"
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={badge.variant} className="text-[10px]">
                      {badge.label}
                    </Badge>

                    {(profile.loyalty_points ?? 0) > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ⭐ {profile.loyalty_points}
                      </span>
                    )}
                  </div>

                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}