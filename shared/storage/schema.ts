import { z } from 'zod';

const weekdaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const hydrationEntrySchema = z.object({
  id: z.string(),
  amountMl: z.number().int().nonnegative(),
  timestamp: z.string(),
  source: z.enum(['quick', 'custom', 'manual']),
});

export const hydrationDayStateSchema = z.object({
  date: z.string(),
  consumedMl: z.number().int().nonnegative(),
  entries: z.array(hydrationEntrySchema),
  isGoalReached: z.boolean(),
  overflowMl: z.number().int().nonnegative(),
});

export const taskRepeatRuleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('none') }),
  z.object({ type: z.literal('daily') }),
  z.object({ type: z.literal('weekdays') }),
  z.object({ type: z.literal('weekly'), day: weekdaySchema }),
  z.object({ type: z.literal('custom'), days: z.array(weekdaySchema).min(1) }),
]);

export const taskItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  repeatRule: taskRepeatRuleSchema,
  categoryId: z.string(),
  dueAt: z.string(),
  completedAt: z.string().nullable().optional(),
  archived: z.boolean(),
  archivedAt: z.string().nullable(),
});

export const taskCompletionSchema = z.object({
  taskId: z.string(),
  occurrenceDate: z.string(),
  completedAt: z.string(),
});

export const taskCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  kind: z.enum(['preset', 'custom']),
  archived: z.boolean(),
});

export const habitReminderSchema = z.object({
  enabled: z.boolean(),
  time: z.string().nullable(),
});

export const habitScheduleSchema = z.object({
  days: z.array(weekdaySchema).min(1),
});

export const habitItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.enum(['sparkles', 'circle', 'leaf', 'book', 'moon']),
  accentColor: z.string(),
  goalMode: z.enum(['daily', 'weekly']),
  targetPerPeriod: z.number().int().positive(),
  schedule: habitScheduleSchema,
  archived: z.boolean(),
  archivedAt: z.string().nullable(),
  reminder: habitReminderSchema,
  completions: z.array(z.string()),
});

export const userPreferencesSchema = z.object({
  displayName: z.string(),
  dailyWaterTargetMl: z.number().int().positive(),
  quickWaterAmounts: z.array(z.number().int().positive()).min(1),
  dayStartsAt: z.string(),
  timeFormat: z.enum(['12h', '24h']),
  weekStartsOn: weekdaySchema,
  notificationsEnabled: z.boolean(),
  hasCompletedOnboarding: z.boolean(),
  hasSeenAppTour: z.boolean().default(false),
  waterReminderIntervalMinutes: z.number().int().positive().optional(),
  waterReminderCutoffTime: z.string().optional(),
  themeMode: z.enum(['system', 'light', 'dark']).default('system'),
});

export const appStateSchema = z.object({
  schemaVersion: z.literal('1'),
  hydrationToday: hydrationDayStateSchema,
  hydrationHistory: z.array(hydrationDayStateSchema),
  tasks: z.array(taskItemSchema),
  taskCompletions: z.array(taskCompletionSchema),
  taskCategories: z.array(taskCategorySchema),
  habits: z.array(habitItemSchema),
  preferences: userPreferencesSchema,
});
