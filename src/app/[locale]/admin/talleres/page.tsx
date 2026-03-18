import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Workshops" };

type WorkshopWithOwner = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone_wa: string | null;
  rating: number | null;
  is_active: boolean;
  created_at: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
  } | null;
};

export default async function AdminTalleresPage() {
  const supabase = await createClient();

  // 🔐 Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // 📦 Query tipado
  const { data, error } = await supabase
    .from("workshops")
    .select(`
      id,
      name,
      slug,
      address,
      phone_wa,
      rating,
      is_active,
      created_at,
      profiles:profiles!workshops_owner_id_fkey (
        full_name,
        phone
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const list = (data ?? []) as WorkshopWithOwner[];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workshops</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {list.length} workshop{list.length !== 1 ? "s" : ""} registered.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((w) => (
          <Card key={w.id}>
            <CardContent className="p-5 flex flex-col gap-3">

              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{w.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    /{w.slug}
                  </p>
                </div>

                <Badge variant={w.is_active ? "default" : "secondary"}>
                  {w.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-1.5">

                {w.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPinIcon className="size-3 shrink-0" />
                    {w.address}
                  </p>
                )}

                {w.phone_wa && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <PhoneIcon className="size-3 shrink-0" />
                    {w.phone_wa}
                  </p>
                )}

                {(w.rating ?? 0) > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <StarIcon
                      weight="fill"
                      className="size-3 shrink-0 text-yellow-500"
                    />
                    {w.rating?.toFixed(1)}
                  </p>
                )}

              </div>

              {/* Owner */}
              {w.profiles && (
                <p className="text-xs text-muted-foreground">
                  Owner:{" "}
                  <span className="font-medium">
                    {w.profiles.full_name ?? "—"}
                  </span>
                </p>
              )}

              {/* Action */}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/talleres/${w.id}`}>
                  View details
                  <ArrowRightIcon className="size-3" />
                </Link>
              </Button>

            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}