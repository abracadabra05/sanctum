import type { Weekday } from '@/shared/lib/date';
import type { ThemeMode } from '@/shared/theme';

export type SchemaVersion = '1';
export type TimeFormat = '12h' | '24h';
export type CategoryKind = 'preset' | 'custom';
export type HydrationEntrySource = 'quick' | 'custom' | 'manual';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskFilter = 'all' | 'completed' | 'overdue' | string;
export type HabitGoalMode = 'daily' | 'weekly';

export type TaskRepeatRule =
  | { type: 'none' }
  | { type: 'daily' }
  | { type: 'weekdays' }
  | { type: 'weekly'; day: Weekday }
  | { type: 'custom'; days: Weekday[] };

export interface HydrationEntry {
  id: string;
  amountMl: number;
  timestamp: string;
  source: HydrationEntrySource;
}

export interface HydrationDayState {
  date: string;
  consumedMl: number;
  entries: HydrationEntry[];
  isGoalReached: boolean;
  overflowMl: number;
}

export interface TaskCategoryEntity {
  id: string;
  label: string;
  color: string;
  kind: CategoryKind;
  archived: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  notes: string;
  priority: TaskPriority;
  repeatRule: TaskRepeatRule;
  categoryId: string;
  dueAt: string;
  completedAt?: string | null;
  archived: boolean;
}

export interface TaskCompletion {
  taskId: string;
  occurrenceDate: string;
  completedAt: string;
}

export interface HabitSchedule {
  days: Weekday[];
}

export interface HabitReminder {
  enabled: boolean;
  time: string | null;
}

export interface HabitItem {
  id: string;
  name: string;
  icon: 'sparkles' | 'circle' | 'leaf' | 'book' | 'moon';
  accentColor: string;
  goalMode: HabitGoalMode;
  targetPerPeriod: number;
  schedule: HabitSchedule;
  archived: boolean;
  reminder: HabitReminder;
  completions: string[];
}

export interface NotificationPreferences {
  enabled: boolean;
  waterReminderIntervalMinutes: number;
  waterReminderCutoffTime: string;
}

export interface UserPreferences {
  displayName: string;
  dailyWaterTargetMl: number;
  quickWaterAmounts: number[];
  dayStartsAt: string;
  timeFormat: TimeFormat;
  weekStartsOn: Weekday;
  notificationsEnabled: boolean;
  hasCompletedOnboarding: boolean;
  hasSeenAppTour: boolean;
  waterReminderIntervalMinutes?: number;
  waterReminderCutoffTime?: string;
  themeMode: ThemeMode;
}

export interface AppState {
  schemaVersion: SchemaVersion;
  hydrationToday: HydrationDayState;
  hydrationHistory: HydrationDayState[];
  tasks: TaskItem[];
  taskCompletions: TaskCompletion[];
  taskCategories: TaskCategoryEntity[];
  habits: HabitItem[];
  preferences: UserPreferences;
}

export interface HydrationProgressViewModel {
  consumedMl: number;
  targetMl: number;
  percentage: number;
  overflowMl: number;
  isGoalReached: boolean;
  hasExceededGoal: boolean;
}

export interface TaskOccurrenceViewModel {
  occurrenceDate: string;
  displayTime: string;
  isCompleted: boolean;
}

export interface TaskListItemViewModel {
  task: TaskItem;
  category: TaskCategoryEntity;
  occurrence: TaskOccurrenceViewModel;
  searchText?: string;
}

export interface TaskListSection {
  id: 'completed' | 'overdue' | 'today' | 'upcoming';
  title: string;
  accentColor: string;
  tasks: TaskListItemViewModel[];
}

export interface HabitCardViewModel {
  id: string;
  name: string;
  streakDays: number;
  icon: HabitItem['icon'];
  accentColor: string;
  progressLabel: string;
  nextReminder: string | null;
  isArchived: boolean;
}

export interface ExportedAppState extends AppState {
  schemaVersion: '1';
}
