import { AvailableSlotDto } from '../../dto/slot/available-slot.dto';

export interface TimeInterval {
  start: Date;
  end: Date;
}

/**
 * Generate available slots from gaps between busy intervals within a day
 */
export function generateSlotsFromGaps(
  dayStart: Date,
  dayEnd: Date,
  busyIntervals: TimeInterval[],
  durationMinutes: number,
): AvailableSlotDto[] {
  const slots: AvailableSlotDto[] = [];
  const durationMs = durationMinutes * 60 * 1000;

  // Generate slots in the gaps between busy intervals
  let currentTime = new Date(dayStart);

  for (const busy of busyIntervals) {
    // Generate slots in the gap before this busy interval
    while (currentTime.getTime() + durationMs <= busy.start.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + durationMs);
      slots.push({
        startTime: currentTime.toISOString(),
        endTime: slotEnd.toISOString(),
      });
      currentTime = slotEnd;
    }

    // Move past this busy interval
    currentTime = new Date(Math.max(currentTime.getTime(), busy.end.getTime()));
  }

  // Generate slots in the final gap (after last busy interval until dayEnd)
  while (currentTime.getTime() + durationMs <= dayEnd.getTime()) {
    const slotEnd = new Date(currentTime.getTime() + durationMs);
    slots.push({
      startTime: currentTime.toISOString(),
      endTime: slotEnd.toISOString(),
    });
    currentTime = slotEnd;
  }

  return slots;
}
