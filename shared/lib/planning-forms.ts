import { z } from 'zod';

import {
  extractLocalTime,
  isValidDateKey,
  isValidTimeValue,
  shiftDateKey,
  toDateKey,
} from '@/shared/lib/date';
import type {
  HabitItem,
  TaskItem,
  TaskPriority,
  TaskRepeatRule,
} from '@/shared/types/app';

export interface TaskDraft {
  title: string;
  notes: string;
  categoryId: string;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  repeatRule: TaskRepeatRule;
}

export interface HabitDraft {
  name: string;
  icon: HabitItem['icon'];
  accentColor: string;
  goalMode: HabitItem['goalMode'];
  targetPerPeriod: string;
  schedule: number[];
  reminderEnabled: boolean;
  reminderTime: string;
}

export const taskRepeatOptions: { label: string; value: TaskRepeatRule }[] = [
  { label: 'None', value: { type: 'none' } },
  { label: 'Daily', value: { type: 'daily' } },
  { label: 'Weekdays', value: { type: 'weekdays' } },
  { label: 'Weekly', value: { type: 'weekly', day: 1 } },
  { label: 'Custom', value: { type: 'custom', days: [1, 3, 5] } },
];

export const taskTimePresets = ['08:00', '12:00', '18:00', '21:00'];
export const reminderTimePresets = ['07:30', '12:30', '18:30', '21:00'];

export const createTaskDraft = (categoryId: string): TaskDraft => ({
  title: '',
  notes: '',
  categoryId,
  dueDate: toDateKey(new Date()),
  dueTime: '18:00',
  priority: 'medium',
  repeatRule: { type: 'none' },
});

export const buildTaskDraftFromTask = (task: TaskItem): TaskDraft => {
  const due = new Date(task.dueAt);
  return {
    title: task.title,
    notes: task.notes,
    categoryId: task.categoryId,
    dueDate: toDateKey(due),
    dueTime: extractLocalTime(task.dueAt),
    priority: task.priority,
    repeatRule: task.repeatRule,
  };
};

export const createHabitDraft = (): HabitDraft => ({
  name: '',
  icon: 'sparkles',
  accentColor: '#CFF4F1',
  goalMode: 'daily',
  targetPerPeriod: '1',
  schedule: [1, 2, 3, 4, 5],
  reminderEnabled: false,
  reminderTime: '20:00',
});

export const buildHabitDraftFromHabit = (habit: HabitItem): HabitDraft => ({
  name: habit.name,
  icon: habit.icon,
  accentColor: habit.accentColor,
  goalMode: habit.goalMode,
  targetPerPeriod: String(habit.targetPerPeriod),
  schedule: [...habit.schedule.days],
  reminderEnabled: habit.reminder.enabled,
  reminderTime: habit.reminder.time ?? '20:00',
});

export const taskDraftSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required.'),
  notes: z.string(),
  categoryId: z.string().trim().min(1, 'Choose a category.'),
  dueDate: z.string().refine(isValidDateKey, 'Choose a valid date.'),
  dueTime: z.string().refine(isValidTimeValue, 'Choose a valid time.'),
  priority: z.enum(['low', 'medium', 'high']),
  repeatRule: z.discriminatedUnion('type', [
    z.object({ type: z.literal('none') }),
    z.object({ type: z.literal('daily') }),
    z.object({ type: z.literal('weekdays') }),
    z.object({
      type: z.literal('weekly'),
      day: z.number().int().min(0).max(6),
    }),
    z.object({
      type: z.literal('custom'),
      days: z.array(z.number().int().min(0).max(6)).min(1),
    }),
  ]),
});

export const habitDraftSchema = z
  .object({
    name: z.string().trim().min(1, 'Habit name is required.'),
    icon: z.enum(['sparkles', 'circle', 'leaf', 'book', 'moon']),
    accentColor: z.string().trim().min(1),
    goalMode: z.enum(['daily', 'weekly']),
    targetPerPeriod: z.string().trim(),
    schedule: z
      .array(z.number().int().min(0).max(6))
      .min(1, 'Choose at least one day.'),
    reminderEnabled: z.boolean(),
    reminderTime: z.string(),
  })
  .superRefine((draft, context) => {
    const target = Number(draft.targetPerPeriod);
    if (!Number.isInteger(target) || target <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Target must be a positive whole number.',
        path: ['targetPerPeriod'],
      });
    }

    if (draft.reminderEnabled && !isValidTimeValue(draft.reminderTime)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose a valid reminder time.',
        path: ['reminderTime'],
      });
    }
  });

export const validateTaskDraft = (draft: TaskDraft) =>
  taskDraftSchema.safeParse(draft);

export const validateHabitDraft = (draft: HabitDraft) =>
  habitDraftSchema.safeParse(draft);

export const getDraftErrors = (
  issues: { path: (string | number)[]; message: string }[],
) =>
  issues.reduce<Record<string, string>>((accumulator, issue) => {
    const key = String(issue.path[0] ?? 'form');
    if (!accumulator[key]) {
      accumulator[key] = issue.message;
    }
    return accumulator;
  }, {});

export const getTaskDatePresets = () => {
  const today = toDateKey(new Date());
  return [
    { label: 'Today', value: today },
    { label: 'Tomorrow', value: shiftDateKey(today, 1) },
    { label: 'In 3 days', value: shiftDateKey(today, 3) },
  ];
};
