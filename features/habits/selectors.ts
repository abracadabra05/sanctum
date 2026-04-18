import {
  DEFAULT_APP_LANGUAGE,
  getLocale,
  translate,
  type AppLanguage,
} from '@/shared/i18n/messages';
import {
  addDays,
  formatDateKeyLabel,
  formatTimeLabel,
  formatWeekdayLabel,
  fromDateKey,
  getOrderedWeekdays,
  getWeekday,
  toDateKey,
} from '@/shared/lib/date';
import type {
  HabitCardViewModel,
  HabitDetailViewModel,
  HabitItem,
  TimeFormat,
} from '@/shared/types/app';

const shouldRunOnDate = (habit: HabitItem, dateKey: string) => {
  return habit.schedule.days.includes(getWeekday(fromDateKey(dateKey)));
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

export const getHabitProgressLabel = (
  habit: HabitItem,
  today = new Date(),
  language: AppLanguage = DEFAULT_APP_LANGUAGE,
) => {
  const todayKey = toDateKey(today);
  if (habit.goalMode === 'daily') {
    return habit.completions.includes(todayKey)
      ? translate(language, 'habit.progress.dailyDone')
      : translate(language, 'habit.progress.dailyOpen');
  }

  const thisWeek = Array.from({ length: 7 }, (_, index) =>
    toDateKey(addDays(today, -index)),
  );
  const completedThisWeek = thisWeek.filter((dateKey) =>
    habit.completions.includes(dateKey),
  ).length;
  return translate(language, 'habit.progress.weekly', {
    completed: completedThisWeek,
    target: habit.targetPerPeriod,
  });
};

export const getHabitCards = (
  habits: HabitItem[],
  timeFormat: TimeFormat,
  language: AppLanguage = DEFAULT_APP_LANGUAGE,
): HabitCardViewModel[] =>
  habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    streakDays: calculateHabitStreak(habit),
    icon: habit.icon,
    accentColor: habit.accentColor,
    progressLabel: getHabitProgressLabel(habit, new Date(), language),
    nextReminder:
      habit.reminder.enabled && habit.reminder.time
        ? formatTimeLabel(habit.reminder.time, timeFormat, getLocale(language))
        : null,
    isArchived: habit.archived,
  }));

export const getHabitScheduleLabel = (
  habit: HabitItem,
  language: AppLanguage = DEFAULT_APP_LANGUAGE,
) => {
  const locale = getLocale(language);
  const orderedDays = getOrderedWeekdays(1);
  const labels = orderedDays
    .filter((day) => habit.schedule.days.includes(day))
    .map((day) => formatWeekdayLabel(day, 'short', locale));

  return labels.join(', ');
};

export const getHabitDetail = (
  habit: HabitItem,
  timeFormat: TimeFormat,
  today = new Date(),
  language: AppLanguage = DEFAULT_APP_LANGUAGE,
): HabitDetailViewModel => {
  const todayKey = toDateKey(today);
  const locale = getLocale(language);
  const recentHistory = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, -index);
    const dateKey = toDateKey(date);
    return {
      date: dateKey,
      label:
        index === 0
          ? translate(language, 'common.today')
          : formatDateKeyLabel(dateKey, {
              includeWeekday: true,
              locale,
            }),
      isCompleted: habit.completions.includes(dateKey),
    };
  });

  return {
    ...getHabitCards([habit], timeFormat, language)[0],
    scheduleLabel: getHabitScheduleLabel(habit, language),
    weeklySummary:
      habit.goalMode === 'weekly'
        ? translate(language, 'habit.detail.weeklyGoal', {
            target: habit.targetPerPeriod,
          })
        : translate(language, 'habit.detail.dailyGoal'),
    isCompletedToday: habit.completions.includes(todayKey),
    recentHistory,
  };
};
