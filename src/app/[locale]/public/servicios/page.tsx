import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  WrenchIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Metadata } from "next";
import type { Service, ServiceCategory } from "@/types";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore all available car services and get an instant quote.",
};

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  oil: "Oil change",
  brakes: "Brakes",
  tuning: "Tuning",
  other: "Other",
};

export default async function ServiciosPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const services = (data ?? []) as Service[];

  // Agrupar por categoría
  const byCategory = (Object.keys(CATEGORY_LABELS) as ServiceCategory[]).reduce<
    Record<ServiceCategory, Service[]>
  >((acc, cat) => {
    acc[cat] = services.filter((s) => s.category === cat);
    return acc;
  }, { oil: [], brakes: [], tuning: [], other: [] });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Our services</h1>
        <p className="text-muted-foreground mt-2">
          {services.length} service{services.length !== 1 ? "s" : ""} available.
          Select your car to see exact pricing.
        </p>
      </div>

      <Tabs defaultValue="oil">
        <TabsList>
          {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
              {byCategory[cat].length > 0 && (
                <span className="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5">
                  {byCategory[cat].length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-6">
            {byCategory[cat].length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p className="text-sm">No services in this category.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {byCategory[cat].map((svc) => (
                  <Link
                    key={svc.id}
                    href={`/public/servicios/${svc.id}`}
                    className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                      <WrenchIcon className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{svc.name}</p>
                      {svc.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {svc.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {svc.duration_minutes && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {svc.duration_minutes} min
                          </span>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {CATEGORY_LABELS[svc.category as ServiceCategory] ?? svc.category}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRightIcon className="size-4 text-muted-foreground shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* CTA */}
      <div className="text-center py-6">
        <p className="text-muted-foreground text-sm mb-3">
          Want to know the exact price for your car?
        </p>
        <Button asChild>
          <Link href="/public/cotizador">
            Get an instant quote
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}