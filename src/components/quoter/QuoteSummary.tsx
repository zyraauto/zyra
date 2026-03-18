"use client";

import { useRouter } from "next/navigation";
import { useQuoterStore, selectQuoterIsComplete } from "@/stores/quoter.store";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CarIcon,
  WrenchIcon,
  ClockIcon,
  TagIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";

export function QuoteSummary() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const {
    brand, model, year, service, price,
    goToStep, reset,
  } = useQuoterStore();
  const isComplete = useQuoterStore(selectQuoterIsComplete);

  if (!isComplete) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-sm">Complete all steps to see your quote.</p>
      </div>
    );
  }

  const handleBook = () => {
    if (!profile) {
      // Save intent and redirect to login
      router.push("/auth/login?redirect=/client/citas");
      return;
    }
    router.push("/client/citas/nueva");
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-lg">Your quote</h2>

          {/* Vehicle */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
              <CarIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Vehicle
              </p>
              <p className="font-medium">
                {brand?.name} {model?.name} {year?.year}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {year?.engine_config && (
                  <Badge variant="outline" className="text-[10px]">
                    {year.engine_config}
                  </Badge>
                )}
                {year?.transmission && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {year.transmission}
                  </Badge>
                )}
                {year?.fuel_type && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {year.fuel_type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Service */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
              <WrenchIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Service
              </p>
              <p className="font-medium">{service?.name}</p>
              {service?.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {service.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {service?.duration_minutes && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ClockIcon className="size-3" />
                    {service.duration_minutes} min
                  </span>
                )}
                {price?.parts_included && (
                  <Badge variant="secondary" className="text-[10px]">
                    Parts included
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TagIcon className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated price</span>
            </div>
            {price ? (
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${Number(price.base_price).toLocaleString()}
                </p>
                {price.notes && (
                  <p className="text-xs text-muted-foreground">{price.notes}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Price on request</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => goToStep("service")}
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>
        <Button className="flex-1" onClick={handleBook}>
          {profile ? "Book appointment" : "Sign in to book"}
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>

      <button
        onClick={reset}
        className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
      >
        Start over
      </button>
    </div>
  );
}