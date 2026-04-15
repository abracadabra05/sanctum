import { create } from 'zustand';

import { combineDateAndTime, toDateKey } from '@/shared/lib/date';
import { pickAndImportState } from '@/shared/services/data-transfer';
import {
  requestNotificationPermissions,
  syncHabitNotifications,
  syncWaterNotifications,
} from '@/shared/services/notifications';
import {
  importAppStatePayload,
  loadAppState,
  resetAppState,
  saveAppState,
} from '@/shared/storage/adapter';
import {
  PRESET_TASK_CATEGORIES,
  createEmptyState,
  createSeedState,
} from '@/shared/storage/seed';
import type {
  AppState,
  HabitItem,
  NotificationPreferences,
  TaskCategoryEntity,
  TaskFilter,
  TaskItem,
  TaskPriority,
  TaskRepeatRule,
  UserPreferences,
} from '@/shared/types/app';

interface CreateTaskInput {
  title: string;
  notes?: string;
  priority?: TaskPriority;
  repeatRule?: TaskRepeatRule;
  categoryId: string;
  dueDate: string;
  dueTime: string;
}

interface CreateHabitInput {
  name: string;
  icon: HabitItem['icon'];
  accentColor: string;
  goalMode: HabitItem['goalMode'];
  targetPerPeriod: number;
  schedule: HabitItem['schedule'];
  reminder: HabitItem['reminder'];
}

interface OnboardingInput {
  displayName: string;
  dailyWaterTargetMl: number;
  enableNotifications: boolean;
}

interface AppStore extends AppState {
  isReady: boolean;
  activeTaskFilter: TaskFilter;
  hydrate: () => Promise<void>;
  rolloverDayIfNeeded: () => void;
  addWater: (amountMl: number, source?: 'quick' | 'custom' | 'manual') => void;
  setDailyWaterTarget: (amountMl: number) => void;
  setQuickWaterAmounts: (amountsMl: number[]) => void;
  createTask: (input: CreateTaskInput) => void;
  updateTask: (
    id: string,
    patch: Partial<TaskItem> & { dueDate?: string; dueTime?: string },
  ) => void;
  archiveTask: (id: string) => void;
  completeTaskOccurrence: (taskId: string, occurrenceDate: string) => void;
  createTaskCategory: (
    input: Pick<TaskCategoryEntity, 'label' | 'color'>,
  ) => void;
  updateTaskCategory: (id: string, patch: Partial<TaskCategoryEntity>) => void;
  archiveTaskCategory: (id: string, fallbackCategoryId?: string) => void;
  createHabit: (input: CreateHabitInput) => void;
  updateHabit: (id: string, patch: Partial<HabitItem>) => void;
  archiveHabit: (id: string) => void;
  markHabitComplete: (id: string, date: string) => void;
  setNotificationPreferences: (input: NotificationPreferences) => Promise<void>;
  setDisplayPreferences: (
    input: Partial<
      Pick<
        UserPreferences,
        'timeFormat' | 'weekStartsOn' | 'displayName' | 'themeMode'
      >
    >,
  ) => void;
  setTaskFilter: (filter: TaskFilter) => void;
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
  setAppTourSeen: (seen: boolean) => void;
  importAppState: (payload?: unknown) => Promise<boolean>;
  resetAllData: () => Promise<void>;
}

const buildSnapshot = (state: Pick<AppStore, keyof AppState>): AppState => ({
  schemaVersion: state.schemaVersion,
  hydrationToday: state.hydrationToday,
  hydrationHistory: state.hydrationHistory,
  tasks: state.tasks,
  taskCompletions: state.taskCompletions,
  taskCategories: state.taskCategories,
  habits: state.habits,
  preferences: state.preferences,
});

const persistSnapshot = async (state: AppState) => {
  try {
    await saveAppState(state);
    await syncWaterNotifications(state);
    await syncHabitNotifications(state);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[AppStore] Failed to persist app state:', error);
  }
};

