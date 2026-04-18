import {
  buildHabitDraftFromHabit,
  buildTaskDraftFromTask,
  getDraftErrors,
  validateHabitDraft,
  validateTaskDraft,
} from '@/shared/lib/planning-forms';
import type { HabitItem, TaskItem } from '@/shared/types/app';

describe('planning forms', () => {
  it('rejects invalid task draft values', () => {
    const result = validateTaskDraft({
      title: '   ',
      notes: '',
      categoryId: '',
      dueDate: '2026-02-31',
      dueTime: '24:00',
      priority: 'medium',
      repeatRule: { type: 'none' },
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected invalid task draft.');
    }

    const errors = getDraftErrors(result.error.issues);
    expect(errors.title).toBe('Task title is required.');
    expect(errors.categoryId).toBe('Choose a category.');
    expect(errors.dueDate).toBe('Choose a valid date.');
    expect(errors.dueTime).toBe('Choose a valid time.');
  });

  it('rejects invalid habit draft values', () => {
    const result = validateHabitDraft({
      name: ' ',
      icon: 'sparkles',
      accentColor: '#CFF4F1',
      goalMode: 'daily',
      targetPerPeriod: '0',
      schedule: [],
      reminderEnabled: true,
      reminderTime: '99:00',
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected invalid habit draft.');
    }

    const errors = getDraftErrors(result.error.issues);
    expect(errors.name).toBe('Habit name is required.');
    expect(errors.targetPerPeriod).toBe(
      'Target must be a positive whole number.',
    );
    expect(errors.schedule).toBe('Choose at least one day.');
    expect(errors.reminderTime).toBe('Choose a valid reminder time.');
  });

  it('builds task drafts from existing tasks', () => {
    const task: TaskItem = {
      id: 'task-1',
      title: 'Review release checklist',
      notes: 'Verify Android export',
      priority: 'high',
      repeatRule: { type: 'weekly', day: 1 },
      categoryId: 'work',
      dueAt: new Date(2026, 3, 20, 9, 15, 0).toISOString(),
      completedAt: null,
      archived: false,
      archivedAt: null,
    };

    expect(buildTaskDraftFromTask(task)).toMatchObject({
      title: 'Review release checklist',
      categoryId: 'work',
      dueTime: '09:15',
      repeatRule: { type: 'weekly', day: 1 },
    });
  });

  it('builds habit drafts from existing habits', () => {
    const habit: HabitItem = {
      id: 'habit-1',
      name: 'Stretch',
      icon: 'leaf',
      accentColor: '#DCEEFF',
      goalMode: 'weekly',
      targetPerPeriod: 3,
      schedule: { days: [1, 3, 5] },
      archived: false,
      archivedAt: null,
      reminder: { enabled: true, time: '08:30' },
      completions: ['2026-04-14'],
    };

    expect(buildHabitDraftFromHabit(habit)).toMatchObject({
      name: 'Stretch',
      goalMode: 'weekly',
      targetPerPeriod: '3',
      schedule: [1, 3, 5],
      reminderEnabled: true,
      reminderTime: '08:30',
    });
  });
});
