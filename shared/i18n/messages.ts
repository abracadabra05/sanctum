import type {
  AppLanguage,
  TaskCategoryEntity,
  TaskFilter,
  TaskPriority,
} from '@/shared/types/app';

type TranslationParams = Record<string, string | number | null | undefined>;
type TranslationValue =
  | string
  | ((params: TranslationParams, language: AppLanguage) => string);

type TranslationMap = Record<string, TranslationValue>;
type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

const localeMap: Record<AppLanguage, string> = {
  en: 'en-US',
  ru: 'ru-RU',
};

const getIntlApi = () => (typeof Intl === 'object' && Intl ? Intl : null);

const getFallbackPluralCategory = (
  language: AppLanguage,
  count: number,
): PluralCategory => {
  const normalizedCount = Math.abs(Math.trunc(count));

  if (language === 'ru') {
    const mod10 = normalizedCount % 10;
    const mod100 = normalizedCount % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return 'one';
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return 'few';
    }

    return 'many';
  }

  return normalizedCount === 1 ? 'one' : 'other';
};

const formatNumber = (language: AppLanguage, value: number) => {
  const intlApi = getIntlApi();
  if (typeof intlApi?.NumberFormat === 'function') {
    try {
      return new intlApi.NumberFormat(localeMap[language]).format(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const selectPlural = (
  language: AppLanguage,
  count: number,
  forms: Partial<Record<PluralCategory, string>> & {
    other: string;
  },
) => {
  const intlApi = getIntlApi();
  if (typeof intlApi?.PluralRules === 'function') {
    try {
      const category = new intlApi.PluralRules(localeMap[language]).select(
        count,
      ) as PluralCategory;
      return forms[category] ?? forms.other;
    } catch {
      return forms[getFallbackPluralCategory(language, count)] ?? forms.other;
    }
  }

  return forms[getFallbackPluralCategory(language, count)] ?? forms.other;
};

const interpolate = (template: string, params: TranslationParams) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''));

const buildCountLabel = (
  language: AppLanguage,
  count: number,
  forms: Partial<Record<PluralCategory, string>> & { other: string },
) => `${formatNumber(language, count)} ${selectPlural(language, count, forms)}`;

const en = {
  'language.english': 'English',
  'language.russian': 'Russian',
  'common.today': 'Today',
  'common.tomorrow': 'Tomorrow',
  'common.later': 'Later',
  'common.close': 'Close',
  'common.save': 'Save',
  'common.create': 'Create',
  'common.cancel': 'Cancel',
  'common.archive': 'Archive',
  'common.restore': 'Restore',
  'common.edit': 'Edit',
  'common.open': 'Open',
  'common.next': 'Next',
  'common.finish': 'Finish',
  'common.undo': 'Undo',
  'common.locked': 'Locked',
  'common.on': 'On',
  'common.off': 'Off',
  'common.preview': 'Preview',
  'stepper.dayShort': 'd',
  'stepper.minuteShort': 'm',
  'theme.system': 'System',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.hint.system': 'Follow device appearance',
  'theme.hint.light': 'Bright surfaces and soft contrast',
  'theme.hint.dark': 'Deeper surfaces for night use',
  'timeFormat.12h': '12-hour',
  'timeFormat.24h': '24-hour',
  'tabs.dashboard': 'Dashboard',
  'task.priority.low': 'Low',
  'task.priority.medium': 'Medium',
  'task.priority.high': 'High',
  'task.repeat.none': 'None',
  'task.repeat.daily': 'Daily',
  'task.repeat.weekdays': 'Weekdays',
  'task.repeat.weekly': 'Weekly',
  'task.repeat.custom': 'Custom',
  'task.filter.all': 'All',
  'task.filter.overdue': 'Overdue',
  'task.filter.completed': 'Completed',
  'task.filter.archived': 'Archived',
  'task.section.overdue': 'Overdue',
  'task.section.today': 'Today',
  'task.section.agenda': 'Next 7 Days',
  'task.section.later': 'Later',
  'task.section.completed': 'Completed',
  'task.category.work': 'Work',
  'task.category.personal': 'Personal',
  'task.category.health': 'Health',
  'task.category.study': 'Study',
  'task.category.home': 'Home',
  'task.category.uncategorized': 'Uncategorized',
  'habit.goalMode.daily': 'Daily',
  'habit.goalMode.weekly': 'Weekly',
  'habit.history.open': 'Open',
  'habit.history.done': 'Done',
  'habit.streak.days': 'DAYS',
  'habit.reminder': ({ time }) => `Reminder ${time}`,
  'habit.progress.dailyDone': 'Goal reached today',
  'habit.progress.dailyOpen': '1 step for today',
  'habit.progress.weekly': ({ completed, target }) =>
    `${completed}/${target} this week`,
  'habit.detail.weeklyGoal': ({ target }) => `Goal ${target} times per week`,
  'habit.detail.dailyGoal': 'Goal once per scheduled day',
  'onboarding.eyebrow': 'Welcome',
  'onboarding.title': 'Set up your sanctuary',
  'onboarding.body':
    'Start with your name, hydration goal and reminders. Right after this step, the guide will help you create your first task and habit from scratch.',
  'onboarding.displayName': 'Display name',
  'onboarding.dailyTarget': 'Daily water target (ml)',
  'onboarding.enableReminders': 'Enable reminders',
  'onboarding.continue': 'Continue to Sanctum',
  'onboarding.alert.title': 'Check the form',
  'onboarding.alert.body':
    'Please enter a name and a valid daily water target.',
  'dashboard.hydration.eyebrow': 'Hydration',
  'dashboard.hydration.title': 'Stay Fluid',
  'dashboard.progress.goalReached': 'Goal reached',
  'dashboard.waterControl': 'Water',
  'dashboard.summary.aboveGoal': ({ amount }) => `+${amount} ml above goal`,
  'dashboard.summary.leftToday': ({ amount }) => `${amount} ml left today`,
  'dashboard.customAmount': 'Custom amount',
  'dashboard.add': 'Add',
  'dashboard.tasks.eyebrow': 'Productivity',
  'dashboard.tasks.title': 'Daily To-Do',
  'dashboard.tasks.action': 'Today',
  'dashboard.tasks.emptyTitle': 'All done',
  'dashboard.tasks.emptyBody': 'Nothing active is left for today.',
  'dashboard.habits.eyebrow': 'Consistency',
  'dashboard.habits.title': 'Habit Streaks',
  'dashboard.habits.emptyTitle': 'No habits yet',
  'dashboard.habits.emptyBody':
    'Create your first habit to start building streaks.',
  'dashboard.fab.addTask': 'Add task',
  'dashboard.fab.addHabit': 'Add habit',
  'dashboard.fab.searchTasks': 'Search tasks',
  'tasks.header': 'Tasks',
  'tasks.focus.eyebrow': 'Daily Pulse',
  'tasks.focus.title': "Today's Focus",
  'tasks.focus.body':
    'Search any task, move overdue work, keep this week visible.',
  'tasks.focus.centerCaption': 'Done',
  'tasks.archived.status': 'Archived',
  'tasks.archived.title': 'Archived',
  'tasks.archived.count': ({ count }, language) =>
    buildCountLabel(language, Number(count ?? 0), {
      one: 'item',
      other: 'items',
    }),
  'tasks.archived.emptyTitle': 'No archived tasks',
  'tasks.archived.emptyBody':
    'Archived tasks will appear here and can be restored at any time.',
  'tasks.secondary.moveTomorrow': 'Move to tomorrow',
  'tasks.empty.title': 'No tasks yet',
  'tasks.empty.body':
    'Tap the + button to create your first task and start organizing your day.',
  'tasks.search.scopeArchived': 'All tasks, including archived',
  'tasks.search.scopeActive': 'All active tasks',
  'tasks.fab.addTask': 'Add task',
  'tasks.fab.search': 'Global search',
  'habits.header': 'Habits',
  'habits.summary.eyebrow': 'Consistency',
  'habits.summary.title': 'Keep rituals steady',
  'habits.summary.body':
    'Open a habit for details, then mark today complete in one step.',
  'habits.segment.active': 'Active',
  'habits.segment.archived': 'Archived',
  'habits.empty.activeTitle': 'No habits yet',
  'habits.empty.activeBody': 'Tap the + button to create your first habit.',
  'habits.empty.archivedTitle': 'No archived habits',
  'habits.empty.archivedBody': 'Your archived habits will appear here.',
  'habits.fab.addHabit': 'Add habit',
  'profile.header': 'Profile',
  'profile.subtitle':
    'Local settings hub for hydration, tasks, habits and release checks.',
  'profile.overview.title': 'Overview',
  'profile.overview.waterPlan': 'Water plan',
  'profile.overview.waterDetail': ({ count }, language) =>
    buildCountLabel(language, Number(count ?? 0), {
      one: 'quick button',
      other: 'quick buttons',
    }),
  'profile.overview.activeHabits': 'Active habits',
  'profile.overview.activeHabitsDetail': 'Tracked inside the Habits tab',
  'profile.overview.categories': 'Task categories',
  'profile.overview.categoriesDetail': 'Preset and custom filters',
  'profile.overview.appearance': 'Appearance',
  'profile.overview.clock': ({ format }) => `${format} clock`,
  'profile.release.title': 'Release prep',
  'profile.release.body':
    'Replay the interactive onboarding guide after larger UI changes and before final QA.',
  'profile.release.button': 'Replay interactive guide',
  'profile.settings.title': 'Settings hub',
  'profile.settings.body':
    'Water, notifications, display, archive recovery and data tools now live behind a single settings route.',
  'profile.settings.button': 'Open settings',
  'profile.settings.summary':
    'Central hub for release checks, backups and device preferences.',
  'settings.index.title': 'Settings',
  'settings.index.body':
    'App-level controls live here. Data stays local unless you export it.',
  'settings.index.water.label': 'Water',
  'settings.index.water.summary': 'Goal, quick buttons and hydration defaults',
  'settings.index.categories.label': 'Task categories',
  'settings.index.categories.summary':
    'Create, edit and archive custom categories',
  'settings.index.notifications.label': 'Notifications',
  'settings.index.notifications.summary':
    'Water reminder timing and cutoff rules',
  'settings.index.display.label': 'Display & theme',
  'settings.index.display.summary': 'Theme mode, time format and week start',
  'settings.index.archive.label': 'Archive center',
  'settings.index.archive.summary': 'Restore archived tasks and habits',
  'settings.index.data.label': 'Data',
  'settings.index.data.summary': 'Export, import and reset local data',
  'settings.display.title': 'Display & theme',
  'settings.display.body':
    'Keep names, language and time settings readable at a glance.',
  'settings.display.displayName': 'Display name',
  'settings.display.displayNamePlaceholder': 'Your name',
  'settings.display.language': 'App language',
  'settings.display.theme': 'Theme',
  'settings.display.timeFormat': 'Time format',
  'settings.display.weekStart': 'First day of week',
  'settings.display.currentMode': 'Current mode',
  'settings.display.save': 'Save display settings',
  'settings.archive.title': 'Archive center',
  'settings.archive.body':
    'Restore archived tasks, habits and categories without losing their local history.',
  'settings.archive.filter.all': 'All',
  'settings.archive.filter.tasks': 'Tasks',
  'settings.archive.filter.habits': 'Habits',
  'settings.archive.filter.categories': 'Categories',
  'settings.archive.subtitle.task': 'Task archive',
  'settings.archive.subtitle.habit': 'Habit archive',
  'settings.archive.subtitle.category': 'Category archive',
  'settings.archive.emptyTitle': 'Archive is empty',
  'settings.archive.emptyBody': 'No items match the current archive filter.',
  'settings.categories.title': 'Task categories',
  'settings.categories.body':
    'Keep your filters tidy. Presets stay locked, custom categories can be edited or archived.',
  'settings.categories.placeholder': 'Category name',
  'settings.categories.errorRequired': 'Category name is required.',
  'settings.categories.saveCreate': 'Create category',
  'settings.categories.saveUpdate': 'Save category',
  'settings.categories.sectionTitle': 'Active categories',
  'settings.categories.meta.preset': 'Preset category',
  'settings.categories.meta.custom': 'Custom category',
  'settings.categories.meta.archiveFallback': ({ fallback }) =>
    `Archive moves tasks to ${fallback}`,
  'settings.categories.errorNeedFallback':
    'Add another active category before archiving this one.',
  'settings.data.title': 'Data',
  'settings.data.body':
    'Export and import stay local. Reset is destructive and always asks for confirmation.',
  'settings.data.safeTitle': 'Safe actions',
  'settings.data.exportTitle': 'Export JSON',
  'settings.data.exportBody':
    'Save a portable snapshot of tasks, habits, hydration history and preferences.',
  'settings.data.importTitle': 'Import JSON',
  'settings.data.importBody':
    'Restore a previous export through the built-in migration pipeline.',
  'settings.data.destructiveTitle': 'Destructive',
  'settings.data.destructiveBody':
    'Reset replaces local data with the clean starter state. Export first if you may need this data later.',
  'settings.data.resetButton': 'Reset local data',
  'settings.data.resetAlertTitle': 'Reset all data',
  'settings.data.resetAlertBody':
    'This will replace local data with seed content.',
  'settings.notifications.title': 'Notifications',
  'settings.notifications.body':
    'Water reminders stay local and only run when you enable them.',
  'settings.notifications.cardTitle': 'Water reminders',
  'settings.notifications.cardBody':
    'Skip reminders after your cutoff time or once the goal is reached.',
  'settings.notifications.interval': 'Reminder interval',
  'settings.notifications.stopAfter': 'Stop reminders after',
  'settings.notifications.summaryTitle': 'Reminder behavior',
  'settings.notifications.summaryBody': ({ interval, cutoff }) =>
    `Every ${interval} minutes until ${cutoff}. The app skips reminders once your water goal is done.`,
  'settings.notifications.save': 'Save notifications',
  'settings.water.title': 'Water',
  'settings.water.body':
    'Set a daily goal and the quick amounts used on the dashboard.',
  'settings.water.dailyTarget': 'Daily target',
  'settings.water.quickButtons': 'Quick buttons',
  'settings.water.quickSlot': ({ index }) => `Quick ${index}`,
  'settings.water.slotPreset': ({ index, amount }) =>
    `Slot ${index}: ${amount}`,
  'settings.water.summaryTitle': 'Preview',
  'settings.water.summaryBody': ({ target, buttons }) =>
    `Goal ${target} ml • Quick buttons ${buttons}`,
  'settings.water.summaryNotSet': 'not set',
  'settings.water.save': 'Save water settings',
  'hydration.history.title': 'Hydration history',
  'hydration.history.goal': 'Goal',
  'hydration.history.emptyTitle': 'No history yet',
  'hydration.history.emptyBody':
    'Daily totals appear here after the app rolls into a new day.',
  'createTask.titleCreate': 'Create task',
  'createTask.titleEdit': 'Edit task',
  'createTask.placeholderTitle': 'Task title',
  'createTask.placeholderNotes': 'Notes',
  'createTask.dueDate': 'Due date',
  'createTask.dueTime': 'Due time',
  'createHabit.titleCreate': 'Create habit',
  'createHabit.titleEdit': 'Edit habit',
  'createHabit.placeholderName': 'Habit name',
  'createHabit.icon.sparkles': 'Sparkles',
  'createHabit.icon.circle': 'Circle',
  'createHabit.icon.leaf': 'Leaf',
  'createHabit.icon.book': 'Book',
  'createHabit.icon.moon': 'Moon',
  'createHabit.placeholderTarget': 'Target per period',
  'createHabit.schedule': 'Schedule',
  'createHabit.reminderToggle': 'Reminder',
  'createHabit.reminderTime': 'Reminder time',
  'search.placeholder': 'Search tasks',
  'search.clear': 'Clear',
  'search.close': 'Close',
  'search.includeArchived': 'Include archived',
  'search.archivedIncluded': 'Archived included',
  'search.title': 'Search',
  'search.results': ({ count }, language) =>
    buildCountLabel(language, Number(count ?? 0), {
      one: 'result',
      other: 'results',
    }),
  'search.empty.noMatchTitle': 'Nothing found',
  'search.empty.noMatchBody':
    'Try a different task name, category, note or priority.',
  'search.empty.noFilterTitle': 'No tasks in this filter',
  'search.empty.noFilterBody':
    'Global search lists every active task and can optionally include archived items.',
  'taskCard.archive': 'Archive',
  'taskCard.done': 'Done',
  'habitDetail.eyebrow': 'Habit detail',
  'habitDetail.schedule': 'Schedule',
  'habitDetail.noSchedule': 'No scheduled days',
  'habitDetail.recentHistory': 'Recent history',
  'habitDetail.toggleDone': 'Mark done',
  'habitDetail.toggleUndo': 'Undo today',
  'appMenu.close': 'Close menu',
  'appMenu.title': 'Quick actions',
  'appMenu.search': 'Search tasks',
  'appMenu.addTask': 'Quick add task',
  'appMenu.addHabit': 'Quick add habit',
  'appMenu.data': 'Data actions',
  'appMenu.profile': 'Profile & settings',
  'snackbar.taskArchived': 'Task archived',
  'snackbar.habitArchived': 'Habit archived',
  'releaseTour.later': 'Later',
  'releaseTour.eyebrow': 'Interactive guide',
  'releaseTour.tasks.title': 'Create your first task',
  'releaseTour.tasks.body':
    'Open the task builder, add a title, choose the date and time, then save it. The guide starts with a blank list on purpose.',
  'releaseTour.tasks.hint':
    'As soon as the first task is created, the guide moves to habits.',
  'releaseTour.tasks.action': 'Open task builder',
  'releaseTour.habits.title': 'Build a habit from scratch',
  'releaseTour.habits.body':
    'Now create your first habit: pick a name, set the schedule, choose a reminder if needed, and save it.',
  'releaseTour.habits.hint':
    'After the first habit is saved, the guide will wrap up.',
  'releaseTour.habits.action': 'Open habit builder',
  'releaseTour.ready.title': 'Everything is ready',
  'releaseTour.ready.body':
    'Dashboard keeps water, tasks and habits together, while Profile lets you replay this guide and open the full settings hub later.',
  'releaseTour.ready.action': 'Finish',
  'notifications.water.title': 'Hydration check-in',
  'notifications.water.body': 'A small glass now keeps your rhythm steady.',
  'notifications.habit.body': 'Your planned habit is ready to be completed.',
  'dataTransfer.exportDialogTitle': 'Export Sanctum data',
  'dataTransfer.exportFailedTitle': 'Export failed',
  'dataTransfer.exportFailedBody': 'Could not export data. Please try again.',
  'dataTransfer.importFailedTitle': 'Import failed',
  'dataTransfer.importFailedBody':
    'The selected file is not a valid Sanctum export.',
  'planning.task.titleRequired': 'Task title is required.',
  'planning.task.categoryRequired': 'Choose a category.',
  'planning.task.dateInvalid': 'Choose a valid date.',
  'planning.task.timeInvalid': 'Choose a valid time.',
  'planning.habit.nameRequired': 'Habit name is required.',
  'planning.habit.scheduleRequired': 'Choose at least one day.',
  'planning.habit.targetInvalid': 'Target must be a positive whole number.',
  'planning.habit.reminderInvalid': 'Choose a valid reminder time.',
} as const satisfies TranslationMap;

const ru: Record<keyof typeof en, TranslationValue> = {
  'language.english': 'Английский',
  'language.russian': 'Русский',
  'common.today': 'Сегодня',
  'common.tomorrow': 'Завтра',
  'common.later': 'Позже',
  'common.close': 'Закрыть',
  'common.save': 'Сохранить',
  'common.create': 'Создать',
  'common.cancel': 'Отмена',
  'common.archive': 'В архив',
  'common.restore': 'Восстановить',
  'common.edit': 'Изменить',
  'common.open': 'Открыть',
  'common.next': 'Далее',
  'common.finish': 'Готово',
  'common.undo': 'Отменить',
  'common.locked': 'Зафиксировано',
  'common.on': 'Вкл',
  'common.off': 'Выкл',
  'common.preview': 'Предпросмотр',
  'stepper.dayShort': 'д',
  'stepper.minuteShort': 'м',
  'theme.system': 'Система',
  'theme.light': 'Светлая',
  'theme.dark': 'Тёмная',
  'theme.hint.system': 'Следовать настройкам устройства',
  'theme.hint.light': 'Светлые поверхности и мягкий контраст',
  'theme.hint.dark': 'Более глубокие поверхности для вечера',
  'timeFormat.12h': '12-часовой',
  'timeFormat.24h': '24-часовой',
  'tabs.dashboard': 'Дашборд',
  'task.priority.low': 'Низкий',
  'task.priority.medium': 'Средний',
  'task.priority.high': 'Высокий',
  'task.repeat.none': 'Без повтора',
  'task.repeat.daily': 'Каждый день',
  'task.repeat.weekdays': 'По будням',
  'task.repeat.weekly': 'Еженедельно',
  'task.repeat.custom': 'Свои дни',
  'task.filter.all': 'Все',
  'task.filter.overdue': 'Просроченные',
  'task.filter.completed': 'Выполненные',
  'task.filter.archived': 'Архив',
  'task.section.overdue': 'Просроченные',
  'task.section.today': 'Сегодня',
  'task.section.agenda': 'Ближайшие 7 дней',
  'task.section.later': 'Позже',
  'task.section.completed': 'Выполненные',
  'task.category.work': 'Работа',
  'task.category.personal': 'Личное',
  'task.category.health': 'Здоровье',
  'task.category.study': 'Учёба',
  'task.category.home': 'Дом',
  'task.category.uncategorized': 'Без категории',
  'habit.goalMode.daily': 'Ежедневно',
  'habit.goalMode.weekly': 'Еженедельно',
  'habit.history.open': 'Открыто',
  'habit.history.done': 'Сделано',
  'habit.streak.days': 'ДНЕЙ',
  'habit.reminder': ({ time }) => `Напоминание ${time}`,
  'habit.progress.dailyDone': 'Цель на сегодня выполнена',
  'habit.progress.dailyOpen': '1 шаг на сегодня',
  'habit.progress.weekly': ({ completed, target }) =>
    `${completed}/${target} за неделю`,
  'habit.detail.weeklyGoal': ({ target }) => {
    const count = Number(target ?? 0);
    return `Цель ${count} ${selectPlural('ru', count, {
      one: 'раз',
      few: 'раза',
      many: 'раз',
      other: 'раз',
    })} в неделю`;
  },
  'habit.detail.dailyGoal': 'Цель один раз в каждый выбранный день',
  'onboarding.eyebrow': 'Добро пожаловать',
  'onboarding.title': 'Настройте своё пространство',
  'onboarding.body':
    'Начните с имени, цели по воде и напоминаний. Сразу после этого гид поможет создать первую задачу и привычку с нуля.',
  'onboarding.displayName': 'Имя в приложении',
  'onboarding.dailyTarget': 'Дневная цель по воде (мл)',
  'onboarding.enableReminders': 'Включить напоминания',
  'onboarding.continue': 'Продолжить в Sanctum',
  'onboarding.alert.title': 'Проверьте форму',
  'onboarding.alert.body': 'Введите имя и корректную дневную цель по воде.',
  'dashboard.hydration.eyebrow': 'Вода',
  'dashboard.hydration.title': 'Следите за балансом',
  'dashboard.progress.goalReached': 'Цель достигнута',
  'dashboard.waterControl': 'Вода',
  'dashboard.summary.aboveGoal': ({ amount }) => `+${amount} мл сверх цели`,
  'dashboard.summary.leftToday': ({ amount }) =>
    `Осталось ${amount} мл сегодня`,
  'dashboard.customAmount': 'Своя порция',
  'dashboard.add': 'Добавить',
  'dashboard.tasks.eyebrow': 'Продуктивность',
  'dashboard.tasks.title': 'План на день',
  'dashboard.tasks.action': 'Сегодня',
  'dashboard.tasks.emptyTitle': 'Всё готово',
  'dashboard.tasks.emptyBody': 'На сегодня активных задач не осталось.',
  'dashboard.habits.eyebrow': 'Постоянство',
  'dashboard.habits.title': 'Серии привычек',
  'dashboard.habits.emptyTitle': 'Привычек пока нет',
  'dashboard.habits.emptyBody':
    'Создайте первую привычку и начните набирать серию.',
  'dashboard.fab.addTask': 'Новая задача',
  'dashboard.fab.addHabit': 'Новая привычка',
  'dashboard.fab.searchTasks': 'Поиск задач',
  'tasks.header': 'Задачи',
  'tasks.focus.eyebrow': 'Пульс дня',
  'tasks.focus.title': 'Фокус на сегодня',
  'tasks.focus.body':
    'Ищите любую задачу, переносите просроченное и держите неделю перед глазами.',
  'tasks.focus.centerCaption': 'Готово',
  'tasks.archived.status': 'В архиве',
  'tasks.archived.title': 'Архив',
  'tasks.archived.count': ({ count }, language) =>
    buildCountLabel(language, Number(count ?? 0), {
      one: 'элемент',
      few: 'элемента',
      many: 'элементов',
      other: 'элемента',
    }),
  'tasks.archived.emptyTitle': 'Архивных задач нет',
  'tasks.archived.emptyBody':
    'Здесь появятся архивные задачи, и их можно будет восстановить в любой момент.',
  'tasks.secondary.moveTomorrow': 'Перенести на завтра',
  'tasks.empty.title': 'Задач пока нет',
  'tasks.empty.body':
    'Нажмите +, чтобы создать первую задачу и начать раскладывать день по полочкам.',
  'tasks.search.scopeArchived': 'Все задачи, включая архив',
  'tasks.search.scopeActive': 'Все активные задачи',
  'tasks.fab.addTask': 'Новая задача',
  'tasks.fab.search': 'Глобальный поиск',
  'habits.header': 'Привычки',
  'habits.summary.eyebrow': 'Постоянство',
  'habits.summary.title': 'Держите ритм',
  'habits.summary.body':
    'Откройте привычку для деталей и отметьте выполнение за сегодня одним действием.',
  'habits.segment.active': 'Активные',
  'habits.segment.archived': 'Архив',
  'habits.empty.activeTitle': 'Привычек пока нет',
  'habits.empty.activeBody': 'Нажмите +, чтобы создать первую привычку.',
  'habits.empty.archivedTitle': 'Архивных привычек нет',
  'habits.empty.archivedBody': 'Архивные привычки появятся здесь.',
  'habits.fab.addHabit': 'Новая привычка',
  'profile.header': 'Профиль',
  'profile.subtitle':
    'Локальный центр настроек для воды, задач, привычек и проверки релиза.',
  'profile.overview.title': 'Обзор',
  'profile.overview.waterPlan': 'План по воде',
  'profile.overview.waterDetail': ({ count }, language) =>
    buildCountLabel(language, Number(count ?? 0), {
      one: 'быстрая кнопка',
      few: 'быстрые кнопки',
      many: 'быстрых кнопок',
      other: 'быстрой кнопки',
    }),
  'profile.overview.activeHabits': 'Активные привычки',
  'profile.overview.activeHabitsDetail': 'Отслеживаются во вкладке Привычки',
  'profile.overview.categories': 'Категории задач',
  'profile.overview.categoriesDetail': 'Системные и пользовательские фильтры',
  'profile.overview.appearance': 'Внешний вид',
  'profile.overview.clock': ({ format }) => `${format} формат`,
  'profile.release.title': 'Подготовка релиза',
  'profile.release.body':
    'Запускайте интерактивный гид заново после крупных UI-изменений и перед финальным QA.',
  'profile.release.button': 'Повторить интерактивный гид',
  'profile.settings.title': 'Центр настроек',
  'profile.settings.body':
    'Вода, уведомления, отображение, восстановление из архива и инструменты данных теперь собраны в одном разделе.',
  'profile.settings.button': 'Открыть настройки',
  'profile.settings.summary':
    'Единая точка для проверок релиза, бэкапов и настроек устройства.',
  'settings.index.title': 'Настройки',
  'settings.index.body':
    'Здесь собраны настройки уровня приложения. Данные остаются локальными, пока вы их не экспортируете.',
  'settings.index.water.label': 'Вода',
  'settings.index.water.summary': 'Цель, быстрые кнопки и параметры гидратации',
  'settings.index.categories.label': 'Категории задач',
  'settings.index.categories.summary':
    'Создание, редактирование и архив пользовательских категорий',
  'settings.index.notifications.label': 'Уведомления',
  'settings.index.notifications.summary':
    'Интервал напоминаний о воде и время остановки',
  'settings.index.display.label': 'Язык и тема',
  'settings.index.display.summary':
    'Тема, формат времени, язык и первый день недели',
  'settings.index.archive.label': 'Архив',
  'settings.index.archive.summary': 'Восстановление архивных задач и привычек',
  'settings.index.data.label': 'Данные',
  'settings.index.data.summary':
    'Экспорт, импорт и полный сброс локальных данных',
  'settings.display.title': 'Язык и тема',
  'settings.display.body':
    'Держите имя, язык и настройки времени в читаемом состоянии.',
  'settings.display.displayName': 'Имя в приложении',
  'settings.display.displayNamePlaceholder': 'Ваше имя',
  'settings.display.language': 'Язык приложения',
  'settings.display.theme': 'Тема',
  'settings.display.timeFormat': 'Формат времени',
  'settings.display.weekStart': 'Первый день недели',
  'settings.display.currentMode': 'Текущий режим',
  'settings.display.save': 'Сохранить настройки',
  'settings.archive.title': 'Архив',
  'settings.archive.body':
    'Восстанавливайте архивные задачи, привычки и категории без потери локальной истории.',
  'settings.archive.filter.all': 'Все',
  'settings.archive.filter.tasks': 'Задачи',
  'settings.archive.filter.habits': 'Привычки',
  'settings.archive.filter.categories': 'Категории',
  'settings.archive.subtitle.task': 'Архив задач',
  'settings.archive.subtitle.habit': 'Архив привычек',
  'settings.archive.subtitle.category': 'Архив категорий',
  'settings.archive.emptyTitle': 'Архив пуст',
  'settings.archive.emptyBody': 'Текущий фильтр архива ничего не нашёл.',
  'settings.categories.title': 'Категории задач',
  'settings.categories.body':
    'Держите фильтры в порядке. Системные категории зафиксированы, пользовательские можно редактировать и архивировать.',
  'settings.categories.placeholder': 'Название категории',
  'settings.categories.errorRequired': 'Введите название категории.',
  'settings.categories.saveCreate': 'Создать категорию',
  'settings.categories.saveUpdate': 'Сохранить категорию',
  'settings.categories.sectionTitle': 'Активные категории',
  'settings.categories.meta.preset': 'Системная категория',
  'settings.categories.meta.custom': 'Пользовательская категория',
  'settings.categories.meta.archiveFallback': ({ fallback }) =>
    `При архивировании задачи перейдут в ${fallback}`,
  'settings.categories.errorNeedFallback':
    'Добавьте ещё одну активную категорию перед архивированием этой.',
  'settings.data.title': 'Данные',
  'settings.data.body':
    'Экспорт и импорт остаются локальными. Сброс разрушителен и всегда требует подтверждения.',
  'settings.data.safeTitle': 'Безопасные действия',
  'settings.data.exportTitle': 'Экспорт JSON',
  'settings.data.exportBody':
    'Сохраните переносимый снимок задач, привычек, истории воды и настроек.',
  'settings.data.importTitle': 'Импорт JSON',
  'settings.data.importBody':
    'Восстановите предыдущий экспорт через встроенный пайплайн миграций.',
  'settings.data.destructiveTitle': 'Разрушительные действия',
  'settings.data.destructiveBody':
    'Сброс заменит локальные данные чистым стартовым состоянием. Сначала экспортируйте данные, если они могут понадобиться позже.',
  'settings.data.resetButton': 'Сбросить локальные данные',
  'settings.data.resetAlertTitle': 'Сбросить все данные',
  'settings.data.resetAlertBody':
    'Это заменит локальные данные стартовым состоянием.',
  'settings.notifications.title': 'Уведомления',
  'settings.notifications.body':
    'Напоминания о воде остаются локальными и работают только после включения.',
  'settings.notifications.cardTitle': 'Напоминания о воде',
  'settings.notifications.cardBody':
    'Останавливать напоминания после выбранного времени или после достижения цели.',
  'settings.notifications.interval': 'Интервал напоминаний',
  'settings.notifications.stopAfter': 'Остановить напоминания после',
  'settings.notifications.summaryTitle': 'Поведение напоминаний',
  'settings.notifications.summaryBody': ({ interval, cutoff }) =>
    `Каждые ${interval} минут до ${cutoff}. После достижения цели приложение пропускает напоминания.`,
  'settings.notifications.save': 'Сохранить уведомления',
  'settings.water.title': 'Вода',
  'settings.water.body':
    'Задайте дневную цель и быстрые объёмы, которые используются на дашборде.',
  'settings.water.dailyTarget': 'Дневная цель',
  'settings.water.quickButtons': 'Быстрые кнопки',
  'settings.water.quickSlot': ({ index }) => `Быстрая ${index}`,
  'settings.water.slotPreset': ({ index, amount }) =>
    `Слот ${index}: ${amount}`,
  'settings.water.summaryTitle': 'Предпросмотр',
  'settings.water.summaryBody': ({ target, buttons }) =>
    `Цель ${target} мл • Быстрые кнопки ${buttons}`,
  'settings.water.summaryNotSet': 'не заданы',
  'settings.water.save': 'Сохранить настройки воды',
  'hydration.history.title': 'История воды',
  'hydration.history.goal': 'Цель',
  'hydration.history.emptyTitle': 'Истории пока нет',
  'hydration.history.emptyBody':
    'Дневные итоги появятся здесь после перехода приложения в новый день.',
  'createTask.titleCreate': 'Новая задача',
  'createTask.titleEdit': 'Редактирование задачи',
  'createTask.placeholderTitle': 'Название задачи',
  'createTask.placeholderNotes': 'Заметки',
  'createTask.dueDate': 'Дата',
  'createTask.dueTime': 'Время',
  'createHabit.titleCreate': 'Новая привычка',
  'createHabit.titleEdit': 'Редактирование привычки',
  'createHabit.placeholderName': 'Название привычки',
  'createHabit.icon.sparkles': 'Искры',
  'createHabit.icon.circle': 'Круг',
  'createHabit.icon.leaf': 'Лист',
  'createHabit.icon.book': 'Книга',
  'createHabit.icon.moon': 'Луна',
  'createHabit.placeholderTarget': 'Цель за период',
  'createHabit.schedule': 'Расписание',
  'createHabit.reminderToggle': 'Напоминание',
  'createHabit.reminderTime': 'Время напоминания',
  'search.placeholder': 'Поиск задач',
  'search.clear': 'Очистить',
  'search.close': 'Закрыть',
  'search.includeArchived': 'Показать архив',
  'search.archivedIncluded': 'Архив включён',
  'search.title': 'Поиск',
  'search.results': ({ count }, language) =>
    buildCountLabel(language, Number(count ?? 0), {
      one: 'результат',
      few: 'результата',
      many: 'результатов',
      other: 'результата',
    }),
  'search.empty.noMatchTitle': 'Ничего не найдено',
  'search.empty.noMatchBody':
    'Попробуйте другое название задачи, категорию, заметку или приоритет.',
  'search.empty.noFilterTitle': 'В этом фильтре задач нет',
  'search.empty.noFilterBody':
    'Глобальный поиск показывает все активные задачи и при желании включает архив.',
  'taskCard.archive': 'В архив',
  'taskCard.done': 'Сделано',
  'habitDetail.eyebrow': 'Детали привычки',
  'habitDetail.schedule': 'Расписание',
  'habitDetail.noSchedule': 'Нет выбранных дней',
  'habitDetail.recentHistory': 'Недавняя история',
  'habitDetail.toggleDone': 'Отметить',
  'habitDetail.toggleUndo': 'Отменить сегодня',
  'appMenu.close': 'Закрыть меню',
  'appMenu.title': 'Быстрые действия',
  'appMenu.search': 'Поиск задач',
  'appMenu.addTask': 'Быстро добавить задачу',
  'appMenu.addHabit': 'Быстро добавить привычку',
  'appMenu.data': 'Действия с данными',
  'appMenu.profile': 'Профиль и настройки',
  'snackbar.taskArchived': 'Задача архивирована',
  'snackbar.habitArchived': 'Привычка архивирована',
  'releaseTour.later': 'Позже',
  'releaseTour.eyebrow': 'Интерактивный гид',
  'releaseTour.tasks.title': 'Создайте первую задачу',
  'releaseTour.tasks.body':
    'Откройте конструктор задачи, добавьте название, выберите дату и время, затем сохраните. Список специально начинается пустым.',
  'releaseTour.tasks.hint':
    'Как только появится первая задача, гид перейдёт к привычкам.',
  'releaseTour.tasks.action': 'Открыть задачу',
  'releaseTour.habits.title': 'Соберите привычку с нуля',
  'releaseTour.habits.body':
    'Теперь создайте первую привычку: выберите имя, задайте расписание, при необходимости включите напоминание и сохраните.',
  'releaseTour.habits.hint': 'После сохранения первой привычки гид завершится.',
  'releaseTour.habits.action': 'Открыть привычку',
  'releaseTour.ready.title': 'Всё готово',
  'releaseTour.ready.body':
    'Дашборд держит воду, задачи и привычки вместе, а Профиль позволяет снова открыть этот гид и позже перейти в полный центр настроек.',
  'releaseTour.ready.action': 'Завершить',
  'notifications.water.title': 'Пора попить воды',
  'notifications.water.body': 'Небольшой стакан сейчас поможет сохранить ритм.',
  'notifications.habit.body': 'Пора выполнить запланированную привычку.',
  'dataTransfer.exportDialogTitle': 'Экспорт данных Sanctum',
  'dataTransfer.exportFailedTitle': 'Ошибка экспорта',
  'dataTransfer.exportFailedBody':
    'Не удалось экспортировать данные. Попробуйте ещё раз.',
  'dataTransfer.importFailedTitle': 'Ошибка импорта',
  'dataTransfer.importFailedBody':
    'Выбранный файл не является корректным экспортом Sanctum.',
  'planning.task.titleRequired': 'Введите название задачи.',
  'planning.task.categoryRequired': 'Выберите категорию.',
  'planning.task.dateInvalid': 'Выберите корректную дату.',
  'planning.task.timeInvalid': 'Выберите корректное время.',
  'planning.habit.nameRequired': 'Введите название привычки.',
  'planning.habit.scheduleRequired': 'Выберите хотя бы один день.',
  'planning.habit.targetInvalid':
    'Цель должна быть положительным целым числом.',
  'planning.habit.reminderInvalid': 'Выберите корректное время напоминания.',
};

const translations = { en, ru } as const;

export type TranslationKey = keyof typeof en;

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'en';

export const normalizeAppLanguage = (value: unknown): AppLanguage =>
  value === 'ru' ? 'ru' : DEFAULT_APP_LANGUAGE;

export const getDeviceLanguage = (): AppLanguage => {
  const intlApi = getIntlApi();
  const locale =
    typeof intlApi?.DateTimeFormat === 'function'
      ? intlApi.DateTimeFormat().resolvedOptions().locale?.toLowerCase()
      : undefined;
  if (locale?.startsWith('ru')) {
    return 'ru';
  }

  return DEFAULT_APP_LANGUAGE;
};

export const getLocale = (language: AppLanguage) => localeMap[language];

export const translate = (
  language: AppLanguage,
  key: TranslationKey,
  params: TranslationParams = {},
) => {
  const value = translations[language][key] ?? en[key];
  if (typeof value === 'function') {
    return value(params, language);
  }

  return interpolate(value, params);
};

export const getLanguageLabel = (language: AppLanguage, value: AppLanguage) =>
  translate(language, value === 'ru' ? 'language.russian' : 'language.english');

export const getThemeModeLabel = (
  language: AppLanguage,
  value: 'system' | 'light' | 'dark',
) => translate(language, `theme.${value}` as TranslationKey);

export const getThemeModeHint = (
  language: AppLanguage,
  value: 'system' | 'light' | 'dark',
) => translate(language, `theme.hint.${value}` as TranslationKey);

export const getTimeFormatLabel = (
  language: AppLanguage,
  value: '12h' | '24h',
) => translate(language, `timeFormat.${value}` as TranslationKey);

export const getTaskPriorityLabel = (
  language: AppLanguage,
  value: TaskPriority,
) => translate(language, `task.priority.${value}` as TranslationKey);

export const getTaskFilterLabel = (language: AppLanguage, value: TaskFilter) =>
  value === 'all' ||
  value === 'overdue' ||
  value === 'completed' ||
  value === 'archived'
    ? translate(language, `task.filter.${value}` as TranslationKey)
    : value;

export const getPresetTaskCategoryLabel = (
  language: AppLanguage,
  id: string,
) => {
  if (
    id === 'work' ||
    id === 'personal' ||
    id === 'health' ||
    id === 'study' ||
    id === 'home'
  ) {
    return translate(language, `task.category.${id}` as TranslationKey);
  }

  return null;
};

export const getTaskCategoryLabel = (
  category: Pick<TaskCategoryEntity, 'id' | 'kind' | 'label'>,
  language: AppLanguage,
) =>
  category.kind === 'preset'
    ? (getPresetTaskCategoryLabel(language, category.id) ?? category.label)
    : category.label;
