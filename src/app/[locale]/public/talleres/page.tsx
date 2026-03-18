import { getWorkshops } from "@/lib/supabase/workshops";
import { WorkshopMap } from "@/components/maps/WorkshopMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workshops",
  description: "Find certified workshops near you.",
};

export default async function TalleresPage() {
  const workshops = await getWorkshops();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find a workshop</h1>
        <p className="text-muted-foreground mt-2">
          {workshops.length} certified workshop{workshops.length !== 1 ? "s" : ""} available.
        </p>
      </div>

      {/* Map */}
      <WorkshopMap workshops={workshops} height="380px" />

      {/* Workshop list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workshops.map((w) => (
          <Card key={w.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{w.name}</p>
                {w.rating !== null && w.rating > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <StarIcon weight="fill" className="size-3.5 text-yellow-500" />
                    <span className="text-sm font-medium">{w.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {w.address && (
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <MapPinIcon className="size-3.5 shrink-0 mt-0.5" />
                  {w.address}
                </p>
              )}

              {w.phone_wa && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <PhoneIcon className="size-3.5 shrink-0" />
                  {w.phone_wa}
                </p>
              )}

              <Button size="sm" variant="outline" className="w-full mt-1" asChild>
                <Link href={`/public/talleres/${w.id}`}>
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