import { combineDateAndTime, toDateKey } from '@/shared/lib/date';
import { appStateSchema } from '@/shared/storage/schema';
import { PRESET_TASK_CATEGORIES, createSeedState } from '@/shared/storage/seed';
import type { AppState } from '@/shared/types/app';

const fallbackColorMap: Record<string, string> = {
  work: '#E5EAF1',
  personal: '#E9EDF3',
  health: '#F7DCE9',
};

const normalizeTaskCategories = (
  categories: unknown,
  fallback: AppState['taskCategories'],
) => {
  if (!Array.isArray(categories)) {
    return fallback;
  }

  return categories.map((category: any) => ({
    id: category.id,
    label: category.label ?? 'Category',
    color: category.color ?? '#E8EDF4',
    kind: category.kind === 'custom' ? 'custom' : 'preset',
    archived: Boolean(category.archived),
    archivedAt: category.archivedAt ?? null,
  }));
};

export const migrateToLatestAppState = (raw: unknown): AppState => {
  const parsed = appStateSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  if (!raw || typeof raw !== 'object') {
    return createSeedState();
  }

  const legacy = raw as Record<string, any>;
  if (!legacy.hydration || !legacy.preferences) {
    const seeded = createSeedState();
    const fallbackParsed = appStateSchema.safeParse({
      ...legacy,
      tasks: Array.isArray(legacy.tasks)
        ? legacy.tasks.map((task: any) => ({
            ...task,
            archivedAt:
              task.archivedAt ??
              (task.archived
                ? (task.completedAt ?? task.dueAt ?? new Date().toISOString())
                : null),
          }))
        : seeded.tasks,
      habits: Array.isArray(legacy.habits)
        ? legacy.habits.map((habit: any) => ({
            ...habit,
            archivedAt:
              habit.archivedAt ??
              (habit.archived
                ? (habit.updatedAt ?? new Date().toISOString())
                : null),
          }))
        : seeded.habits,
      taskCategories: normalizeTaskCategories(
        legacy.taskCategories,
        seeded.taskCategories,
      ),
      preferences: {
        ...seeded.preferences,
        ...(legacy.preferences ?? {}),
        themeMode: legacy.preferences?.themeMode ?? 'system',
        hasSeenAppTour: legacy.preferences?.hasSeenAppTour ?? false,
      },
    });
    return fallbackParsed.success ? fallbackParsed.data : seeded;
  }

  const todayKey = toDateKey(new Date());
  const legacyTasks = Array.isArray(legacy.tasks) ? legacy.tasks : [];
  const legacyHabits = Array.isArray(legacy.habits) ? legacy.habits : [];
  const categoryIds = new Set<string>(
    PRESET_TASK_CATEGORIES.map((category) => category.id),
  );

  legacyTasks.forEach((task) => {
    if (task?.category && typeof task.category === 'string') {
      categoryIds.add(task.category);
    }
  });

  const taskCategories = Array.from(categoryIds).map((id) => {
    const preset = PRESET_TASK_CATEGORIES.find(
      (category) => category.id === id,
    );
    return (
      preset ?? {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        color: fallbackColorMap[id] ?? '#E8EDF4',
        kind: 'custom' as const,
        archived: false,
        archivedAt: null,
      }
    );
  });

  const normalizedTaskCategories = normalizeTaskCategories(
    legacy.taskCategories,
    taskCategories,
  );

  return {
    schemaVersion: '1',
    hydrationToday: {
      date: todayKey,
      consumedMl: legacy.hydration.consumedMl ?? 0,
      entries: Array.isArray(legacy.hydration.entries)
        ? legacy.hydration.entries.map((entry: any, index: number) => ({
            id: entry.id ?? `water-${Date.now()}-${index}`,
            amountMl: entry.amountMl ?? 0,
            timestamp: entry.timestamp ?? new Date().toISOString(),
            source: 'manual' as const,
          }))
        : [],
      isGoalReached:
        (legacy.hydration.consumedMl ?? 0) >=
        (legacy.hydration.targetMl ??
          legacy.preferences.dailyWaterTargetMl ??
          2500),
      overflowMl: Math.max(
        0,
        (legacy.hydration.consumedMl ?? 0) -
          (legacy.hydration.targetMl ??
            legacy.preferences.dailyWaterTargetMl ??
            2500),
      ),
    },
    hydrationHistory: [],
    tasks: legacyTasks.map((task: any) => ({
      id: task.id,
      title: task.title ?? 'Untitled task',
      notes: '',
      priority: 'medium' as const,
      repeatRule: { type: 'none' as const },
      categoryId: task.category ?? 'personal',
      dueAt: task.dueAt ?? combineDateAndTime(todayKey, '09:00'),
      completedAt: task.status === 'done' ? new Date().toISOString() : null,
      archived: false,
      archivedAt: null,
    })),
    taskCompletions: legacyTasks
      .filter((task: any) => task.status === 'done')
      .map((task: any) => ({
        taskId: task.id,
        occurrenceDate: toDateKey(new Date(task.dueAt ?? new Date())),
        completedAt: new Date().toISOString(),
      })),
    taskCategories: normalizedTaskCategories,
    habits: legacyHabits.map((habit: any) => ({
      id: habit.id,
      name: habit.name ?? 'Habit',
      icon: habit.icon ?? 'sparkles',
      accentColor:
        habit.accent === 'pink'
          ? '#EFD7E7'
          : habit.accent === 'blue'
            ? '#DCEEFF'
            : '#CFF4F1',
      goalMode: 'daily' as const,
      targetPerPeriod: 1,
      schedule: { days: [0, 1, 2, 3, 4, 5, 6] },
      archived: false,
      archivedAt: null,
      reminder: { enabled: false, time: null },
      completions: Array.isArray(habit.completedDates)
        ? habit.completedDates
        : [],
    })),
    preferences: {
      displayName: legacy.preferences.profileName ?? 'Astra',
      dailyWaterTargetMl: legacy.hydration.targetMl ?? 2500,
      quickWaterAmounts: [250, 500, 750],
      dayStartsAt: '00:00',
      timeFormat: '12h',
      weekStartsOn: 1,
      notificationsEnabled: false,
      hasCompletedOnboarding: false,
      hasSeenAppTour: false,
      waterReminderIntervalMinutes: 90,
      waterReminderCutoffTime: '22:00',
      themeMode: legacy.preferences.themeMode ?? 'system',
    },
  };
};
