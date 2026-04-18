import { z } from 'zod';

import {
  DEFAULT_APP_LANGUAGE,
  translate,
  type AppLanguage,
} from '@/shared/i18n/messages';
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

export const getTaskRepeatOptions = (
  language: AppLanguage = DEFAULT_APP_LANGUAGE,
): { label: string; value: TaskRepeatRule }[] => [
  { label: translate(language, 'task.repeat.none'), value: { type: 'none' } },
  { label: translate(language, 'task.repeat.daily'), value: { type: 'daily' } },
  {
    label: translate(language, 'task.repeat.weekdays'),
    value: { type: 'weekdays' },
  },
  {
    label: translate(language, 'task.repeat.weekly'),
    value: { type: 'weekly', day: 1 },
  },
  {
    label: translate(language, 'task.repeat.custom'),
    value: { type: 'custom', days: [1, 3, 5] },
  },
];

export const taskRepeatOptions = getTaskRepeatOptions();

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

const createTaskDraftSchema = (language: AppLanguage = DEFAULT_APP_LANGUAGE) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(1, translate(language, 'planning.task.titleRequired')),
    notes: z.string(),
    categoryId: z
      .string()
      .trim()
      .min(1, translate(language, 'planning.task.categoryRequired')),
    dueDate: z
      .string()
      .refine(isValidDateKey, translate(language, 'planning.task.dateInvalid')),
    dueTime: z
      .string()
      .refine(
        isValidTimeValue,
        translate(language, 'planning.task.timeInvalid'),
      ),
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

const createHabitDraftSchema = (language: AppLanguage = DEFAULT_APP_LANGUAGE) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, translate(language, 'planning.habit.nameRequired')),
      icon: z.enum(['sparkles', 'circle', 'leaf', 'book', 'moon']),
      accentColor: z.string().trim().min(1),
      goalMode: z.enum(['daily', 'weekly']),
      targetPerPeriod: z.string().trim(),
      schedule: z
        .array(z.number().int().min(0).max(6))
        .min(1, translate(language, 'planning.habit.scheduleRequired')),
      reminderEnabled: z.boolean(),
      reminderTime: z.string(),
    })
    .superRefine((draft, context) => {
      const target = Number(draft.targetPerPeriod);
      if (!Number.isInteger(target) || target <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: translate(language, 'planning.habit.targetInvalid'),
          path: ['targetPerPeriod'],
        });
      }

      if (draft.reminderEnabled && !isValidTimeValue(draft.reminderTime)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: translate(language, 'planning.habit.reminderInvalid'),
          path: ['reminderTime'],
        });
      }
    });

export const validateTaskDraft = (
  draft: TaskDraft,
  language: AppLanguage = DEFAULT_APP_LANGUAGE,
) => createTaskDraftSchema(language).safeParse(draft);

export const validateHabitDraft = (
  draft: HabitDraft,
  language: AppLanguage = DEFAULT_APP_LANGUAGE,
) => createHabitDraftSchema(language).safeParse(draft);

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

export const getTaskDatePresets = (
  language: AppLanguage = DEFAULT_APP_LANGUAGE,
) => {
  const today = toDateKey(new Date());
  return [
    { label: translate(language, 'common.today'), value: today },
    {
      label: translate(language, 'common.tomorrow'),
      value: shiftDateKey(today, 1),
    },
    {
      label: language === 'ru' ? 'Через 3 дня' : 'In 3 days',
      value: shiftDateKey(today, 3),
    },
  ];
};
