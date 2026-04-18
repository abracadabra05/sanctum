import { toDateKey } from '@/shared/lib/date';
import type { AppState, TaskCategoryEntity } from '@/shared/types/app';

const now = new Date();
const todayKey = toDateKey(now);

export const PRESET_TASK_CATEGORIES: TaskCategoryEntity[] = [
  {
    id: 'work',
    label: 'Work',
    color: '#E5EAF1',
    kind: 'preset',
    archived: false,
    archivedAt: null,
  },
  {
    id: 'personal',
    label: 'Personal',
    color: '#E9EDF3',
    kind: 'preset',
    archived: false,
    archivedAt: null,
  },
  {
    id: 'health',
    label: 'Health',
    color: '#F7DCE9',
    kind: 'preset',
    archived: false,
    archivedAt: null,
  },
  {
    id: 'study',
    label: 'Study',
    color: '#E7F3DE',
    kind: 'preset',
    archived: false,
    archivedAt: null,
  },
  {
    id: 'home',
    label: 'Home',
    color: '#DDEBFF',
    kind: 'preset',
    archived: false,
    archivedAt: null,
  },
];

export const createSeedState = (): AppState => ({
  schemaVersion: '1',
  hydrationToday: {
    date: todayKey,
    consumedMl: 0,
    entries: [],
    isGoalReached: false,
    overflowMl: 0,
  },
  hydrationHistory: [],
  taskCategories: [...PRESET_TASK_CATEGORIES],
  tasks: [],
  taskCompletions: [],
  habits: [],
  preferences: {
    displayName: 'Astra',
    dailyWaterTargetMl: 2500,
    quickWaterAmounts: [250, 500, 750],
    dayStartsAt: '00:00',
    timeFormat: '12h',
    weekStartsOn: 1,
    notificationsEnabled: false,
    hasCompletedOnboarding: false,
    hasSeenAppTour: false,
    waterReminderIntervalMinutes: 90,
    waterReminderCutoffTime: '22:00',
    themeMode: 'system',
  },
});
