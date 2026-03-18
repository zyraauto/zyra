"use client";

import { useQuoterStore } from "@/stores/quoter.store";
import { cn } from "@/lib/utils";
import { CarIcon, WrenchIcon, CheckIcon, CalendarIcon } from "@phosphor-icons/react";

type Step = {
  id:    "brand" | "model" | "year" | "service" | "summary";
  label: string;
  icon:  React.ReactNode;
};

const STEPS: Step[] = [
  { id: "brand",   label: "Brand",   icon: <CarIcon />     },
  { id: "model",   label: "Model",   icon: <CarIcon />     },
  { id: "year",    label: "Year",    icon: <CarIcon />     },
  { id: "service", label: "Service", icon: <WrenchIcon />  },
  { id: "summary", label: "Summary", icon: <CalendarIcon />},
];

const STEP_ORDER = STEPS.map((s) => s.id);

export function QuoterStepper() {
  const { step, goToStep, brand, model, year, service } = useQuoterStore();

  const currentIndex = STEP_ORDER.indexOf(step);

  const isStepAccessible = (stepId: Step["id"]) => {
    const idx = STEP_ORDER.indexOf(stepId);
    if (idx === 0) return true;
    if (idx === 1) return !!brand;
    if (idx === 2) return !!brand && !!model;
    if (idx === 3) return !!brand && !!model && !!year;
    if (idx === 4) return !!brand && !!model && !!year && !!service;
    return false;
  };

  return (
    <nav aria-label="Quoter steps" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map((s, idx) => {
          const isDone       = idx < currentIndex;
          const isCurrent    = s.id === step;
          const isAccessible = isStepAccessible(s.id);

          return (
            <li key={s.id} className="flex-1 flex items-center">
              {/* Step button */}
              <button
                onClick={() => isAccessible && goToStep(s.id)}
                disabled={!isAccessible}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1.5 w-full group",
                  isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center size-9 rounded-full border-2 transition-all",
                  isDone    && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary",
                  !isDone && !isCurrent && "border-border bg-background text-muted-foreground"
                )}>
                  {isDone
                    ? <CheckIcon weight="bold" className="size-4" />
                    : <span className="size-4 flex items-center justify-center">{s.icon}</span>
                  }
                </div>
                <span className={cn(
                  "text-[11px] font-medium hidden sm:block",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </button>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-1 transition-colors",
                  idx < currentIndex ? "bg-primary" : "bg-border"
                )} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}