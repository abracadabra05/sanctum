import {
  addDays,
  addMinutes,
  combineDateAndTime,
  extractLocalTime,
  formatDateTimeLabel,
  fromDateKey,
  isAfterClockTime,
  isSameDay,
  isValidDateKey,
  isValidTimeValue,
  shiftDateKey,
  startOfDay,
  toDateKey,
  tryCombineDateAndTime,
} from '@/shared/lib/date';

describe('date utilities', () => {
  describe('startOfDay', () => {
    it('sets time to midnight', () => {
      const date = new Date(2026, 3, 10, 15, 30, 45, 123);
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('does not mutate original date', () => {
      const date = new Date(2026, 3, 10, 15, 30, 45);
      startOfDay(date);
      expect(date.getHours()).toBe(15);
    });
  });

  describe('toDateKey', () => {
    it('returns YYYY-MM-DD format', () => {
      const date = new Date(2026, 0, 5);
      expect(toDateKey(date)).toBe('2026-01-05');
    });

    it('pads single digit months and days', () => {
      const date = new Date(2026, 8, 3);
      expect(toDateKey(date)).toBe('2026-09-03');
    });
  });

  describe('fromDateKey', () => {
    it('parses YYYY-MM-DD to Date', () => {
      const result = fromDateKey('2026-03-15');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(2); // 0-indexed
      expect(result.getDate()).toBe(15);
    });
  });

  describe('validation helpers', () => {
    it('accepts only valid date keys', () => {
      expect(isValidDateKey('2026-03-15')).toBe(true);
      expect(isValidDateKey('2026-02-31')).toBe(false);
    });

    it('accepts only valid time values', () => {
      expect(isValidTimeValue('09:30')).toBe(true);
      expect(isValidTimeValue('24:15')).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('returns true for same day', () => {
      const a = new Date(2026, 3, 10, 8, 0, 0);
      const b = new Date(2026, 3, 10, 20, 0, 0);
      expect(isSameDay(a, b)).toBe(true);
    });

    it('returns false for different days', () => {
      const a = new Date(2026, 3, 10);
      const b = new Date(2026, 3, 11);
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('adds positive days', () => {
      const date = new Date(2026, 3, 10);
      expect(addDays(date, 3).getDate()).toBe(13);
    });

    it('subtracts with negative days', () => {
      const date = new Date(2026, 3, 10);
      expect(addDays(date, -2).getDate()).toBe(8);
    });
  });

  describe('addMinutes', () => {
    it('adds minutes', () => {
      const date = new Date(2026, 3, 10, 10, 0);
      const result = addMinutes(date, 90);
      expect(result.getHours()).toBe(11);
      expect(result.getMinutes()).toBe(30);
    });
  });

  describe('combineDateAndTime', () => {
    it('combines date key and time into ISO string', () => {
      const result = combineDateAndTime('2026-03-15', '14:30');
      const date = new Date(result);
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(2);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
    });

    it('returns null from safe combiner when values are invalid', () => {
      expect(tryCombineDateAndTime('2026-02-31', '14:30')).toBeNull();
      expect(tryCombineDateAndTime('2026-03-15', '25:30')).toBeNull();
    });
  });

  describe('extractLocalTime', () => {
    it('extracts HH:MM from ISO string', () => {
      const iso = new Date(2026, 3, 10, 14, 30, 0).toISOString();
      expect(extractLocalTime(iso)).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('isAfterClockTime', () => {
    it('returns true when time is past cutoff', () => {
      const date = new Date(2026, 3, 10, 15, 0, 0);
      expect(isAfterClockTime(date, '10:00')).toBe(true);
    });

    it('returns false when time is before cutoff', () => {
      const date = new Date(2026, 3, 10, 8, 0, 0);
      expect(isAfterClockTime(date, '10:00')).toBe(false);
    });
  });

  describe('derived formatting helpers', () => {
    it('shifts a valid date key by days', () => {
      expect(shiftDateKey('2026-03-15', 2)).toBe('2026-03-17');
    });

    it('formats a date-time label', () => {
      const iso = new Date(2026, 3, 10, 14, 30, 0).toISOString();
      expect(formatDateTimeLabel(iso, '24h')).toContain('14:30');
    });
  });
});
