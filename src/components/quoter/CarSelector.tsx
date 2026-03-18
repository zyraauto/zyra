"use client";

import { useQuoterStore } from "@/stores/quoter.store";
import { useCarBrands, useCarModels, useCarYears } from "@/hooks/useCars";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CarIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { CarBrand, CarModel, CarYear } from "@/types";

// ─── Brand grid ───────────────────────────────────────────────────
function BrandGrid() {
  const { brand: selected, setBrand } = useQuoterStore();
  const { brands, isLoading } = useCarBrands();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {brands.map((b) => (
        <BrandCard
          key={b.id}
          brand={b}
          isSelected={selected?.id === b.id}
          onSelect={setBrand}
        />
      ))}
    </div>
  );
}

function BrandCard({
  brand,
  isSelected,
  onSelect,
}: {
  brand: CarBrand;
  isSelected: boolean;
  onSelect: (b: CarBrand) => void;
}) {
  return (
    <button
      onClick={() => onSelect(brand)}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
        "hover:border-primary hover:bg-primary/5",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-card"
      )}
    >
      {isSelected && (
        <CheckCircleIcon
          weight="fill"
          className="absolute top-2 right-2 size-4 text-primary"
        />
      )}
      {brand.logo_url ? (
        <Image
          src={brand.logo_url}
          alt={brand.name}
          className="h-10 w-auto object-contain"
        />
      ) : (
        <CarIcon className="size-8 text-muted-foreground" />
      )}
      <span className="text-xs font-medium text-center">{brand.name}</span>
    </button>
  );
}

// ─── Model list ───────────────────────────────────────────────────
function ModelList() {
  const { brand, model: selected, setModel } = useQuoterStore();
  const { models, isLoading } = useCarModels(brand?.id ?? null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!models.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No models available for this brand.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {models.map((m) => (
        <ModelCard
          key={m.id}
          model={m}
          isSelected={selected?.id === m.id}
          onSelect={setModel}
        />
      ))}
    </div>
  );
}

function ModelCard({
  model,
  isSelected,
  onSelect,
}: {
  model: CarModel;
  isSelected: boolean;
  onSelect: (m: CarModel) => void;
}) {
  return (
    <button
      onClick={() => onSelect(model)}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium",
        "hover:border-primary hover:bg-primary/5",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card"
      )}
    >
      <span>{model.name}</span>
      {model.body_type && (
        <Badge variant="secondary" className="text-[10px] capitalize">
          {model.body_type}
        </Badge>
      )}
    </button>
  );
}

// ─── Year list ────────────────────────────────────────────────────
function YearList() {
  const { model, year: selected, setYear } = useQuoterStore();
  const { years, isLoading } = useCarYears(model?.id ?? null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {years.map((y) => (
        <YearCard
          key={y.id}
          year={y}
          isSelected={selected?.id === y.id}
          onSelect={setYear}
        />
      ))}
    </div>
  );
}

function YearCard({
  year,
  isSelected,
  onSelect,
}: {
  year: CarYear;
  isSelected: boolean;
  onSelect: (y: CarYear) => void;
}) {
  return (
    <button
      onClick={() => onSelect(year)}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all",
        "hover:border-primary hover:bg-primary/5",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-card"
      )}
    >
      <span className="text-sm font-bold">{year.year}</span>
      {year.engine_config && (
        <span className="text-[10px] text-muted-foreground">{year.engine_config}</span>
      )}
      {year.transmission && (
        <Badge variant="outline" className="text-[10px] capitalize">
          {year.transmission}
        </Badge>
      )}
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────
export function CarSelector() {
  const { step, brand, model, goToStep } = useQuoterStore();

  return (
    <div className="flex flex-col gap-8">
      {/* Brand */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Select brand</h2>
          {brand && step !== "brand" && (
            <button
              onClick={() => goToStep("brand")}
              className="text-xs text-primary hover:underline"
            >
              Change
            </button>
          )}
        </div>
        {brand && step !== "brand" ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            {brand.logo_url && (
              <Image src={brand.logo_url} alt={brand.name} className="h-8 w-auto" />
            )}
            <span className="font-medium">{brand.name}</span>
            <CheckCircleIcon weight="fill" className="ml-auto size-5 text-primary" />
          </div>
        ) : (
          <BrandGrid />
        )}
      </section>

      {/* Model */}
      {brand && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Select model</h2>
            {model && step !== "model" && (
              <button
                onClick={() => goToStep("model")}
                className="text-xs text-primary hover:underline"
              >
                Change
              </button>
            )}
          </div>
          {model && step !== "model" ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">{model.name}</span>
              <CheckCircleIcon weight="fill" className="size-5 text-primary" />
            </div>
          ) : (
            <ModelList />
          )}
        </section>
      )}

      {/* Year */}
      {model && (
        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">Select year</h2>
          <YearList />
        </section>
      )}
    </div>
  );
}