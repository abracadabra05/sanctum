import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';

import {
  buildTaskSections,
  filterTaskListByQuery,
} from '@/features/tasks/selectors';
import { toDateKey } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { TaskPriority, TaskRepeatRule } from '@/shared/types/app';
import { EmptyState } from '@/shared/ui/empty-state';
import { ProgressRing } from '@/shared/ui/progress-ring';
import type { RadialFabItem } from '@/shared/ui/radial-fab';
import { RadialFab } from '@/shared/ui/radial-fab';
import { ScreenShell } from '@/shared/ui/screen-shell';
import { TaskCard } from '@/shared/ui/task-card';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function TasksHeader({
  searchOpen,
  onOpenSearch,
  onCloseSearch,
  query,
  onChangeQuery,
}: {
  searchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  query: string;
  onChangeQuery: (value: string) => void;
}) {
  const theme = useTheme();
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const searchTranslate = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(searchOpacity, {
        toValue: searchOpen ? 1 : 0,
        duration: searchOpen ? 220 : 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(searchTranslate, {
        toValue: searchOpen ? 0 : -8,
        duration: searchOpen ? 220 : 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [searchOpacity, searchOpen, searchTranslate]);

  return (
    <View style={styles.headerWrap}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Tasks
        </Text>
        <Pressable
          onPress={searchOpen ? onCloseSearch : onOpenSearch}
          style={styles.headerIconButton}
        >
          <Ionicons
            color={theme.colors.iconNeutral}
            name={searchOpen ? 'close' : 'search'}
            size={24}
          />
        </Pressable>
      </View>
      {searchOpen ? (
        <Animated.View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              opacity: searchOpacity,
              transform: [{ translateY: searchTranslate }],
            },
          ]}
        >
          <Ionicons
            color={theme.colors.textSecondary}
            name="search"
            size={18}
          />
          <TextInput
            autoFocus
            onChangeText={onChangeQuery}
            placeholder="Search by title, notes, category, priority..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            value={query}
          />
          {query ? (
            <Pressable onPress={() => onChangeQuery('')}>
              <Ionicons
                color={theme.colors.textMuted}
                name="close-circle"
                size={18}
              />
            </Pressable>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}

const priorities: TaskPriority[] = ['low', 'medium', 'high'];
const repeatOptions: { label: string; value: TaskRepeatRule }[] = [
  { label: 'None', value: { type: 'none' } },
  { label: 'Daily', value: { type: 'daily' } },
  { label: 'Weekdays', value: { type: 'weekdays' } },
  { label: 'Weekly', value: { type: 'weekly', day: 1 } },
  { label: 'Custom', value: { type: 'custom', days: [1, 3, 5] } },
];

const createInitialDraft = () => ({
  id: null as string | null,
  title: '',
  notes: '',
  categoryId: 'work',
  dueDate: toDateKey(new Date()),
  dueTime: '18:00',
  priority: 'medium' as TaskPriority,
  repeatRule: { type: 'none' } as TaskRepeatRule,
});

export default function TasksScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ compose?: string; search?: string }>();
  const router = useRouter();
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
  const createTask = useAppStore((state) => state.createTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const archiveTask = useAppStore((state) => state.archiveTask);
  const preferences = useAppStore((state) => state.preferences);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [draft, setDraft] = useState(createInitialDraft());
  const translateYValue = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    if (modalOpen) {
      Animated.spring(translateYValue, {
        toValue: 0,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
    }
  }, [modalOpen, translateYValue]);

  const closeSheet = useCallback(() => {
    Animated.timing(translateYValue, {
      toValue: 800,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setModalOpen(false);
    });
  }, [translateYValue]);

  const sheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          gestureState.dy > 8,
        onPanResponderMove: (_, gestureState) => {
          translateYValue.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 110 || gestureState.vy > 1.2) {
            closeSheet();
            return;
          }
          Animated.spring(translateYValue, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateYValue, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        },
      }),
    [closeSheet, translateYValue],
  );

  useEffect(() => {
    if (!isReady) {
      void hydrate();
    }
  }, [hydrate, isReady]);

  useEffect(() => {
    rolloverDayIfNeeded();
  }, [rolloverDayIfNeeded]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [debouncedQuery, filter, searchOpen]);

  const categories = useMemo(
    () => taskCategories.filter((item) => !item.archived),
    [taskCategories],
  );

  const openCreate = useCallback(() => {
    setDraft({
      ...createInitialDraft(),
      categoryId: categories[0]?.id ?? 'work',
    });
    setModalOpen(true);
  }, [categories]);

  useEffect(() => {
    if (params.compose === '1') {
      openCreate();
      router.replace('/(tabs)/tasks');
    }
  }, [openCreate, params.compose, router]);

  useEffect(() => {
    if (params.search === '1') {
      setSearchOpen(true);
      router.replace('/(tabs)/tasks');
    }
  }, [params.search, router]);

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

  const searchedSections = useMemo(
    () => filterTaskListByQuery(sections, debouncedQuery),
    [debouncedQuery, sections],
  );

  const searchResults = useMemo(
    () => searchedSections.flatMap((section) => section.tasks),
    [searchedSections],
  );

  const focusCompletion = useMemo(() => {
    const todayTasks = tasks.filter((task) => !task.archived);
    if (!todayTasks.length) return 0;
    const completedCount = taskCompletions.filter(
      (item) => item.occurrenceDate === toDateKey(new Date()),
    ).length;
    return Math.round((completedCount / todayTasks.length) * 100);
  }, [taskCompletions, tasks]);

  const openEdit = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const due = new Date(task.dueAt);
    setDraft({
      id: task.id,
      title: task.title,
      notes: task.notes,
      categoryId: task.categoryId,
      dueDate: toDateKey(due),
      dueTime: `${String(due.getHours()).padStart(2, '0')}:${String(due.getMinutes()).padStart(2, '0')}`,
      priority: task.priority,
      repeatRule: task.repeatRule,
    });
    setModalOpen(true);
  };

  const showFlatResults = Boolean(debouncedQuery);

  return (
    <>
      <ScreenShell
        header={
          <TasksHeader
            searchOpen={searchOpen}
            onOpenSearch={() => setSearchOpen(true)}
            onCloseSearch={() => {
              setSearchOpen(false);
              setSearchQuery('');
            }}
            query={searchQuery}
            onChangeQuery={setSearchQuery}
          />
        }
      >
        <View
          style={[
            styles.focusCard,
            {
              backgroundColor: theme.colors.surfaceElevated,
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {[
              'all',
              'overdue',
              'completed',
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
                          ? theme.colors.surface
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

        {showFlatResults ? (
          <View style={styles.sectionStack}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Search results
              </Text>
              <Text
                style={[
                  styles.resultCount,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {searchResults.length} found
              </Text>
            </View>
            {searchResults.length ? (
              searchResults.map((item) => (
                <TaskCard
                  key={`${item.task.id}-${item.occurrence.occurrenceDate}`}
                  item={item}
                  onArchive={archiveTask}
                  onEdit={openEdit}
                  onToggle={completeTaskOccurrence}
                />
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
                  No tasks match that search
                </Text>
                <Text
                  style={[
                    styles.emptyBody,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Try another phrase or clear the search field.
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
                    onArchive={archiveTask}
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

      <RadialFab
        onPress={openCreate}
        items={
          [
            {
              id: 'search',
              label: 'Search',
              icon: { name: 'search-outline', type: 'ionicon' },
              onPress: () => setSearchOpen(true),
            },
            {
              id: 'create-task',
              label: 'Add task',
              icon: { name: 'add-circle-outline', type: 'ionicon' },
              onPress: openCreate,
            },
          ] as RadialFabItem[]
        }
      />

      <Modal
        animationType="none"
        transparent
        visible={modalOpen}
        onRequestClose={closeSheet}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: theme.colors.overlay },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.surfaceElevated,
                transform: [{ translateY: translateYValue }],
              },
            ]}
          >
            <View {...sheetPanResponder.panHandlers} style={styles.dragArea}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: theme.colors.divider },
                ]}
              />
            </View>
            <Text
              style={[styles.sheetTitle, { color: theme.colors.textPrimary }]}
            >
              {draft.id ? 'Edit task' : 'Create task'}
            </Text>
            <TextInput
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, title: value }))
              }
              placeholder="Task title"
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={draft.title}
            />
            <TextInput
              multiline
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, notes: value }))
              }
              placeholder="Notes"
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.input,
                styles.notesInput,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={draft.notes}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionRow}>
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        categoryId: category.id,
                      }))
                    }
                    style={({ pressed }) => [
                      styles.filterChip,
                      {
                        backgroundColor:
                          draft.categoryId === category.id
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
                          color:
                            draft.categoryId === category.id
                              ? theme.colors.surface
                              : theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <View style={styles.inlineRow}>
              <TextInput
                onChangeText={(value) =>
                  setDraft((current) => ({ ...current, dueDate: value }))
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  styles.inlineInput,
                  {
                    backgroundColor: theme.colors.input,
                    color: theme.colors.textPrimary,
                  },
                ]}
                value={draft.dueDate}
              />
              <TextInput
                onChangeText={(value) =>
                  setDraft((current) => ({ ...current, dueTime: value }))
                }
                placeholder="HH:MM"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  styles.inlineInput,
                  {
                    backgroundColor: theme.colors.input,
                    color: theme.colors.textPrimary,
                  },
                ]}
                value={draft.dueTime}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionRow}>
                {priorities.map((priority) => (
                  <Pressable
                    key={priority}
                    onPress={() =>
                      setDraft((current) => ({ ...current, priority }))
                    }
                    style={({ pressed }) => [
                      styles.filterChip,
                      {
                        backgroundColor:
                          draft.priority === priority
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
                          color:
                            draft.priority === priority
                              ? theme.colors.surface
                              : theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {priority}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionRow}>
                {repeatOptions.map((option) => (
                  <Pressable
                    key={option.label}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        repeatRule: option.value,
                      }))
                    }
                    style={({ pressed }) => [
                      styles.filterChip,
                      {
                        backgroundColor:
                          draft.repeatRule.type === option.value.type
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
                          color:
                            draft.repeatRule.type === option.value.type
                              ? theme.colors.surface
                              : theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <View style={styles.sheetActions}>
              {draft.id ? (
                <Pressable
                  onPress={() => {
                    archiveTask(draft.id!);
                    closeSheet();
                  }}
                  style={({ pressed }) => [
                    styles.bottomButton,
                    { backgroundColor: theme.colors.accentRedSoft },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.archiveLabel,
                      { color: theme.colors.accentRed },
                    ]}
                  >
                    Archive
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={closeSheet}
                style={({ pressed }) => [
                  styles.bottomButton,
                  { backgroundColor: theme.colors.surfaceMuted },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.cancelLabel,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Close
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!draft.title.trim()) return;
                  if (draft.id) {
                    updateTask(draft.id, {
                      title: draft.title.trim(),
                      notes: draft.notes,
                      categoryId: draft.categoryId,
                      dueDate: draft.dueDate,
                      dueTime: draft.dueTime,
                      priority: draft.priority,
                      repeatRule: draft.repeatRule,
                    });
                  } else {
                    createTask({
                      title: draft.title.trim(),
                      notes: draft.notes,
                      categoryId: draft.categoryId,
                      dueDate: draft.dueDate,
                      dueTime: draft.dueTime,
                      priority: draft.priority,
                      repeatRule: draft.repeatRule,
                    });
                  }
                  closeSheet();
                }}
                style={({ pressed }) => [
                  styles.bottomButton,
                  { backgroundColor: theme.colors.brand },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[styles.saveLabel, { color: theme.colors.surface }]}
                >
                  {draft.id ? 'Save' : 'Create'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
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
  optionRow: { flexDirection: 'row', gap: spacing.sm },
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
  emptyCard: {
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  emptyTitle: { ...typography.bodyStrong },
  emptyBody: { ...typography.body },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 24,
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  dragArea: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dragHandle: {
    width: 52,
    height: 5,
    borderRadius: 999,
  },
  sheetTitle: { ...typography.h2 },
  input: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
  },
  notesInput: { minHeight: 88, textAlignVertical: 'top' },
  inlineRow: { flexDirection: 'row', gap: spacing.sm },
  inlineInput: { flex: 1 },
  sheetActions: { flexDirection: 'row', gap: spacing.sm },
  bottomButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  archiveLabel: { ...typography.bodyStrong },
  cancelLabel: { ...typography.bodyStrong },
  saveLabel: { ...typography.bodyStrong },
});
