"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ClockIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type Slot = {
  time:      string;
  available: boolean;
};

type Props = {
  workshopId:   string;
  date:         Date;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
};

export function TimeSlotPicker({
  workshopId,
  date,
  selectedTime,
  onSelectTime,
}: Props) {
  const [slots,     setSlots]     = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    // ✅ todo el setState dentro del async
    const run = async () => {
      setIsLoading(true);
      const dateStr = format(date, "yyyy-MM-dd");

      try {
        const res = await fetch(
          `/api/workshops/${workshopId}/availability?date=${dateStr}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("Failed to fetch availability");

        const { data } = await res.json();

        if (!controller.signal.aborted) {
          setSlots(data ?? []);
          setIsLoading(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error fetching time slots:", err);
          if (!controller.signal.aborted) setIsLoading(false);
        }
      }
    };

    run();
    return () => controller.abort();
  }, [workshopId, date]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <ClockIcon className="size-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No available slots for this day.</p>
      </div>
    );
  }

  const available = slots.filter((s) => s.available);

  if (!available.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <ClockIcon className="size-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">All slots are booked for this day.</p>
        <p className="text-xs mt-1">Please select another date.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {available.length} slot{available.length !== 1 ? "s" : ""} available on{" "}
        <span className="font-medium text-foreground">
          {format(date, "EEEE, MMMM d")}
        </span>
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => slot.available && onSelectTime(slot.time)}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg",
              "text-sm font-medium border-2 transition-all",
              slot.available
                ? selectedTime === slot.time
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                : "border-border bg-muted text-muted-foreground opacity-40 cursor-not-allowed line-through"
            )}
          >
            <ClockIcon className="size-3 shrink-0" />
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}