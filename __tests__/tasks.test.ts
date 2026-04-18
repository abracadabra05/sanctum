import {
  buildTaskSections,
  getTaskCompletion,
} from '@/features/tasks/selectors';
import type {
  TaskCategoryEntity,
  TaskCompletion,
  TaskItem,
} from '@/shared/types/app';

const tasks: TaskItem[] = [
  {
    id: '1',
    title: 'Overdue task',
    notes: '',
    priority: 'high',
    repeatRule: { type: 'none' },
    categoryId: 'work',
    dueAt: '2026-03-20T10:00:00.000Z',
    completedAt: null,
    archived: false,
    archivedAt: null,
  },
  {
    id: '2',
    title: 'Today task',
    notes: '',
    priority: 'medium',
    repeatRule: { type: 'none' },
    categoryId: 'health',
    dueAt: '2026-03-21T18:00:00.000Z',
    completedAt: null,
    archived: false,
    archivedAt: null,
  },
  {
    id: '3',
    title: 'Done task',
    notes: '',
    priority: 'low',
    repeatRule: { type: 'daily' },
    categoryId: 'personal',
    dueAt: '2026-03-21T08:00:00.000Z',
    completedAt: null,
    archived: false,
    archivedAt: null,
  },
  {
    id: '4',
    title: 'Future task',
    notes: '',
    priority: 'medium',
    repeatRule: { type: 'none' },
    categoryId: 'work',
    dueAt: '2026-03-22T08:00:00.000Z',
    completedAt: null,
    archived: false,
    archivedAt: null,
  },
];

const categories: TaskCategoryEntity[] = [
  {
    id: 'work',
    label: 'Work',
    color: '#EEE',
    kind: 'preset',
    archived: false,
    archivedAt: null,
  },
  {
    id: 'health',
    label: 'Health',
    color: '#EEE',
    kind: 'preset',
    archived: false,
    archivedAt: null,
  },
  {
    id: 'personal',
    label: 'Personal',
    color: '#EEE',
    kind: 'preset',
    archived: false,
    archivedAt: null,
  },
];

const completions: TaskCompletion[] = [
  {
    taskId: '3',
    occurrenceDate: '2026-03-21',
    completedAt: '2026-03-21T08:05:00.000Z',
  },
];

describe('task selectors', () => {
  it('groups tasks into sections', () => {
    const sections = buildTaskSections({
      tasks,
      filter: 'all',
      completions,
      categories,
      timeFormat: '12h',
      today: new Date('2026-03-21T12:00:00.000Z'),
    });
    expect(sections.map((section) => section.id)).toEqual([
      'overdue',
      'today',
      'agenda',
      'completed',
    ]);
  });

  it('filters by category id', () => {
    const sections = buildTaskSections({
      tasks,
      filter: 'work',
      completions,
      categories,
      timeFormat: '12h',
      today: new Date('2026-03-21T12:00:00.000Z'),
    });
    expect(
      sections
        .flatMap((section) => section.tasks)
        .every((item) => item.task.categoryId === 'work'),
    ).toBe(true);
  });

  it('calculates completion percentage for a date', () => {
    expect(getTaskCompletion(tasks, completions, '2026-03-21')).toBe(50);
  });
});
