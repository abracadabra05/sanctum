import {
  compareDateKeys,
  extractLocalTime,
  formatOccurrenceLabel,
  fromDateKey,
  getWeekday,
  shiftDateKey,
  startOfDay,
  toDateKey,
} from '@/shared/lib/date';
import type {
  TaskCategoryEntity,
  TaskCompletion,
  TaskFilter,
  TaskItem,
  TaskListItemViewModel,
  TaskListSection,
  TaskSectionId,
  TimeFormat,
} from '@/shared/types/app';

const sectionOrder: TaskSectionId[] = [
  'overdue',
  'today',
  'agenda',
  'later',
  'completed',
];

const AGENDA_WINDOW_DAYS = 7;
const LOOKBACK_WINDOW_DAYS = 30;

export const doesTaskOccurOnDate = (task: TaskItem, dateKey: string) => {
  const dueDate = new Date(task.dueAt);
  const dueKey = toDateKey(dueDate);
  const targetDate = fromDateKey(dateKey);
  const dueWeekday = getWeekday(dueDate);
  const targetWeekday = getWeekday(targetDate);

  switch (task.repeatRule.type) {
    case 'none':
      return dueKey === dateKey;
    case 'daily':
      return targetDate.getTime() >= startOfDay(dueDate).getTime();
    case 'weekdays':
      return (
        targetDate.getTime() >= startOfDay(dueDate).getTime() &&
        targetWeekday >= 1 &&
        targetWeekday <= 5
      );
    case 'weekly':
      return (
        targetDate.getTime() >= startOfDay(dueDate).getTime() &&
        task.repeatRule.day === targetWeekday
      );
    case 'custom':
      return (
        targetDate.getTime() >= startOfDay(dueDate).getTime() &&
        task.repeatRule.days.includes(targetWeekday)
      );
    default:
      return dueWeekday === targetWeekday;
  }
};

export const getTaskCompletionRecord = (
  taskId: string,
  occurrenceDate: string,
  completions: TaskCompletion[],
) =>
  completions.find(
    (item) => item.taskId === taskId && item.occurrenceDate === occurrenceDate,
  );

export const getOutstandingTasksForDate = (
  tasks: TaskItem[],
  completions: TaskCompletion[],
  dateKey = toDateKey(new Date()),
) =>
  tasks.filter(
    (task) =>
      !task.archived &&
      doesTaskOccurOnDate(task, dateKey) &&
      !getTaskCompletionRecord(task.id, dateKey, completions),
  );

export const resolveTaskOccurrenceDate = (
  task: TaskItem,
  today = new Date(),
  agendaWindowDays = AGENDA_WINDOW_DAYS,
  lookbackWindowDays = LOOKBACK_WINDOW_DAYS,
) => {
  const todayKey = toDateKey(today);
  if (doesTaskOccurOnDate(task, todayKey)) {
    return todayKey;
  }

  for (let offset = 1; offset <= agendaWindowDays; offset += 1) {
    const nextKey = shiftDateKey(todayKey, offset);
    if (doesTaskOccurOnDate(task, nextKey)) {
      return nextKey;
    }
  }

  for (let offset = 1; offset <= lookbackWindowDays; offset += 1) {
    const previousKey = shiftDateKey(todayKey, -offset);
    if (doesTaskOccurOnDate(task, previousKey)) {
      return previousKey;
    }
  }

  return toDateKey(new Date(task.dueAt));
};

const getTaskBucket = (
  occurrenceDate: string,
  todayKey: string,
  agendaWindowDays = AGENDA_WINDOW_DAYS,
): Exclude<TaskSectionId, 'completed'> => {
  const distance =
    compareDateKeys(occurrenceDate, todayKey) / (24 * 60 * 60 * 1000);
  if (distance < 0) {
    return 'overdue';
  }
  if (distance === 0) {
    return 'today';
  }
  return distance <= agendaWindowDays ? 'agenda' : 'later';
};

