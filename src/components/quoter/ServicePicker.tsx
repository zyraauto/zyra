"use client";

import { useState, useEffect } from "react";
import { useQuoterStore } from "@/stores/quoter.store";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClockIcon, CheckCircleIcon, WrenchIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";

type ServiceRow      = Tables<"services">;
type ServicePriceRow = Tables<"service_prices">;
type ServiceCategory = NonNullable<ServiceRow["category"]>;

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  oil:    "Oil change",
  brakes: "Brakes",
  tuning: "Tuning",
  other:  "Other",
};

type ServiceWithPrice = ServiceRow & { price: ServicePriceRow | null };

export function ServicePicker() {
  const { year, service: selected, setService, setPrice } = useQuoterStore();
  const [services,  setServices]  = useState<ServiceWithPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category,  setCategory]  = useState<ServiceCategory>("oil");

  useEffect(() => {
    if (!year?.id) return;

    let mounted = true;

    // ✅ todo el setState dentro del async
    const run = async () => {
      setIsLoading(true);

      const supabase = createClient();

      const { data: svcsData } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      // ✅ cast explícito para evitar never
      const svcs = (svcsData as ServiceRow[]) ?? [];

      if (!svcs.length || !mounted) {
        if (mounted) setIsLoading(false);
        return;
      }

      const { data: pricesData } = await supabase
        .from("service_prices")
        .select("*")
        .eq("year_id", year.id)
        .in("service_id", svcs.map((s) => s.id));

      // ✅ cast explícito para evitar never
      const prices = (pricesData as ServicePriceRow[]) ?? [];

      const priceMap = Object.fromEntries(
        prices.map((p) => [p.service_id, p])
      );

      if (mounted) {
        const merged: ServiceWithPrice[] = svcs.map((s) => ({
          ...s,
          price: priceMap[s.id] ?? null,
        }));
        setServices(merged);
        setIsLoading(false);
      }
    };

    run();
    return () => { mounted = false; };
  }, [year?.id]);

  const handleSelect = (svc: ServiceWithPrice) => {
    setService(svc);
    if (svc.price) setPrice(svc.price);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!services.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <WrenchIcon className="size-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No services available for this vehicle.</p>
      </div>
    );
  }

  return (
    <Tabs
      value={category}
      onValueChange={(v) => setCategory(v as ServiceCategory)}
    >
      <TabsList className="mb-4">
        {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((cat) => (
          <TabsTrigger key={cat} value={cat}>
            {CATEGORY_LABELS[cat]}
          </TabsTrigger>
        ))}
      </TabsList>

      {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((cat) => {
        // ✅ byCategory usado directamente aquí — sin variable suelta
        const catServices = services.filter((s) => s.category === cat);
        return (
          <TabsContent key={cat} value={cat} className="flex flex-col gap-3 mt-0">
            {catServices.length > 0 ? (
              catServices.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  service={svc}
                  isSelected={selected?.id === svc.id}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No services in this category.
              </p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function ServiceCard({
  service,
  isSelected,
  onSelect,
}: {
  service:    ServiceWithPrice;
  isSelected: boolean;
  onSelect:   (s: ServiceWithPrice) => void;
}) {
  return (
    <button
      onClick={() => onSelect(service)}
      className={cn(
        "w-full text-left flex items-start gap-4 p-4 rounded-xl border-2 transition-all",
        "hover:border-primary hover:bg-primary/5",
        isSelected ? "border-primary bg-primary/10" : "border-border bg-card"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center size-10 rounded-lg shrink-0",
          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <WrenchIcon className="size-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm">{service.name}</p>
          {isSelected && (
            <CheckCircleIcon weight="fill" className="size-5 text-primary shrink-0" />
          )}
        </div>

        {service.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {service.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          {service.duration_minutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ClockIcon className="size-3" />
              {service.duration_minutes} min
            </span>
          )}
          {service.price?.parts_included && (
            <Badge variant="secondary" className="text-[10px]">
              Parts included
            </Badge>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        {service.price ? (
          <p className="font-bold text-base">
            ${Number(service.price.base_price).toLocaleString()}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Price on request</p>
        )}
      </div>
    </button>
  );
}