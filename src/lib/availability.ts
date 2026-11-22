import type { DayKey, Location, WaitType } from '@/types/domain';

export interface ExistingBookingSlot {
  startsAt: string; // ISO
  endsAt: string; // ISO
}

export interface AvailableTimeSlot {
  startsAt: string; // ISO
  endsAt: string; // ISO
  label: string; // e.g., "09:00 AM"
  remainingBays: number;
}

export interface AvailableDay {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  slots: AvailableTimeSlot[];
}

const DAY_KEYS: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function parseHourMin(hm: string): { hour: number; minute: number } {
  const [hStr, mStr] = hm.split(':');
  return { hour: Number(hStr ?? 9), minute: Number(mStr ?? 0) };
}

function formatTimeLabel(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const minStr = minute.toString().padStart(2, '0');
  return `${displayHour}:${minStr} ${period}`;
}

/**
 * Generates up to 30 days of available appointment slots for a location,
 * accounting for business hours, bay capacity, existing appointments/blocks,
 * and drop-off vs wait duration requirements.
 */
export function computeAvailability(params: {
  location: Location;
  durationMin: number;
  waitType: WaitType;
  existingBookings: ExistingBookingSlot[];
  daysCount?: number;
  fromDate?: Date;
}): AvailableDay[] {
  const {
    location,
    durationMin,
    waitType,
    existingBookings,
    daysCount = 30,
    fromDate = new Date(),
  } = params;

  const effectiveDuration = Math.max(30, durationMin);
  // Drop-off slots allow check-in up to 60 min before close if total duration fits within same day
  const stepMin = 30;
  const results: AvailableDay[] = [];

  const parsedBookings = existingBookings.map((b) => ({
    start: Date.parse(b.startsAt),
    end: Date.parse(b.endsAt),
  }));

  const startBase = new Date(fromDate);
  startBase.setHours(0, 0, 0, 0);

  // Start from tomorrow to give minimum lead time
  for (let offset = 1; offset <= daysCount; offset++) {
    const dayDate = new Date(startBase);
    dayDate.setDate(startBase.getDate() + offset);
    const dayKey = DAY_KEYS[dayDate.getDay()]!;
    const hours = location.businessHours[dayKey];

    const yyyy = dayDate.getFullYear();
    const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (!hours) {
      results.push({
        date: dateStr,
        dayLabel: dayKey,
        slots: [],
      });
      continue;
    }

    const { hour: openH, minute: openM } = parseHourMin(hours.open);
    const { hour: closeH, minute: closeM } = parseHourMin(hours.close);

    const openTotalMin = openH * 60 + openM;
    const closeTotalMin = closeH * 60 + closeM;

    const slots: AvailableTimeSlot[] = [];
    // For "wait", full job duration must fit inside business hours.
    // For "drop_off", vehicle can be dropped off as long as check-in is at least 90 min before close.
    const requiredWindowMin = waitType === 'wait' ? effectiveDuration : Math.min(effectiveDuration, 90);

    for (let cursor = openTotalMin; cursor + requiredWindowMin <= closeTotalMin; cursor += stepMin) {
      const slotH = Math.floor(cursor / 60);
      const slotM = cursor % 60;

      const slotStart = new Date(yyyy, dayDate.getMonth(), dayDate.getDate(), slotH, slotM, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + effectiveDuration * 60_000);

      // Count overlapping bookings
      const overlapping = parsedBookings.filter(
        (b) => b.start < slotEnd.getTime() && b.end > slotStart.getTime(),
      ).length;

      const remainingBays = location.bays - overlapping;
      if (remainingBays > 0) {
        slots.push({
          startsAt: slotStart.toISOString(),
          endsAt: slotEnd.toISOString(),
          label: formatTimeLabel(slotH, slotM),
          remainingBays,
        });
      }
    }

    results.push({
      date: dateStr,
      dayLabel: dayKey,
      slots,
    });
  }

  return results;
}
