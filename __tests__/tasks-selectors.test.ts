import {
  buildTaskSections,
  doesTaskOccurOnDate,
  filterTaskListByQuery,
  getOutstandingTasksForDate,
  getTaskCompletion,
  getTaskCompletionRecord,
} from '@/features/tasks/selectors';
import type {
  TaskCategoryEntity,
  TaskCompletion,
  TaskItem,
} from '@/shared/types/app';

describe('task selectors', () => {
  const categories: TaskCategoryEntity[] = [
    {
      id: 'work',
      label: 'Work',
      color: '#E5EAF1',
      kind: 'preset',
      archived: false,
      archivedAt: null,
    },
  ];

  const today = new Date('2026-04-10T12:00:00.000Z');
  const todayKey = '2026-04-10';

  describe('doesTaskOccurOnDate', () => {
    it('matches one-time task on due date', () => {
      const task: TaskItem = {
        id: 't1',
        title: 'One-time',
        notes: '',
        priority: 'medium',
        repeatRule: { type: 'none' },
        categoryId: 'work',
        dueAt: '2026-04-10T10:00:00.000Z',
        completedAt: null,
        archived: false,
        archivedAt: null,
      };
      expect(doesTaskOccurOnDate(task, '2026-04-10')).toBe(true);
      expect(doesTaskOccurOnDate(task, '2026-04-11')).toBe(false);
    });

    it('matches daily task on any date after due', () => {
      const task: TaskItem = {
        id: 't1',
        title: 'Daily',
        notes: '',
        priority: 'medium',
        repeatRule: { type: 'daily' },
        categoryId: 'work',
        dueAt: '2026-04-08T10:00:00.000Z',
        completedAt: null,
        archived: false,
        archivedAt: null,
      };
      expect(doesTaskOccurOnDate(task, '2026-04-09')).toBe(true);
      expect(doesTaskOccurOnDate(task, '2026-04-10')).toBe(true);
    });

    it('matches weekdays task on weekday', () => {
      const task: TaskItem = {
        id: 't1',
        title: 'Weekdays',
        notes: '',
        priority: 'medium',
        repeatRule: { type: 'weekdays' },
        categoryId: 'work',
        dueAt: '2026-04-06T10:00:00.000Z', // Monday
        completedAt: null,
        archived: false,
        archivedAt: null,
      };
      // 2026-04-10 is Friday (weekday)
      expect(doesTaskOccurOnDate(task, '2026-04-10')).toBe(true);
      // 2026-04-12 is Sunday (not weekday)
      expect(doesTaskOccurOnDate(task, '2026-04-12')).toBe(false);
    });
  });

  describe('getTaskCompletionRecord', () => {
    const completions: TaskCompletion[] = [
      {
        taskId: 't1',
        occurrenceDate: '2026-04-10',
        completedAt: '2026-04-10T10:00:00Z',
      },
    ];

    it('returns completion when found', () => {
      const result = getTaskCompletionRecord('t1', '2026-04-10', completions);
      expect(result).toBeDefined();
    });

    it('returns undefined when not found', () => {
      const result = getTaskCompletionRecord('t1', '2026-04-11', completions);
      expect(result).toBeUndefined();
    });
  });

  describe('buildTaskSections', () => {
    const tasks: TaskItem[] = [
      {
        id: 't1',
        title: 'Today task',
        notes: '',
        priority: 'medium',
        repeatRule: { type: 'none' },
        categoryId: 'work',
        dueAt: '2026-04-10T10:00:00.000Z',
        completedAt: null,
        archived: false,
        archivedAt: null,
      },
      {
        id: 't2',
        title: 'Later task',
        notes: '',
        priority: 'low',
        repeatRule: { type: 'none' },
        categoryId: 'work',
        dueAt: '2026-04-25T10:00:00.000Z',
        completedAt: null,
        archived: false,
        archivedAt: null,
      },
    ];
    const completions: TaskCompletion[] = [];

    it('groups tasks into sections', () => {
      const sections = buildTaskSections({
        tasks,
        filter: 'all',
        completions,
        categories,
        timeFormat: '24h',
        today,
      });
      expect(sections.map((section) => section.id)).toEqual(['today', 'later']);
    });

    it('filters by completed filter', () => {
      const sections = buildTaskSections({
        tasks,
        filter: 'completed',
        completions,
        categories,
        timeFormat: '24h',
        today,
      });
      // Only completed section should appear
      expect(sections.every((s) => s.id === 'completed')).toBe(true);
    });
  });

  describe('filterTaskListByQuery', () => {
    const sections = buildTaskSections({
      tasks: [
        {
          id: 't1',
          title: 'Important meeting',
          notes: 'Discuss project',
          priority: 'high',
          repeatRule: { type: 'none' },
          categoryId: 'work',
          dueAt: '2026-04-10T10:00:00.000Z',
          completedAt: null,
          archived: false,
          archivedAt: null,
        },
      ],
      filter: 'all',
      completions: [],
      categories,
      timeFormat: '24h',
      today,
    });

    it('returns matching tasks', () => {
      const result = filterTaskListByQuery(sections, 'meeting');
      expect(result[0]?.tasks.length).toBe(1);
    });

    it('returns empty when no match', () => {
      const result = filterTaskListByQuery(sections, 'nonexistent');
      expect(result.flatMap((s) => s.tasks)).toHaveLength(0);
    });

    it('returns all sections when query is empty', () => {
      const result = filterTaskListByQuery(sections, '');
      expect(result).toEqual(sections);
    });
  });

  describe('getTaskCompletion', () => {
    it('returns 0 when no tasks', () => {
      expect(getTaskCompletion([], [], todayKey)).toBe(0);
    });

    it('returns percentage of completed tasks', () => {
      const tasks: TaskItem[] = [
        {
          id: 't1',
          title: 'Task 1',
          notes: '',
          priority: 'medium',
          repeatRule: { type: 'none' },
          categoryId: 'work',
          dueAt: '2026-04-10T10:00:00.000Z',
          completedAt: null,
          archived: false,
          archivedAt: null,
        },
        {
          id: 't2',
          title: 'Task 2',
          notes: '',
          priority: 'medium',
          repeatRule: { type: 'none' },
          categoryId: 'work',
          dueAt: '2026-04-10T12:00:00.000Z',
          completedAt: null,
          archived: false,
          archivedAt: null,
        },
      ];
      const completions: TaskCompletion[] = [
        {
          taskId: 't1',
          occurrenceDate: todayKey,
          completedAt: '2026-04-10T10:00:00Z',
        },
      ];
      expect(getTaskCompletion(tasks, completions, todayKey)).toBe(50);
    });
  });

  describe('getOutstandingTasksForDate', () => {
    it('hides completed tasks from the today selection', () => {
      const tasks: TaskItem[] = [
        {
          id: 't1',
          title: 'Already done',
          notes: '',
          priority: 'medium',
          repeatRule: { type: 'none' },
          categoryId: 'work',
          dueAt: '2026-04-10T08:00:00.000Z',
          completedAt: null,
          archived: false,
          archivedAt: null,
        },
        {
          id: 't2',
          title: 'Still open',
          notes: '',
          priority: 'medium',
          repeatRule: { type: 'none' },
          categoryId: 'work',
          dueAt: '2026-04-10T12:00:00.000Z',
          completedAt: null,
          archived: false,
          archivedAt: null,
        },
      ];

      const completions: TaskCompletion[] = [
        {
          taskId: 't1',
          occurrenceDate: todayKey,
          completedAt: '2026-04-10T08:10:00.000Z',
        },
      ];

      expect(
        getOutstandingTasksForDate(tasks, completions, todayKey).map(
          (task) => task.id,
        ),
      ).toEqual(['t2']);
    });
  });
});
