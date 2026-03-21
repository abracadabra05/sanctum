import {
  addDays,
  formatTimeLabel,
  fromDateKey,
  getWeekday,
  toDateKey,
} from '@/shared/lib/date';
import type {
  HabitCardViewModel,
  HabitItem,
  TimeFormat,
} from '@/shared/types/app';

const shouldRunOnDate = (habit: HabitItem, dateKey: string) => {
  const date = fromDateKey(dateKey);
  return habit.schedule.days.includes(getWeekday(date));
};

export const calculateHabitStreak = (habit: HabitItem, today = new Date()) => {
  const completedSet = new Set(habit.completions);
  let streak = 0;

  for (let offset = 0; offset < 365; offset += 1) {
    const currentKey = toDateKey(addDays(today, -offset));
    if (!shouldRunOnDate(habit, currentKey)) {
      continue;
    }

    if (!completedSet.has(currentKey)) {
      break;
    }

    streak += 1;
  }

  return streak;
};

export const getHabitProgressLabel = (habit: HabitItem, today = new Date()) => {
  const todayKey = toDateKey(today);
  if (habit.goalMode === 'daily') {
    return habit.completions.includes(todayKey)
      ? 'Goal reached today'
      : '1 step for today';
  }

  const thisWeek = Array.from({ length: 7 }, (_, index) =>
    toDateKey(addDays(today, -index)),
  );
  const completedThisWeek = thisWeek.filter((dateKey) =>
    habit.completions.includes(dateKey),
  ).length;
  return `${completedThisWeek}/${habit.targetPerPeriod} this week`;
};

export const getHabitCards = (
  habits: HabitItem[],
  timeFormat: TimeFormat,
): HabitCardViewModel[] =>
  habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    streakDays: calculateHabitStreak(habit),
    icon: habit.icon,
    accentColor: habit.accentColor,
    progressLabel: getHabitProgressLabel(habit),
    nextReminder:
      habit.reminder.enabled && habit.reminder.time
        ? formatTimeLabel(habit.reminder.time, timeFormat)
        : null,
    isArchived: habit.archived,
  }));
