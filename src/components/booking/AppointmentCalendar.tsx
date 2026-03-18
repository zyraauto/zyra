"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { isBefore, startOfDay, addDays } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  workshopId: string;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
};

export function AppointmentCalendar({
  workshopId: _workshopId,
  selectedDate,
  onSelectDate,
}: Props) {
  const today     = startOfDay(new Date());
  const maxDate   = addDays(today, 60);

  const isDisabled = (date: Date) =>
    isBefore(date, today) ||
    isBefore(maxDate, date) ||
    date.getDay() === 0; // disable Sundays

  return (
    <div className="flex justify-center">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        disabled={isDisabled}
        showOutsideDays={false}
        classNames={{
          root:         "w-full",
          month:        "w-full",
          caption:      "flex justify-between items-center mb-4 px-1",
          caption_label: "text-sm font-semibold",
          nav:          "flex items-center gap-1",
          nav_button:   cn(
            "inline-flex items-center justify-center size-8 rounded-md border",
            "hover:bg-accent transition-colors"
          ),
          table:        "w-full border-collapse",
          head_row:     "flex justify-between mb-1",
          head_cell:    "text-muted-foreground text-xs font-medium w-9 text-center",
          row:          "flex justify-between mt-1",
          cell:         "relative p-0",
          day:          cn(
            "inline-flex items-center justify-center size-9 rounded-md text-sm",
            "hover:bg-accent transition-colors cursor-pointer"
          ),
          day_selected: "bg-primary text-primary-foreground hover:bg-primary",
          day_today:    "border border-primary font-semibold",
          day_disabled: "opacity-30 cursor-not-allowed hover:bg-transparent",
          day_outside:  "opacity-0 pointer-events-none",
        }}
      />
    </div>
  );
}