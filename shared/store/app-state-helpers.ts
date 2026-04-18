import { normalizeAppLanguage } from '@/shared/i18n/messages';
import { toDateKey, tryCombineDateAndTime } from '@/shared/lib/date';
import {
  syncHabitNotifications,
  syncWaterNotifications,
} from '@/shared/services/notifications';
import { saveAppState } from '@/shared/storage/adapter';
import type {
  AppState,
  HabitItem,
  TaskItem,
  UserPreferences,
} from '@/shared/types/app';

type PersistedSlices = Pick<
  AppState,
  | 'schemaVersion'
  | 'hydrationToday'
  | 'hydrationHistory'
  | 'tasks'
  | 'taskCompletions'
  | 'taskCategories'
  | 'habits'
  | 'preferences'
>;

export const buildSnapshot = (state: PersistedSlices): AppState => ({
  schemaVersion: state.schemaVersion,
  hydrationToday: state.hydrationToday,
  hydrationHistory: state.hydrationHistory,
  tasks: state.tasks,
  taskCompletions: state.taskCompletions,
  taskCategories: state.taskCategories,
  habits: state.habits,
  preferences: state.preferences,
});

export const persistSnapshot = async (state: AppState) => {
  try {
    await saveAppState(state);
    await syncWaterNotifications(state);
    await syncHabitNotifications(state);
  } catch (error) {
    console.error('[AppStore] Failed to persist app state:', error);
  }
};

export const applyHydrationDerived = (state: AppState): AppState => {
  const overflowMl = Math.max(
    0,
    state.hydrationToday.consumedMl - state.preferences.dailyWaterTargetMl,
  );
  return {
    ...state,
    hydrationToday: {
      ...state.hydrationToday,
      isGoalReached:
        state.hydrationToday.consumedMl >= state.preferences.dailyWaterTargetMl,
      overflowMl,
    },
  };
};

export const ensureDayState = (state: AppState): AppState => {
  const todayKey = toDateKey(new Date());
  if (state.hydrationToday.date === todayKey) {
    return applyHydrationDerived(state);
  }

  const previousDay = applyHydrationDerived(state).hydrationToday;
  return {
    ...state,
    hydrationHistory: [
      previousDay,
      ...state.hydrationHistory.filter(
        (item) => item.date !== previousDay.date,
      ),
    ],
    hydrationToday: {
      date: todayKey,
      consumedMl: 0,
      entries: [],
      isGoalReached: false,
      overflowMl: 0,
    },
  };
};

export const buildDueAt = (dueDate: string, dueTime: string) =>
  tryCombineDateAndTime(dueDate, dueTime);

export const normalizeQuickWaterAmounts = (amounts: number[]) =>
  amounts.filter((item) => item > 0).slice(0, 4);

export const normalizeTaskPatch = (
  task: TaskItem,
  patch: Partial<TaskItem> & { dueDate?: string; dueTime?: string },
) => {
  const nextDueAt =
    patch.dueDate && patch.dueTime
      ? buildDueAt(patch.dueDate, patch.dueTime)
      : task.dueAt;

  if (!nextDueAt) {
    return null;
  }

  return {
    ...task,
    ...patch,
    dueAt: nextDueAt,
  };
};

export const normalizeTaskCreateInput = (
  input: Pick<
    TaskItem,
    'title' | 'notes' | 'priority' | 'repeatRule' | 'categoryId'
  > & {
    dueDate: string;
    dueTime: string;
  },
) => {
  const dueAt = buildDueAt(input.dueDate, input.dueTime);
  if (!dueAt || !input.title.trim() || !input.categoryId.trim()) {
    return null;
  }

  return {
    ...input,
    title: input.title.trim(),
    notes: input.notes.trim(),
    dueAt,
  };
};

export const normalizeHabitPatch = (patch: Partial<HabitItem>) => {
  if (patch.targetPerPeriod !== undefined && patch.targetPerPeriod <= 0) {
    return null;
  }

  if (patch.schedule && patch.schedule.days.length === 0) {
    return null;
  }

  if (
    patch.reminder?.enabled &&
    (!patch.reminder.time || !/^\d{2}:\d{2}$/.test(patch.reminder.time))
  ) {
    return null;
  }

  return patch;
};

export const normalizeDisplayPreferences = (
  current: UserPreferences,
  input: Partial<
    Pick<
      UserPreferences,
      'timeFormat' | 'weekStartsOn' | 'displayName' | 'themeMode' | 'language'
    >
  >,
) => ({
  ...current,
  ...input,
  language:
    input.language !== undefined
      ? normalizeAppLanguage(input.language)
      : current.language,
  displayName: input.displayName?.trim() || current.displayName,
});
