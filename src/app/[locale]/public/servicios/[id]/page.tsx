import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeftIcon,
  WrenchIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Metadata } from "next";
import type { Service } from "@/types";

type Params = { params: Promise<{ id: string }> };

// Tipos para Supabase
type ServiceRow = Service & { id: string };

type PriceSample = {
  label: string;
  base_price: number;
  parts_included: boolean | null;
};

const notNull = <T,>(v: T | null | undefined): v is T => v != null;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("name, description")
    .eq("id", id)
    .single();

  const service = data as ServiceRow | null;

  return {
    title: service?.name ?? "Service",
    description: service?.description ?? undefined,
  };
}

export default async function ServiceDetailPage({ params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: svc } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  const service = svc as ServiceRow | null;
  if (!service) notFound();

  const { data: prices } = await supabase
    .from("service_prices")
    .select("base_price, parts_included, year_id")
    .eq("service_id", id)
    .order("base_price")
    .limit(6);

  const priceRows = prices ?? [];

  // service_prices.year_id apunta a car_model_years; modelo y marca se resuelven por pasos
  const yearIds = priceRows.map((p) => p.year_id).filter(notNull);
  const years = yearIds.length
    ? (
        await supabase
          .from("car_model_years")
          .select("id, year, trim_name, model_id")
          .in("id", yearIds)
      ).data ?? []
    : [];

  const modelIds = Array.from(new Set(years.map((y) => y.model_id).filter(notNull)));
  const models = modelIds.length
    ? (await supabase.from("car_models").select("id, name, brand_id").in("id", modelIds)).data ?? []
    : [];

  const brandIds = Array.from(new Set(models.map((m) => m.brand_id).filter(notNull)));
  const brands = brandIds.length
    ? (await supabase.from("car_brands").select("id, name").in("id", brandIds)).data ?? []
    : [];

  const yearById  = new Map(years.map((y) => [y.id, y]));
  const modelById = new Map(models.map((m) => [m.id, m]));
  const brandById = new Map(brands.map((b) => [b.id, b]));

  const priceList: PriceSample[] = priceRows.map((p) => {
    const y = p.year_id ? yearById.get(p.year_id) : undefined;
    const m = y?.model_id ? modelById.get(y.model_id) : undefined;
    const b = m?.brand_id ? brandById.get(m.brand_id) : undefined;

    return {
      label: [b?.name, m?.name, y?.year, y?.trim_name].filter(Boolean).join(" ") || "Vehicle",
      base_price: Number(p.base_price),
      parts_included: p.parts_included,
    };
  });

  const minPrice = priceList.length
    ? Math.min(...priceList.map((p) => p.base_price))
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 flex flex-col gap-8">
      {/* Back */}
      <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
        <Link href="/public/servicios">
          <ArrowLeftIcon className="size-4" />
          All services
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 shrink-0">
          <WrenchIcon weight="fill" className="size-8 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{service.name}</h1>
            {service.category && (
              <Badge variant="secondary" className="capitalize">
                {service.category}
              </Badge>
            )}
          </div>
          {service.description && (
            <p className="text-muted-foreground mt-2">{service.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            {service.duration_minutes && (
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <ClockIcon className="size-4" />
                {service.duration_minutes} min estimated
              </span>
            )}
            {minPrice !== null && (
              <span className="text-sm font-medium">
                From ${minPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price samples */}
      {priceList.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">Sample prices</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {priceList.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  {p.parts_included && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircleIcon className="size-3 text-green-600" />
                      Parts included
                    </p>
                  )}
                </div>
                <p className="font-bold">${p.base_price.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            * Final price depends on your specific vehicle configuration.
          </p>
        </div>
      )}

      {/* CTA */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Get the exact price for your car</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Use our quoter to get an instant estimate.
            </p>
          </div>
          <Button className="shrink-0" asChild>
            <Link href={`/public/cotizador?service=${service.id}`}>
              Get quote
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}