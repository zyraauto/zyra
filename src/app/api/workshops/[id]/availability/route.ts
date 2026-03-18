import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api";
import { getWorkshopById, getBookedSlots } from "@/lib/supabase/workshops";
import type { WorkshopSchedule, DaySchedule } from "@/types";

const SLOT_DURATION_MINUTES = 60;

function generateSlots(schedule: DaySchedule): string[] {
  const slots: string[] = [];
  const [openH, openM]  = schedule.open.split(":").map(Number);
  const [closeH, closeM] = schedule.close.split(":").map(Number);

  let current = openH * 60 + openM;
  const end   = closeH * 60 + closeM;

  while (current + SLOT_DURATION_MINUTES <= end) {
    const h = String(Math.floor(current / 60)).padStart(2, "0");
    const m = String(current % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    current += SLOT_DURATION_MINUTES;
  }

  return slots;
}

const DAY_NAMES = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
] as const;

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const date = req.nextUrl.searchParams.get("date"); // "YYYY-MM-DD"

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return err("Valid date (YYYY-MM-DD) is required");
  }

  const workshop = await getWorkshopById(id);
  if (!workshop) return err("Workshop not found", 404);

  if (!workshop.schedule) return ok([]);

  const schedule = workshop.schedule as WorkshopSchedule;
  const dayName  = DAY_NAMES[new Date(date + "T12:00:00").getDay()];
  const daySchedule = schedule[dayName];

  if (!daySchedule?.enabled) return ok([]);

  const allSlots    = generateSlots(daySchedule);
  const bookedSlots = await getBookedSlots(id, date);

  // Normalize booked times to "HH:mm"
  const bookedTimes = new Set(
    bookedSlots.map((s) => new Date(s).toTimeString().slice(0, 5))
  );

  const available = allSlots.map((time) => ({
    time,
    available: !bookedTimes.has(time),
  }));

  return ok(available);
}
