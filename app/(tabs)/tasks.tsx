import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import {
  buildTaskSections,
  getTaskCompletion,
} from '@/features/tasks/selectors';
import {
  getTaskCategoryLabel,
  getTaskFilterLabel,
  useI18n,
} from '@/shared/i18n';
import {
  addDays,
  extractLocalTime,
  formatDateTimeLabel,
  toDateKey,
} from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { TaskItem, TaskListItemViewModel } from '@/shared/types/app';
import { CreateTaskSheet } from '@/shared/ui/create-task-sheet';
import { EmptyState } from '@/shared/ui/empty-state';
import { ProgressRing } from '@/shared/ui/progress-ring';
import type { RadialFabItem } from '@/shared/ui/radial-fab';
import { RadialFab } from '@/shared/ui/radial-fab';
import { ScreenShell } from '@/shared/ui/screen-shell';
import { TaskCard } from '@/shared/ui/task-card';
import { TaskSearchOverlay } from '@/shared/ui/task-search-overlay';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function TasksHeader({ onOpenSearch }: { onOpenSearch: () => void }) {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <View style={styles.headerWrap}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          {t('tasks.header')}
        </Text>
        <Pressable onPress={onOpenSearch} style={styles.headerIconButton}>
          <Ionicons color={theme.colors.iconNeutral} name="search" size={24} />
        </Pressable>
      </View>
    </View>
  );
}

const buildArchivedItem = (
  task: TaskItem,
  categoryLabel: string,
  timeFormat: '12h' | '24h',
  locale: string,
  archivedLabel: string,
): TaskListItemViewModel => ({
  task,
  category: {
    id: task.categoryId,
    label: categoryLabel,
    color: '#E8EDF4',
    kind: 'preset',
    archived: false,
    archivedAt: null,
  },
  occurrence: {
    occurrenceDate: toDateKey(new Date(task.dueAt)),
    displayTime: task.archivedAt
      ? `${archivedLabel} ${formatDateTimeLabel(task.archivedAt, timeFormat, {
          includeWeekday: true,
          locale,
        })}`
      : archivedLabel,
    isCompleted: Boolean(task.completedAt),
  },
  searchText: [task.title, task.notes, categoryLabel, task.priority, 'archived']
    .join(' ')
    .toLowerCase(),
});

