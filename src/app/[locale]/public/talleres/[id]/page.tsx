import { getWorkshopById } from "@/lib/supabase/workshops";
import { WorkshopMap } from "@/components/maps/WorkshopMap";
import { WhatsAppFAB } from "@/components/layout/WhatsAppFAB";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPinIcon,
  StarIcon,
  ArrowLeftIcon,
  WrenchIcon,
  CalendarIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Workshop, WorkshopSchedule } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const workshop = (await getWorkshopById(id)) as Workshop | null;
  return {
    title:       workshop?.name ?? "Workshop",
    description: workshop?.address ?? undefined,
  };
}

const DAY_LABELS: Record<string, string> = {
  monday:    "Mon",
  tuesday:   "Tue",
  wednesday: "Wed",
  thursday:  "Thu",
  friday:    "Fri",
  saturday:  "Sat",
  sunday:    "Sun",
};

export default async function WorkshopPublicPage({ params }: Params) {
  const { id } = await params;
  const workshop = (await getWorkshopById(id)) as Workshop | null;
  if (!workshop) notFound();

  const rating = workshop.rating ?? 0;
  const schedule = workshop.schedule as WorkshopSchedule | null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 flex flex-col gap-8">
      {/* Back */}
      <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
        <Link href="/public/talleres">
          <ArrowLeftIcon className="size-4" />
          All workshops
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {workshop.name}
          </h1>

          {workshop.address && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
              <MapPinIcon className="size-4 shrink-0" />
              {workshop.address}
              {workshop.city && `, ${workshop.city}`}
            </p>
          )}

          {rating > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  weight={i < Math.round(rating) ? "fill" : "regular"}
                  className={`size-4 ${
                    i < Math.round(rating)
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="text-sm font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <Button asChild>
          <Link href={`/public/cotizador?workshop=${workshop.id}`}>
            <CalendarIcon className="size-4" />
            Book now
          </Link>
        </Button>
      </div>

      {/* Map */}
      {workshop.lat && workshop.lng && (
        <WorkshopMap
          workshops={[workshop]}
          selectedId={workshop.id}
          height="300px"
        />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Schedule */}
        {schedule && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y">
                {Object.entries(DAY_LABELS).map(([day, label]) => {
                  const slot = schedule[day as keyof WorkshopSchedule];
                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between py-2"
                    >
                      <p className="text-sm">{label}</p>

                      {slot?.enabled ? (
                        <p className="text-sm text-muted-foreground">
                          {slot.open} – {slot.close}
                        </p>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Closed
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Book CTA card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <WrenchIcon weight="fill" className="size-10 text-primary" />

            <div>
              <p className="font-semibold">Ready to book?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Get an instant quote for your vehicle and book a slot.
              </p>
            </div>

            <Button className="w-full" asChild>
              <Link href={`/public/cotizador?workshop=${workshop.id}`}>
                Get a quote & book
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {workshop.phone_wa && (
        <WhatsAppFAB
          phoneNumber={workshop.phone_wa}
          message={`Hi! I'd like to book a service at ${workshop.name}.`}
        />
      )}
    </div>
  );
}