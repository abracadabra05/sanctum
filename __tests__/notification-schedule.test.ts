import { addDays, extractLocalTime, toDateKey } from '@/shared/lib/date';
import {
  buildHabitReminderDates,
  buildWaterReminderDates,
} from '@/shared/services/notification-schedule';
import type { HabitItem } from '@/shared/types/app';

describe('notification schedule helpers', () => {
  it('builds water reminders until cutoff', () => {
    const now = new Date(2026, 3, 17, 8, 0, 0);
    const dates = buildWaterReminderDates(now, 90, '12:00', 6);

    expect(dates).toHaveLength(2);
    expect(extractLocalTime(dates[0].toISOString())).toBe('09:30');
    expect(extractLocalTime(dates[1].toISOString())).toBe('11:00');
  });

  it('builds rolling habit reminders across upcoming scheduled days', () => {
    const now = new Date(2026, 3, 14, 7, 0, 0);
    const todayWeekday = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const tomorrow = addDays(now, 1);
    const tomorrowWeekday = tomorrow.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const habit: HabitItem = {
      id: 'habit-1',
      name: 'Read',
      icon: 'book',
      accentColor: '#E8E3FF',
      goalMode: 'daily',
      targetPerPeriod: 1,
      schedule: { days: [todayWeekday, tomorrowWeekday] },
      archived: false,
      archivedAt: null,
      reminder: { enabled: true, time: '08:00' },
      completions: [],
    };

    const dates = buildHabitReminderDates(habit, now, 2);

    expect(dates).toHaveLength(2);
    expect(toDateKey(dates[0])).toBe(toDateKey(now));
    expect(extractLocalTime(dates[0].toISOString())).toBe('08:00');
    expect(toDateKey(dates[1])).toBe(toDateKey(tomorrow));
  });

  it('skips past-due reminders for today', () => {
    const now = new Date(2026, 3, 14, 20, 0, 0);
    const todayWeekday = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const tomorrow = addDays(now, 1);
    const tomorrowWeekday = tomorrow.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const habit: HabitItem = {
      id: 'habit-2',
      name: 'Walk',
      icon: 'leaf',
      accentColor: '#DCEEFF',
      goalMode: 'daily',
      targetPerPeriod: 1,
      schedule: { days: [todayWeekday, tomorrowWeekday] },
      archived: false,
      archivedAt: null,
      reminder: { enabled: true, time: '08:00' },
      completions: [],
    };

    const dates = buildHabitReminderDates(habit, now, 2);

    expect(dates).toHaveLength(1);
    expect(toDateKey(dates[0])).toBe(toDateKey(tomorrow));
  });
});
