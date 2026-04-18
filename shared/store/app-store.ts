import { create } from 'zustand';

import { isValidTimeValue } from '@/shared/lib/date';
import { pickAndImportState } from '@/shared/services/data-transfer';
import { requestNotificationPermissions } from '@/shared/services/notifications';
import {
  importAppStatePayload,
  loadAppState,
  resetAppState,
} from '@/shared/storage/adapter';
import { PRESET_TASK_CATEGORIES, createSeedState } from '@/shared/storage/seed';
import {
  applyHydrationDerived,
  buildSnapshot,
  ensureDayState,
  normalizeDisplayPreferences,
  normalizeHabitPatch,
  normalizeQuickWaterAmounts,
  normalizeTaskCreateInput,
  normalizeTaskPatch,
  persistSnapshot,
} from '@/shared/store/app-state-helpers';
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
  restoreTask: (id: string) => void;
  completeTaskOccurrence: (taskId: string, occurrenceDate: string) => void;
  createTaskCategory: (
    input: Pick<TaskCategoryEntity, 'label' | 'color'>,
  ) => void;
  updateTaskCategory: (id: string, patch: Partial<TaskCategoryEntity>) => void;
  archiveTaskCategory: (id: string, fallbackCategoryId?: string) => void;
  restoreTaskCategory: (id: string) => void;
  createHabit: (input: CreateHabitInput) => void;
  updateHabit: (id: string, patch: Partial<HabitItem>) => void;
  archiveHabit: (id: string) => void;
  restoreHabit: (id: string) => void;
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

const initialState = ensureDayState(createSeedState());

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  isReady: false,
  activeTaskFilter: 'all',
  hydrate: async () => {
    const loaded = ensureDayState(await loadAppState());
    set({ ...loaded, isReady: true, activeTaskFilter: 'all' });
    await persistSnapshot(loaded);
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
          quickWaterAmounts: normalizeQuickWaterAmounts(amountsMl),
        },
      };
      void persistSnapshot(nextState);
      return nextState;
    });
  },
  createTask: (input) => {
    const normalizedTask = normalizeTaskCreateInput({
      title: input.title,
      notes: input.notes ?? '',
      priority: input.priority ?? 'medium',
      repeatRule: input.repeatRule ?? { type: 'none' },
      categoryId: input.categoryId,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
    });

    if (!normalizedTask) {
      return;
    }

    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        tasks: [
          {
            id: `task-${Date.now()}`,
            title: normalizedTask.title,
            notes: normalizedTask.notes,
            priority: normalizedTask.priority,
            repeatRule: normalizedTask.repeatRule,
            categoryId: normalizedTask.categoryId,
            dueAt: normalizedTask.dueAt,
            completedAt: null,
            archived: false,
            archivedAt: null,
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
          task.id === id ? (normalizeTaskPatch(task, patch) ?? task) : task,
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
          task.id === id
            ? {
                ...task,
                archived: true,
                archivedAt: task.archivedAt ?? new Date().toISOString(),
              }
            : task,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  restoreTask: (id) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, archived: false, archivedAt: null }
            : task,
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
            label: input.label.trim(),
            color: input.color,
            kind: 'custom' as const,
            archived: false,
            archivedAt: null,
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
      if (!fallback || fallback === id) {
        return state;
      }

      const nextState = {
        ...buildSnapshot(state),
        taskCategories: state.taskCategories.map((category) =>
          category.id === id
            ? {
                ...category,
                archived: true,
                archivedAt: category.archivedAt ?? new Date().toISOString(),
              }
            : category,
        ),
        tasks: state.tasks.map((task) =>
          task.categoryId === id ? { ...task, categoryId: fallback } : task,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  restoreTaskCategory: (id) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        taskCategories: state.taskCategories.map((category) =>
          category.id === id
            ? { ...category, archived: false, archivedAt: null }
            : category,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  createHabit: (input) =>
    set((state) => {
      if (
        !input.name.trim() ||
        input.targetPerPeriod <= 0 ||
        input.schedule.days.length === 0 ||
        (input.reminder.enabled &&
          (!input.reminder.time || !isValidTimeValue(input.reminder.time)))
      ) {
        return state;
      }

      const nextState = {
        ...buildSnapshot(state),
        habits: [
          {
            id: `habit-${Date.now()}`,
            name: input.name.trim(),
            icon: input.icon,
            accentColor: input.accentColor,
            goalMode: input.goalMode,
            targetPerPeriod: input.targetPerPeriod,
            schedule: input.schedule,
            archived: false,
            archivedAt: null,
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
      const normalizedPatch = normalizeHabitPatch(patch);
      if (!normalizedPatch) {
        return state;
      }

      const nextState = {
        ...buildSnapshot(state),
        habits: state.habits.map((habit) =>
          habit.id === id
            ? {
                ...habit,
                ...normalizedPatch,
                name: normalizedPatch.name?.trim() ?? habit.name,
              }
            : habit,
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
          habit.id === id
            ? {
                ...habit,
                archived: true,
                archivedAt: habit.archivedAt ?? new Date().toISOString(),
              }
            : habit,
        ),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  restoreHabit: (id) =>
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        habits: state.habits.map((habit) =>
          habit.id === id
            ? { ...habit, archived: false, archivedAt: null }
            : habit,
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
    if (
      input.waterReminderIntervalMinutes <= 0 ||
      !isValidTimeValue(input.waterReminderCutoffTime)
    ) {
      return;
    }

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
        preferences: normalizeDisplayPreferences(state.preferences, input),
      };
      void persistSnapshot(nextState);
      return nextState;
    }),
  setTaskFilter: (filter) => set({ activeTaskFilter: filter }),
  completeOnboarding: async (input) => {
    if (!input.displayName.trim() || input.dailyWaterTargetMl <= 0) {
      return;
    }

    const notificationsEnabled = input.enableNotifications
      ? await requestNotificationPermissions()
      : false;
    set((state) => {
      const nextState = {
        ...buildSnapshot(state),
        preferences: {
          ...state.preferences,
          displayName: input.displayName.trim(),
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
    const nextState = ensureDayState(createSeedState());
    set({ ...nextState, isReady: true, activeTaskFilter: 'all' });
    await persistSnapshot(nextState);
  },
}));
