import {
  addDays,
  formatTimeLabel,
  fromDateKey,
  getWeekday,
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
  TimeFormat,
} from '@/shared/types/app';

const sectionOrder: TaskListSection['id'][] = [
  'overdue',
  'today',
  'upcoming',
  'completed',
];

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

const buildViewModel = (
  task: TaskItem,
  occurrenceDate: string,
  completions: TaskCompletion[],
  categories: TaskCategoryEntity[],
  timeFormat: TimeFormat,
): TaskListItemViewModel => {
  const category = categories.find((item) => item.id === task.categoryId) ?? {
    id: 'uncategorized',
    label: 'Uncategorized',
    color: '#E8EDF4',
    kind: 'preset' as const,
    archived: false,
  };
  const completion = getTaskCompletionRecord(
    task.id,
    occurrenceDate,
    completions,
  );
  const statusText = completion
    ? 'completed done'
    : occurrenceDate < toDateKey(new Date())
      ? 'overdue'
      : occurrenceDate === toDateKey(new Date())
        ? 'today'
        : 'upcoming';

  return {
    task,
    category,
    occurrence: {
      occurrenceDate,
      displayTime: formatTimeLabel(
        new Date(task.dueAt).toTimeString().slice(0, 5),
        timeFormat,
      ),
      isCompleted: Boolean(completion),
    },
    searchText: [
      task.title,
      task.notes,
      category.label,
      task.priority,
      statusText,
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
}: {
  tasks: TaskItem[];
  filter: TaskFilter;
  completions: TaskCompletion[];
  categories: TaskCategoryEntity[];
  timeFormat: TimeFormat;
  today?: Date;
}): TaskListSection[] => {
  const todayKey = toDateKey(today);
  const activeTasks = tasks.filter((task) => !task.archived);
  const relevantTasks = activeTasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return true;
    if (filter === 'overdue') return true;
    return task.categoryId === filter;
  });

  const grouped = relevantTasks.reduce<
    Record<TaskListSection['id'], TaskListItemViewModel[]>
  >(
    (accumulator, task) => {
      const datesToCheck = [
        addDays(today, -1),
        today,
        addDays(today, 1),
        addDays(today, 2),
      ].map(toDateKey);
      const firstOccurrence = datesToCheck.find((dateKey) =>
        doesTaskOccurOnDate(task, dateKey),
      );
      const baseOccurrence = firstOccurrence ?? toDateKey(new Date(task.dueAt));
      const viewModel = buildViewModel(
        task,
        baseOccurrence,
        completions,
        categories,
        timeFormat,
      );
      if (viewModel.occurrence.isCompleted) {
        accumulator.completed.push(viewModel);
      } else if (baseOccurrence < todayKey) {
        accumulator.overdue.push(viewModel);
      } else if (baseOccurrence === todayKey) {
        accumulator.today.push(viewModel);
      } else {
        accumulator.upcoming.push(viewModel);
      }
      return accumulator;
    },
    { completed: [], overdue: [], today: [], upcoming: [] },
  );

  return sectionOrder
    .map((id) => ({
      id,
      title:
        id === 'overdue'
          ? 'Overdue'
          : id === 'today'
            ? 'Today'
            : id === 'upcoming'
              ? 'Upcoming'
              : 'Completed',
      accentColor:
        id === 'overdue'
          ? '#C92B2B'
          : id === 'today'
            ? '#0F6DCA'
            : id === 'completed'
              ? '#8FB4E1'
              : '#DDE5F0',
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

  const todayTasks = tasks.filter((task) => doesTaskOccurOnDate(task, dateKey));
  if (todayTasks.length === 0) {
    return 0;
  }

  const doneCount = todayTasks.filter((task) =>
    getTaskCompletionRecord(task.id, dateKey, completions),
  ).length;
  return Math.round((doneCount / todayTasks.length) * 100);
};