const buildViewModel = (
  task: TaskItem,
  occurrenceDate: string,
  completions: TaskCompletion[],
  categories: TaskCategoryEntity[],
  timeFormat: TimeFormat,
  todayKey: string,
): TaskListItemViewModel => {
  const category = categories.find((item) => item.id === task.categoryId) ?? {
    id: 'uncategorized',
    label: 'Uncategorized',
    color: '#E8EDF4',
    kind: 'preset' as const,
    archived: false,
    archivedAt: null,
  };
  const completion = getTaskCompletionRecord(
    task.id,
    occurrenceDate,
    completions,
  );
  const bucket = getTaskBucket(occurrenceDate, todayKey);

  return {
    task,
    category,
    occurrence: {
      occurrenceDate,
      displayTime: formatOccurrenceLabel(
        occurrenceDate,
        extractLocalTime(task.dueAt),
        timeFormat,
        todayKey,
      ),
      isCompleted: Boolean(completion),
    },
    searchText: [
      task.title,
      task.notes,
      category.label,
      task.priority,
      bucket,
      task.repeatRule.type,
    ]
      .join(' ')
      .toLowerCase(),
  };
};

export const buildTaskSections = ({
  tasks,
  filter,
  completions,
  categories,
  timeFormat,
  today = new Date(),
  agendaWindowDays = AGENDA_WINDOW_DAYS,
}: {
  tasks: TaskItem[];
  filter: TaskFilter;
  completions: TaskCompletion[];
  categories: TaskCategoryEntity[];
  timeFormat: TimeFormat;
  today?: Date;
  agendaWindowDays?: number;
}): TaskListSection[] => {
  const todayKey = toDateKey(today);
  const activeTasks = tasks.filter((task) => !task.archived);
  const relevantTasks = activeTasks.filter((task) => {
    if (filter === 'all' || filter === 'completed' || filter === 'overdue') {
      return true;
    }

    return task.categoryId === filter;
  });

  const grouped = relevantTasks.reduce<
    Record<TaskSectionId, TaskListItemViewModel[]>
  >(
    (accumulator, task) => {
      const occurrenceDate = resolveTaskOccurrenceDate(
        task,
        today,
        agendaWindowDays,
      );
      const viewModel = buildViewModel(
        task,
        occurrenceDate,
        completions,
        categories,
        timeFormat,
        todayKey,
      );
      const bucket = viewModel.occurrence.isCompleted
        ? 'completed'
        : getTaskBucket(occurrenceDate, todayKey, agendaWindowDays);

      accumulator[bucket].push(viewModel);
      return accumulator;
    },
    { completed: [], overdue: [], today: [], agenda: [], later: [] },
  );

  return sectionOrder
    .map((id) => ({
      id,
      title:
        id === 'overdue'
          ? 'Overdue'
          : id === 'today'
            ? 'Today'
            : id === 'agenda'
              ? 'Next 7 Days'
              : id === 'later'
                ? 'Later'
                : 'Completed',
      accentColor:
        id === 'overdue'
          ? '#C92B2B'
          : id === 'today'
            ? '#0F6DCA'
            : id === 'agenda'
              ? '#7FA6D8'
              : id === 'later'
                ? '#DDE5F0'
                : '#8FB4E1',
      tasks: grouped[id],
    }))
    .filter((section) => section.tasks.length > 0)
    .filter((section) =>
      filter === 'completed'
        ? section.id === 'completed'
        : filter === 'overdue'
          ? section.id === 'overdue'
          : true,
    );
};

export const filterTaskListByQuery = (
  sections: TaskListSection[],
  query: string,
): TaskListSection[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return sections;
  }

  return sections
    .map((section) => ({
      ...section,
      tasks: section.tasks.filter((item) =>
        item.searchText?.includes(normalizedQuery),
      ),
    }))
    .filter((section) => section.tasks.length > 0);
};

export const getTaskCompletion = (
  tasks: TaskItem[],
  completions: TaskCompletion[],
  dateKey = toDateKey(new Date()),
) => {
  if (tasks.length === 0) {
    return 0;
  }

  const todayTasks = tasks.filter(
    (task) => !task.archived && doesTaskOccurOnDate(task, dateKey),
  );
  if (todayTasks.length === 0) {
    return 0;
  }

  const doneCount = todayTasks.filter((task) =>
    getTaskCompletionRecord(task.id, dateKey, completions),
  ).length;
  return Math.round((doneCount / todayTasks.length) * 100);
};
