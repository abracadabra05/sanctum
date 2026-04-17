import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutAnimation,
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
  getTaskCompletionRecord,
} from '@/features/tasks/selectors';
import { toDateKey } from '@/shared/lib/date';
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

  return (
    <View style={styles.headerWrap}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Tasks
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
): TaskListItemViewModel => ({
  task,
  category: {
    id: task.categoryId,
    label: categoryLabel,
    color: '#E8EDF4',
    kind: 'preset',
    archived: false,
  },
  occurrence: {
    occurrenceDate: toDateKey(new Date(task.dueAt)),
    displayTime: task.archivedAt
      ? `Archived ${new Date(task.archivedAt).toLocaleDateString()}`
      : 'Archived',
    isCompleted: Boolean(task.completedAt),
  },
  searchText: [task.title, task.notes, categoryLabel, task.priority, 'archived']
    .join(' ')
    .toLowerCase(),
});

export default function TasksScreen() {
  const theme = useTheme();
  const isReady = useAppStore((state) => state.isReady);
  const hydrate = useAppStore((state) => state.hydrate);
  const rolloverDayIfNeeded = useAppStore((state) => state.rolloverDayIfNeeded);
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
  const preferences = useAppStore((state) => state.preferences);
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const setLastArchivedItem = useUiStore((state) => state.setLastArchivedItem);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isReady) {
      void hydrate();
    }
  }, [hydrate, isReady]);

  useEffect(() => {
    rolloverDayIfNeeded();
  }, [rolloverDayIfNeeded]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [filter]);

  const categories = useMemo(
    () => taskCategories.filter((item) => !item.archived),
    [taskCategories],
  );

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

  useFocusEffect(
    useCallback(() => {
      const quickAction = useUiStore.getState().consumeQuickAction();
      if (quickAction === 'open-task-search') {
        setSearchOpen(true);
      }
      if (quickAction === 'open-create-task') {
        openCreate();
      }
    }, [openCreate]),
  );

  const sections = useMemo(
    () =>
      buildTaskSections({
        tasks,
        filter,
        completions: taskCompletions,
        categories,
        timeFormat: preferences.timeFormat,
      }),
    [categories, filter, preferences.timeFormat, taskCompletions, tasks],
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
          const categoryLabel =
            categories.find((item) => item.id === task.categoryId)?.label ??
            'Uncategorized';
          return buildArchivedItem(task, categoryLabel);
        }),
    [categories, tasks],
  );

  const overlayDataset = useMemo(
    () =>
      filter === 'archived'
        ? archivedItems
        : sections.flatMap((section) => section.tasks),
    [archivedItems, filter, sections],
  );

  const overlayResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return overlayDataset;
    }

    return overlayDataset.filter((item) => item.searchText?.includes(query));
  }, [overlayDataset, searchQuery]);

  const focusCompletion = useMemo(() => {
    const todayTasks = tasks.filter((task) => !task.archived);
    if (!todayTasks.length) {
      return 0;
    }

    const todayKey = toDateKey(new Date());
    const completedCount = todayTasks.filter((task) =>
      Boolean(getTaskCompletionRecord(task.id, todayKey, taskCompletions)),
    ).length;

    return Math.round((completedCount / todayTasks.length) * 100);
  }, [taskCompletions, tasks]);

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

  const closeSearchOverlay = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
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
            Daily Pulse
          </Text>
          <Text
            style={[styles.focusTitle, { color: theme.colors.textPrimary }]}
          >
            Today&apos;s Focus
          </Text>
          <Text
            style={[styles.focusBody, { color: theme.colors.textSecondary }]}
          >
            Search, sort and complete your day without visual clutter.
          </Text>
          <ProgressRing
            centerCaption="Done"
            centerLabel={`${focusCompletion}%`}
            percentage={focusCompletion}
            size={170}
            thickness={18}
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
          <View style={styles.filterRow}>
            {[
              'all',
              'overdue',
              'completed',
              'archived',
              ...categories.map((item) => item.id),
            ].map((item) => {
              const active = item === filter;
              const label =
                categories.find((category) => category.id === item)?.label ??
                item.charAt(0).toUpperCase() + item.slice(1);
              return (
                <Pressable
                  key={item}
                  onPress={() => setTaskFilter(item)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: active
                        ? theme.colors.brand
                        : theme.colors.surfaceMuted,
                    },
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
                Archived
              </Text>
              <Text
                style={[
                  styles.resultCount,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {archivedItems.length} items
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
                      Restore
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
                  No archived tasks
                </Text>
                <Text
                  style={[
                    styles.emptyBody,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Archived tasks will appear here and can be restored at any
                  time.
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
                    onToggle={completeTaskOccurrence}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="tasks"
            title="No tasks yet"
            description="Tap the + button to create your first task and start organizing your day."
          />
        )}
      </ScreenShell>

      <TaskSearchOverlay
        onChangeQuery={setSearchQuery}
        onClose={closeSearchOverlay}
        onSelect={(item) => {
          closeSearchOverlay();
          openEdit(item.task.id);
        }}
        query={searchQuery}
        results={overlayResults}
        visible={searchOpen}
      />

      <RadialFab
        onPress={openCreate}
        items={
          [
            {
              id: 'create-task',
              label: 'Add task',
              icon: { name: 'add-circle-outline', type: 'ionicon' },
              onPress: openCreate,
            },
            {
              id: 'search',
              label: 'Search',
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
    gap: spacing.md,
    borderRadius: radii.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: 28,
  },
  focusEyebrow: { ...typography.eyebrow },
  focusTitle: { ...typography.h1, fontSize: 30 },
  focusBody: {
    ...typography.body,
    textAlign: 'center',
  },
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  filterChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  filterChipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  filterLabel: { ...typography.bodyStrong },
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
