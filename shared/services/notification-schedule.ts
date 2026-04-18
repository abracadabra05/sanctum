import {
  addDays,
  addMinutes,
  combineDateAndTime,
  fromDateKey,
  isAfterClockTime,
  toDateKey,
} from '@/shared/lib/date';
import type { HabitItem } from '@/shared/types/app';

const habitShouldRunOnDate = (habit: HabitItem, dateKey: string) => {
  const date = fromDateKey(dateKey);
  return habit.schedule.days.includes(
    date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  );
};

export const buildWaterReminderDates = (
  now: Date,
  intervalMinutes: number,
  cutoff: string,
  steps = 6,
) => {
  const dates: Date[] = [];

  for (let step = 1; step <= steps; step += 1) {
    const triggerDate = addMinutes(now, intervalMinutes * step);
    if (isAfterClockTime(triggerDate, cutoff)) {
      break;
    }

    dates.push(triggerDate);
  }

  return dates;
};

export const buildHabitReminderDates = (
  habit: HabitItem,
  now: Date,
  lookaheadDays = 7,
) => {
  if (habit.archived || !habit.reminder.enabled || !habit.reminder.time) {
    return [];
  }

  return Array.from({ length: lookaheadDays + 1 }, (_, offset) =>
    toDateKey(addDays(now, offset)),
  )
    .filter((dateKey) => habitShouldRunOnDate(habit, dateKey))
    .map(
      (dateKey) => new Date(combineDateAndTime(dateKey, habit.reminder.time!)),
    )
    .filter((date) => date.getTime() > now.getTime());
};
