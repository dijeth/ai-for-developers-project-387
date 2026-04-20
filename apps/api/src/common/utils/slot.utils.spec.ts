import { generateSlotsFromGaps, TimeInterval } from './slot.utils';

describe('generateSlotsFromGaps', () => {
  const createDate = (hour: number, minute: number = 0): Date => {
    return new Date(2024, 0, 15, hour, minute, 0, 0);
  };

  const parseISO = (iso: string): Date => new Date(iso);

  describe('basic cases', () => {
    it('should return empty array when no time for any slot', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(10, 0);
      const busyIntervals: TimeInterval[] = [];
      const durationMinutes = 90; // 90 min slot, but only 60 min available

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      expect(result).toEqual([]);
    });

    it('should generate single slot for entire free day', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(10, 0);
      const busyIntervals: TimeInterval[] = [];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      expect(result).toHaveLength(1);
      expect(result[0].startTime).toBe(dayStart.toISOString());
      expect(result[0].endTime).toBe(dayEnd.toISOString());
    });

    it('should generate multiple consecutive slots for free day', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(12, 0); // 3 hours
      const busyIntervals: TimeInterval[] = [];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      expect(result).toHaveLength(3);
      expect(parseISO(result[0].startTime).getHours()).toBe(9);
      expect(parseISO(result[1].startTime).getHours()).toBe(10);
      expect(parseISO(result[2].startTime).getHours()).toBe(11);
    });
  });

  describe('with busy intervals', () => {
    it('should not generate slots during busy intervals', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(12, 0);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(10, 0), end: createDate(11, 0) },
      ];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      // Should have slots: 9:00-10:00, 11:00-12:00
      expect(result).toHaveLength(2);
      expect(parseISO(result[0].startTime).getHours()).toBe(9);
      expect(parseISO(result[0].endTime).getHours()).toBe(10);
      expect(parseISO(result[1].startTime).getHours()).toBe(11);
      expect(parseISO(result[1].endTime).getHours()).toBe(12);
    });

    it('should handle multiple busy intervals', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(17, 0);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(11, 0), end: createDate(12, 0) },
        { start: createDate(14, 0), end: createDate(15, 0) },
        { start: createDate(16, 0), end: createDate(16, 30) },
      ];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      // Gaps: 9-11 (2 slots), 12-14 (2 slots), 15-16 (1 slot), 16:30-17 (no slot - only 30 min)
      expect(result).toHaveLength(5);
    });

    it('should handle busy interval at the start of the day', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(12, 0);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(9, 0), end: createDate(10, 0) },
      ];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      // Only slot: 10:00-11:00, 11:00-12:00
      expect(result).toHaveLength(2);
      expect(parseISO(result[0].startTime).getHours()).toBe(10);
    });

    it('should handle busy interval at the end of the day', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(12, 0);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(11, 0), end: createDate(12, 0) },
      ];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      // Only slot: 9:00-10:00, 10:00-11:00
      expect(result).toHaveLength(2);
      expect(parseISO(result[result.length - 1].endTime).getHours()).toBe(11);
    });

    it('should handle busy interval covering entire day', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(12, 0);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(9, 0), end: createDate(12, 0) },
      ];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      expect(result).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle 30-minute slots correctly', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(10, 30);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(9, 30), end: createDate(9, 45) },
      ];
      const durationMinutes = 30;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      // Slots: 9:00-9:30, 9:45-10:15
      expect(result).toHaveLength(2);
      expect(parseISO(result[0].startTime).getMinutes()).toBe(0);
      expect(parseISO(result[1].startTime).getMinutes()).toBe(45);
    });

    it('should handle overlapping busy intervals', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(12, 0);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(10, 0), end: createDate(11, 0) },
        { start: createDate(10, 30), end: createDate(11, 30) }, // overlaps with first
      ];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      // Combined busy: 10:00-11:30
      // Slots: 9:00-10:00
      expect(result).toHaveLength(1);
    });

    it('should handle adjacent busy intervals', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(15, 0);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(10, 0), end: createDate(11, 0) },
        { start: createDate(11, 0), end: createDate(12, 0) }, // adjacent to first
      ];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      // Combined busy: 10:00-12:00
      // Slots: 9:00-10:00, 12:00-13:00, 13:00-14:00, 14:00-15:00
      expect(result).toHaveLength(4);
    });

    it('should handle empty busy intervals array', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(13, 0);
      const busyIntervals: TimeInterval[] = [];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      expect(result).toHaveLength(4);
    });

    it('should return empty array when slot duration exceeds available time', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(9, 30);
      const busyIntervals: TimeInterval[] = [];
      const durationMinutes = 60;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      expect(result).toEqual([]);
    });
  });

  describe('slot duration variations', () => {
    it('should handle 15-minute slots', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(10, 0);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(9, 15), end: createDate(9, 30) },
      ];
      const durationMinutes = 15;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      // Slots: 9:00-9:15, 9:30-9:45, 9:45-10:00
      expect(result).toHaveLength(3);
    });

    it('should handle 2-hour slots', () => {
      const dayStart = createDate(9, 0);
      const dayEnd = createDate(17, 0);
      const busyIntervals: TimeInterval[] = [
        { start: createDate(13, 0), end: createDate(14, 0) },
      ];
      const durationMinutes = 120;

      const result = generateSlotsFromGaps(dayStart, dayEnd, busyIntervals, durationMinutes);

      // Slots: 9:00-11:00, 11:00-13:00, 14:00-16:00
      // 16:00-17:00 is only 1 hour - not enough for 2-hour slot
      expect(result).toHaveLength(3);
    });
  });
});