const applyHydrationDerived = (state: AppState): AppState => {
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

const ensureDayState = (state: AppState): AppState => {
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

const initialState = ensureDayState(createSeedState());

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  isReady: false,
  activeTaskFilter: 'all',
  hydrate: async () => {
    const loaded = ensureDayState(await loadAppState());
    set({ ...loaded, isReady: true, activeTaskFilter: 'all' });
    await persistSnapshot(loaded);
    // Re-schedule notifications on every app launch
    await syncWaterNotifications(loaded);
    await syncHabitNotifications(loaded);
  },
  rolloverDayIfNeeded: () => {
    set((state) => {
      const nextState = ensureDayState(buildSnapshot(state));
      if (nextState.hydrationToday.date !== state.hydrationToday.date) {
        void persistSnapshot(nextState);
      }
      return nextState;
    });
  },
  addWater: (amountMl, source = 'manual') => {
    if (amountMl <= 0) return;
    set((state) => {
      const prepared = ensureDayState(buildSnapshot(state));
      const nextState = applyHydrationDerived({
        ...prepared,
        hydrationToday: {
          ...prepared.hydrationToday,
          consumedMl: prepared.hydrationToday.consumedMl + amountMl,
          entries: [
            {
              id: `water-${Date.now()}`,
              amountMl,
              timestamp: new Date().toISOString(),
              source,
            },
            ...prepared.hydrationToday.entries,
          ],
          isGoalReached: false,
          overflowMl: 0,
        },
      });
      void persistSnapshot(nextState);
      return nextState;
    });
  },
  setDailyWaterTarget: (amountMl) => {
    if (amountMl <= 0) return;
    set((state) => {
      const nextState = applyHydrationDerived({
        ...buildSnapshot(state),
        preferences: { ...state.preferences, dailyWaterTargetMl: amountMl },
      });
      void persistSnapshot(nextState);
      return nextState;
    });
  },
  setQuickWaterAmounts: (amountsMl) => {
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        preferences: {
          ...state.preferences,
          quickWaterAmounts: amountsMl.filter((item) => item > 0).slice(0, 4),
        },
      };
      void persistSnapshot(nextState);
      return nextState;
    });
  },
  createTask: (input) => {
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        tasks: [
          {
            id: `task-${Date.now()}`,
            title: input.title,
            notes: input.notes ?? '',
            priority: input.priority ?? 'medium',
            repeatRule: input.repeatRule ?? { type: 'none' },
            categoryId: input.categoryId,
            dueAt: combineDateAndTime(input.dueDate, input.dueTime),
            completedAt: null,
            archived: false,
          },
          ...state.tasks,
        ],
      };
      void persistSnapshot(nextState);
      return nextState;
    });
  },
  updateTask: (id, patch) => {
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        tasks: state.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                ...patch,
                dueAt:
                  patch.dueDate && patch.dueTime
                    ? combineDateAndTime(patch.dueDate, patch.dueTime)
                    : task.dueAt,
              }
            : task,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    });
  },
  archiveTask: (id) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, archived: true } : task,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  completeTaskOccurrence: (taskId, occurrenceDate) =>
    set((state) => {
      const existing = state.taskCompletions.find(
        (item) =>
          item.taskId === taskId && item.occurrenceDate === occurrenceDate,
      );
      const nextState = {
        ...buildSnapshot(state),
        taskCompletions: existing
          ? state.taskCompletions.filter(
              (item) =>
                !(
                  item.taskId === taskId &&
                  item.occurrenceDate === occurrenceDate
                ),
            )
          : [
              { taskId, occurrenceDate, completedAt: new Date().toISOString() },
              ...state.taskCompletions,
            ],
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  createTaskCategory: (input) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        taskCategories: [
          ...state.taskCategories,
          {
            id: `category-${Date.now()}`,
            label: input.label,
            color: input.color,
            kind: 'custom' as const,
            archived: false,
          },
        ],
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  updateTaskCategory: (id, patch) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        taskCategories: state.taskCategories.map((category) =>
          category.id === id ? { ...category, ...patch } : category,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  archiveTaskCategory: (id, fallbackCategoryId) =>
    set((state) => {
      const fallback = fallbackCategoryId ?? PRESET_TASK_CATEGORIES[0].id;
      const nextState = {
        ...buildSnapshot(state),
        taskCategories: state.taskCategories.map((category) =>
          category.id === id ? { ...category, archived: true } : category,
        ),
        tasks: state.tasks.map((task) =>
          task.categoryId === id ? { ...task, categoryId: fallback } : task,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  createHabit: (input) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        habits: [
          {
            id: `habit-${Date.now()}`,
            name: input.name,
            icon: input.icon,
            accentColor: input.accentColor,
            goalMode: input.goalMode,
            targetPerPeriod: input.targetPerPeriod,
            schedule: input.schedule,
            archived: false,
            reminder: input.reminder,
            completions: [],
          },
          ...state.habits,
        ],
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  updateHabit: (id, patch) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        habits: state.habits.map((habit) =>
          habit.id === id ? { ...habit, ...patch } : habit,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  archiveHabit: (id) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        habits: state.habits.map((habit) =>
          habit.id === id ? { ...habit, archived: true } : habit,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  markHabitComplete: (id, date) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        habits: state.habits.map((habit) =>
          habit.id === id
            ? habit.completions.includes(date)
              ? {
                  ...habit,
                  completions: habit.completions.filter(
                    (item) => item !== date,
                  ),
                }
              : {
                  ...habit,
                  completions: [...habit.completions, date].sort().reverse(),
                }
            : habit,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  setNotificationPreferences: async (input) => {
    const granted = input.enabled
      ? await requestNotificationPermissions()
      : false;
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        preferences: {
          ...state.preferences,
          notificationsEnabled: input.enabled ? granted : false,
          waterReminderIntervalMinutes: input.waterReminderIntervalMinutes,
          waterReminderCutoffTime: input.waterReminderCutoffTime,
        },
      };
      void persistSnapshot(nextState);
      return nextState;
    });
  },
  setDisplayPreferences: (input) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        preferences: { ...state.preferences, ...input },
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  setTaskFilter: (filter) => set({ activeTaskFilter: filter }),
  completeOnboarding: async (input) => {
    const notificationsEnabled = input.enableNotifications
      ? await requestNotificationPermissions()
      : false;
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        preferences: {
          ...state.preferences,
          displayName: input.displayName,
          dailyWaterTargetMl: input.dailyWaterTargetMl,
          notificationsEnabled,
          hasCompletedOnboarding: true,
          hasSeenAppTour: false,
        },
      };
      void persistSnapshot(nextState);
      return nextState;
    });
  },
  setAppTourSeen: (seen) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        preferences: {
          ...state.preferences,
          hasSeenAppTour: seen,
        },
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  importAppState: async (payload) => {
    const imported = payload
      ? importAppStatePayload(payload)
      : await pickAndImportState();
    if (!imported) return false;
    const nextState = ensureDayState(imported);
    set({ ...nextState, isReady: true, activeTaskFilter: 'all' });
    await persistSnapshot(nextState);
    return true;
  },
  resetAllData: async () => {
    await resetAppState();
    const nextState = ensureDayState(createEmptyState());
    set({ ...nextState, isReady: true, activeTaskFilter: 'all' });
    await persistSnapshot(nextState);
  },
}));
