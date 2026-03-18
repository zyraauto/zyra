"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  CarIcon,
  StarIcon,
  TrashIcon,
  WrenchIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserCars } from "@/hooks/useCars";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { UserCarWithDetails } from "@/types";

type Props = {
  car: UserCarWithDetails;
};

export function CarCard({ car }: Props) {
  const { profile }       = useAuthStore();
  const { removeCar, toggleFavorite } = useUserCars(profile?.id ?? null);

  const brand = car.car_years?.car_models?.car_brands;
  const model = car.car_years?.car_models;
  const year  = car.car_years;

  const handleRemove = async () => {
    const { error } = await removeCar(car.id);
    if (error) toast.error("Failed to remove car.");
    else       toast.success("Car removed from garage.");
  };

  const handleFavorite = async () => {
    const { error } = await toggleFavorite(car.id, car.is_favorite ?? false);
    if (error) toast.error("Failed to update favorite.");
  };

  return (
    <div className={cn(
      "relative flex flex-col gap-4 p-5 rounded-xl border-2 bg-card transition-all",
      car.is_favorite ? "border-primary/40" : "border-border"
    )}>
      {/* Favorite badge */}
      {car.is_favorite && (
        <div className="absolute top-3 left-3">
          <Badge variant="default" className="text-[10px] gap-1 px-1.5">
            <StarIcon weight="fill" className="size-3" />
            Favorite
          </Badge>
        </div>
      )}

      {/* Menu */}
      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <DotsThreeIcon weight="bold" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleFavorite}>
              <StarIcon className="size-4" />
              {car.is_favorite ? "Remove favorite" : "Set as favorite"}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/client/garage/${car.id}`}>
                <WrenchIcon className="size-4" />
                View history
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleRemove}
              className="text-destructive focus:text-destructive"
            >
              <TrashIcon className="size-4" />
              Remove car
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Car icon + info */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center justify-center size-14 rounded-xl bg-muted shrink-0">
          {brand?.logo_url ? (
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="size-10 object-contain"
            />
          ) : (
            <CarIcon className="size-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">
            {car.nickname
              ? car.nickname
              : `${brand?.name ?? ""} ${model?.name ?? ""}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {brand?.name} {model?.name} · {year?.year}
          </p>
        </div>
      </div>

      {/* Specs */}
      <div className="flex flex-wrap gap-2">
        {year?.engine_config && (
          <Badge variant="secondary" className="text-xs">{year.engine_config}</Badge>
        )}
        {year?.transmission && (
          <Badge variant="outline" className="text-xs capitalize">{year.transmission}</Badge>
        )}
        {year?.fuel_type && (
          <Badge variant="outline" className="text-xs capitalize">{year.fuel_type}</Badge>
        )}
        {car.plate && (
          <Badge variant="outline" className="text-xs font-mono">{car.plate}</Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t">
        <div>
          <p className="text-xs text-muted-foreground">Mileage</p>
          <p className="text-sm font-medium">
            {car.mileage
              ? `${car.mileage.toLocaleString()} km`
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last service</p>
          <p className="text-sm font-medium">
            {car.last_service_date
              ? format(new Date(car.last_service_date), "MMM d, yyyy")
              : "—"}
          </p>
        </div>
      </div>

      {/* Book button */}
      <Button size="sm" variant="outline" className="w-full" asChild>
        <Link href={`/client/citas/nueva?car=${car.id}`}>
          <WrenchIcon className="size-4" />
          Book service
        </Link>
      </Button>
    </div>
  );
}