export default function TasksScreen() {
  const theme = useTheme();
  const { language, locale, t } = useI18n();
  const tasks = useAppStore((state) => state.tasks);
  const taskCompletions = useAppStore((state) => state.taskCompletions);
  const taskCategories = useAppStore((state) => state.taskCategories);
  const filter = useAppStore((state) => state.activeTaskFilter);
  const setTaskFilter = useAppStore((state) => state.setTaskFilter);
  const completeTaskOccurrence = useAppStore(
    (state) => state.completeTaskOccurrence,
  );
  const archiveTask = useAppStore((state) => state.archiveTask);
  const restoreTask = useAppStore((state) => state.restoreTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const preferences = useAppStore((state) => state.preferences);
  const isFocused = useIsFocused();
  const pendingQuickAction = useUiStore((state) => state.pendingQuickAction);
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const setLastArchivedItem = useUiStore((state) => state.setLastArchivedItem);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIncludeArchived, setSearchIncludeArchived] = useState(false);
  const [filterLayouts, setFilterLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});
  const pillTranslateX = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [filter]);

  const categories = useMemo(
    () => taskCategories.filter((item) => !item.archived),
    [taskCategories],
  );

  const filterItems = useMemo(
    () => [
      'all',
      'overdue',
      'completed',
      'archived',
      ...categories.map((item) => item.id),
    ],
    [categories],
  );

  useEffect(() => {
    const layout = filterLayouts[filter];
    if (!layout) {
      return;
    }

    Animated.parallel([
      Animated.spring(pillTranslateX, {
        toValue: layout.x,
        damping: 18,
        stiffness: 180,
        useNativeDriver: false,
      }),
      Animated.spring(pillWidth, {
        toValue: layout.width,
        damping: 18,
        stiffness: 180,
        useNativeDriver: false,
      }),
      Animated.timing(pillOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: false,
      }),
    ]).start();
  }, [filter, filterLayouts, pillOpacity, pillTranslateX, pillWidth]);

  const handleFilterLayout =
    (item: string) =>
    ({ nativeEvent }: LayoutChangeEvent) => {
      const { x, width } = nativeEvent.layout;
      setFilterLayouts((current) => ({
        ...current,
        [item]: { x, width },
      }));
    };

  const openCreate = useCallback(() => {
    setEditingTask(null);
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }

      setEditingTask(task);
      setSheetOpen(true);
    },
    [tasks],
  );

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    if (pendingQuickAction === 'open-task-search') {
      useUiStore.getState().consumeQuickAction();
      setSearchOpen(true);
    }

    if (pendingQuickAction === 'open-create-task') {
      useUiStore.getState().consumeQuickAction();
      openCreate();
    }
  }, [isFocused, openCreate, pendingQuickAction]);

  const sections = useMemo(
    () =>
      buildTaskSections({
        tasks,
        filter,
        completions: taskCompletions,
        categories,
        timeFormat: preferences.timeFormat,
        language,
      }),
    [
      categories,
      filter,
      language,
      preferences.timeFormat,
      taskCompletions,
      tasks,
    ],
  );

  const searchSections = useMemo(
    () =>
      buildTaskSections({
        tasks,
        filter: 'all',
        completions: taskCompletions,
        categories,
        timeFormat: preferences.timeFormat,
        language,
      }),
    [categories, language, preferences.timeFormat, taskCompletions, tasks],
  );

  const archivedItems = useMemo(
    () =>
      tasks
        .filter((task) => task.archived)
        .sort((left, right) => {
          const leftTime = left.archivedAt
            ? new Date(left.archivedAt).getTime()
            : 0;
          const rightTime = right.archivedAt
            ? new Date(right.archivedAt).getTime()
            : 0;
          return rightTime - leftTime;
        })
        .map((task) => {
          const sourceCategory = taskCategories.find(
            (item) => item.id === task.categoryId,
          ) ?? {
            id: 'uncategorized',
            label: t('task.category.uncategorized'),
            color: '#E8EDF4',
            kind: 'preset' as const,
            archived: false,
            archivedAt: null,
          };
          const categoryLabel = getTaskCategoryLabel(sourceCategory, language);
          return buildArchivedItem(
            task,
            categoryLabel,
            preferences.timeFormat,
            locale,
            t('tasks.archived.status'),
          );
        }),
    [language, locale, preferences.timeFormat, t, taskCategories, tasks],
  );

  const overlayDataset = useMemo(
    () => [
      ...searchSections.flatMap((section) => section.tasks),
      ...(searchIncludeArchived ? archivedItems : []),
    ],
    [archivedItems, searchIncludeArchived, searchSections],
  );

  const overlayResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return overlayDataset;
    }

    return overlayDataset.filter((item) => item.searchText?.includes(query));
  }, [overlayDataset, searchQuery]);

  const focusCompletion = useMemo(
    () => getTaskCompletion(tasks, taskCompletions),
    [taskCompletions, tasks],
  );

  const archiveMode = filter === 'archived';

  const handleArchiveTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }

      archiveTask(taskId);
      setLastArchivedItem({
        id: task.id,
        kind: 'task',
        title: task.title,
      });
    },
    [archiveTask, setLastArchivedItem, tasks],
  );

  const handleQuickReschedule = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }

      updateTask(taskId, {
        dueDate: toDateKey(addDays(new Date(), 1)),
        dueTime: extractLocalTime(task.dueAt),
      });
    },
    [tasks, updateTask],
  );

  const closeSearchOverlay = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchIncludeArchived(false);
  }, []);

  return (
    <>
      <ScreenShell
        header={<TasksHeader onOpenSearch={() => setSearchOpen(true)} />}
      >
        <View
          style={[
            styles.focusCard,
            {
              backgroundColor: theme.colors.surfaceFloating,
              shadowColor: theme.shadows.card.shadowColor,
              shadowOffset: theme.shadows.card.shadowOffset,
              shadowOpacity: theme.shadows.card.shadowOpacity,
              shadowRadius: theme.shadows.card.shadowRadius,
              elevation: theme.shadows.card.elevation,
            },
          ]}
        >
          <Text style={[styles.focusEyebrow, { color: theme.colors.brand }]}>
            {t('tasks.focus.eyebrow')}
          </Text>
          <Text
            style={[styles.focusTitle, { color: theme.colors.textPrimary }]}
          >
            {t('tasks.focus.title')}
          </Text>
          <Text
            style={[styles.focusBody, { color: theme.colors.textSecondary }]}
          >
            {t('tasks.focus.body')}
          </Text>
          <ProgressRing
            centerCaption={t('tasks.focus.centerCaption')}
            centerLabel={`${focusCompletion}%`}
            percentage={focusCompletion}
            size={148}
            thickness={16}
            variant="focus"
          />
        </View>

        <ScrollView
          horizontal
          onTouchCancel={() => setGestureBlock('task-filter-scroll', false)}
          onTouchEnd={() => setGestureBlock('task-filter-scroll', false)}
          onTouchStart={() => setGestureBlock('task-filter-scroll', true)}
          showsHorizontalScrollIndicator={false}
        >
          <View
            style={[
              styles.filterTrack,
              {
                backgroundColor: theme.colors.surfaceFloating,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.filterPill,
                {
                  backgroundColor: theme.colors.brand,
                  opacity: pillOpacity,
                  transform: [{ translateX: pillTranslateX }],
                  width: pillWidth,
                },
              ]}
            />
            {filterItems.map((item) => {
              const active = item === filter;
              const category = categories.find((entry) => entry.id === item);
              const label = category
                ? getTaskCategoryLabel(category, language)
                : getTaskFilterLabel(language, item);
              return (
                <Pressable
                  key={item}
                  onLayout={handleFilterLayout(item)}
                  onPress={() => setTaskFilter(item)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    pressed && styles.filterChipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      {
                        color: active
                          ? theme.colors.textOnTint
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {archiveMode ? (
          <View style={styles.sectionStack}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t('tasks.archived.title')}
              </Text>
              <Text
                style={[
                  styles.resultCount,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t('tasks.archived.count', { count: archivedItems.length })}
              </Text>
            </View>
            {archivedItems.length ? (
              archivedItems.map((item) => (
                <View
                  key={`${item.task.id}-${item.occurrence.occurrenceDate}`}
                  style={[
                    styles.archivedRow,
                    { backgroundColor: theme.colors.surfaceFloating },
                  ]}
                >
                  <View style={styles.archivedBody}>
                    <Text
                      style={[
                        styles.archivedTitle,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {item.task.title}
                    </Text>
                    <Text
                      style={[
                        styles.archivedMeta,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {item.category.label} • {item.occurrence.displayTime}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => restoreTask(item.task.id)}
                    style={({ pressed }) => [
                      styles.restoreButton,
                      { backgroundColor: theme.colors.surfaceActive },
                      pressed && styles.filterChipPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.restoreLabel,
                        { color: theme.colors.brand },
                      ]}
                    >
                      {t('common.restore')}
                    </Text>
                  </Pressable>
                </View>
              ))
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: theme.colors.surfaceMuted },
                ]}
              >
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {t('tasks.archived.emptyTitle')}
                </Text>
                <Text
                  style={[
                    styles.emptyBody,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t('tasks.archived.emptyBody')}
                </Text>
              </View>
            )}
          </View>
        ) : sections.length > 0 ? (
          sections.map((section) => (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionAccent,
                    { backgroundColor: section.accentColor },
                  ]}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {section.title}
                </Text>
              </View>
              <View style={styles.sectionStack}>
                {section.tasks.map((item) => (
                  <TaskCard
                    key={`${item.task.id}-${item.occurrence.occurrenceDate}`}
                    item={item}
                    onArchive={handleArchiveTask}
                    onEdit={openEdit}
                    onSecondaryAction={
                      section.id === 'overdue'
                        ? handleQuickReschedule
                        : undefined
                    }
                    onToggle={completeTaskOccurrence}
                    secondaryActionLabel={
                      section.id === 'overdue'
                        ? t('tasks.secondary.moveTomorrow')
                        : undefined
                    }
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="tasks"
            title={t('tasks.empty.title')}
            description={t('tasks.empty.body')}
          />
        )}
      </ScreenShell>

      <TaskSearchOverlay
        includeArchived={searchIncludeArchived}
        onChangeQuery={setSearchQuery}
        onClose={closeSearchOverlay}
        onSelect={(item) => {
          closeSearchOverlay();
          openEdit(item.task.id);
        }}
        onToggleIncludeArchived={() =>
          setSearchIncludeArchived((current) => !current)
        }
        query={searchQuery}
        results={overlayResults}
        scopeLabel={
          searchIncludeArchived
            ? t('tasks.search.scopeArchived')
            : t('tasks.search.scopeActive')
        }
        visible={searchOpen}
      />

      <RadialFab
        onPress={openCreate}
        items={
          [
            {
              id: 'create-task',
              label: t('tasks.fab.addTask'),
              icon: { name: 'add-circle-outline', type: 'ionicon' },
              onPress: openCreate,
            },
            {
              id: 'search',
              label: t('tasks.fab.search'),
              icon: { name: 'search-outline', type: 'ionicon' },
              onPress: () => setSearchOpen(true),
            },
          ] as RadialFabItem[]
        }
      />

      <CreateTaskSheet
        visible={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingTask(null);
        }}
        initialCategoryId={categories[0]?.id}
        initialTask={editingTask}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusCard: {
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  focusEyebrow: { ...typography.eyebrow, fontSize: 12 },
  focusTitle: { ...typography.h1, fontSize: 26, lineHeight: 32 },
  focusBody: {
    ...typography.caption,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  filterTrack: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  filterPill: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    borderRadius: radii.pill,
  },
  filterChip: {
    zIndex: 1,
    minHeight: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterChipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  filterLabel: { ...typography.caption, fontSize: 14 },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionAccent: { width: 6, height: 30, borderRadius: 999 },
  sectionTitle: { ...typography.h2 },
  resultCount: { ...typography.caption },
  sectionStack: { gap: spacing.md },
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  archivedBody: {
    flex: 1,
    gap: 4,
  },
  archivedTitle: { ...typography.bodyStrong },
  archivedMeta: { ...typography.caption },
  restoreButton: {
    minHeight: 42,
    minWidth: 88,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  restoreLabel: { ...typography.bodyStrong, fontSize: 15 },
  emptyCard: {
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  emptyTitle: { ...typography.bodyStrong },
  emptyBody: { ...typography.body },
});
