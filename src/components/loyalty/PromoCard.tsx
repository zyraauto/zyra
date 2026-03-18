"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TagIcon, CalendarIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { format, parseISO, isPast, differenceInDays } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Promotion } from "@/types";

type Props = {
  promo: Promotion;
  compact?: boolean;
};

const DISCOUNT_LABEL: Record<string, string> = {
  percentage: "% off",
  fixed: "off",
  free_service: "Free service",
};

export function PromoCard({ promo, compact = false }: Props) {
  // ✅ useMemo evita llamar Date.now() directamente en render
  const isExpiringSoon = useMemo(() => {
    if (!promo.valid_until) return false;
    const until = parseISO(promo.valid_until);
    if (isPast(until)) return false;
    return differenceInDays(until, new Date()) < 7;
  }, [promo.valid_until]);

  const discountText = useMemo(() => {
    const type = promo.discount_type ?? "percentage"; // fallback si es null
    if (type === "free_service") return "Free service";
    if (!promo.discount_value) return "";
    const prefix = type === "percentage" ? "" : "$";
    const suffix = DISCOUNT_LABEL[type] ?? "";
    return `${prefix}${promo.discount_value}${suffix}`;
  }, [promo.discount_type, promo.discount_value]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-xl border-2 bg-card transition-all",
        "border-dashed border-primary/40 bg-primary/5",
        compact && "p-3 gap-2"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <TagIcon weight="fill" className="size-4 text-primary shrink-0" />
          <p
            className={cn(
              "font-semibold leading-tight",
              compact ? "text-sm" : "text-base"
            )}
          >
            {promo.title}
          </p>
        </div>
        {isExpiringSoon && (
          <Badge variant="destructive" className="text-[10px] shrink-0">
            Expiring soon
          </Badge>
        )}
      </div>

      {/* Discount */}
      {discountText && (
        <div
          className={cn(
            "font-bold text-primary",
            compact ? "text-lg" : "text-2xl"
          )}
        >
          {discountText}
        </div>
      )}

      {/* Validity */}
      {(promo.valid_from || promo.valid_until) && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarIcon className="size-3" />
          {promo.valid_from && (
            <span>From {format(parseISO(promo.valid_from), "MMM d")}</span>
          )}
          {promo.valid_from && promo.valid_until && <span>·</span>}
          {promo.valid_until && (
            <span>
              Until {format(parseISO(promo.valid_until), "MMM d, yyyy")}
            </span>
          )}
        </div>
      )}

      {!compact && (
        <Button size="sm" variant="default" className="w-full mt-1" asChild>
          <Link href="/public/cotizador">
            Use now
            <ArrowRightIcon className="size-3" />
          </Link>
        </Button>
      )}
    </div>
  );
}