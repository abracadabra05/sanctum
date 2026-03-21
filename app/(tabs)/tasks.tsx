import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { buildTaskSections } from '@/features/tasks/selectors';
import { toDateKey } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import type { TaskPriority, TaskRepeatRule } from '@/shared/types/app';
import { ProgressRing } from '@/shared/ui/progress-ring';
import { ScreenShell } from '@/shared/ui/screen-shell';
import { TaskCard } from '@/shared/ui/task-card';

function TasksHeader() {
  return (
    <View style={styles.header}>
      <Ionicons color={colors.textSecondary} name="menu" size={28} />
      <Text style={styles.headerTitle}>Sanctum</Text>
      <Ionicons color={colors.textSecondary} name="search" size={26} />
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
  const [draft, setDraft] = useState(createInitialDraft());

  useEffect(() => {
    if (!isReady) {
      void hydrate();
    }
  }, [hydrate, isReady]);

  useEffect(() => {
    rolloverDayIfNeeded();
  }, [rolloverDayIfNeeded]);

  const categories = useMemo(
    () => taskCategories.filter((item) => !item.archived),
    [taskCategories],
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
  const focusCompletion = useMemo(() => {
    const todayTasks = tasks.filter((task) => !task.archived);
    if (!todayTasks.length) return 0;
    const completedCount = taskCompletions.filter(
      (item) => item.occurrenceDate === toDateKey(new Date()),
    ).length;
    return Math.round((completedCount / todayTasks.length) * 100);
  }, [taskCompletions, tasks]);

  const openCreate = () => {
    setDraft({
      ...createInitialDraft(),
      categoryId: categories[0]?.id ?? 'work',
    });
    setModalOpen(true);
  };

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

  return (
    <>
      <ScreenShell header={<TasksHeader />}>
        <View style={styles.focusCard}>
          <Text style={styles.focusEyebrow}>Daily Pulse</Text>
          <Text style={styles.focusTitle}>Today&apos;s Focus</Text>
          <Text style={styles.focusBody}>
            A flexible task system with repeat rules, categories and priorities.
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
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      active && styles.filterLabelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionAccent,
                  { backgroundColor: section.accentColor },
                ]}
              />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionStack}>
              {section.tasks.map((item) => (
                <TaskCard
                  key={`${item.task.id}-${item.occurrence.occurrenceDate}`}
                  item={item}
                  onEdit={openEdit}
                  onToggle={completeTaskOccurrence}
                />
              ))}
            </View>
          </View>
        ))}

        <Pressable onPress={openCreate} style={styles.fab}>
          <Ionicons color={colors.surface} name="add" size={38} />
        </Pressable>
      </ScreenShell>

      <Modal animationType="slide" transparent visible={modalOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {draft.id ? 'Edit task' : 'Create task'}
            </Text>
            <TextInput
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, title: value }))
              }
              placeholder="Task title"
              style={styles.input}
              value={draft.title}
            />
            <TextInput
              multiline
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, notes: value }))
              }
              placeholder="Notes"
              style={[styles.input, styles.notesInput]}
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
                    style={[
                      styles.filterChip,
                      draft.categoryId === category.id &&
                        styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterLabel,
                        draft.categoryId === category.id &&
                          styles.filterLabelActive,
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
                style={[styles.input, styles.inlineInput]}
                value={draft.dueDate}
              />
              <TextInput
                onChangeText={(value) =>
                  setDraft((current) => ({ ...current, dueTime: value }))
                }
                placeholder="HH:MM"
                style={[styles.input, styles.inlineInput]}
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
                    style={[
                      styles.filterChip,
                      draft.priority === priority && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterLabel,
                        draft.priority === priority && styles.filterLabelActive,
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
                    style={[
                      styles.filterChip,
                      draft.repeatRule.type === option.value.type &&
                        styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterLabel,
                        draft.repeatRule.type === option.value.type &&
                          styles.filterLabelActive,
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
                    setModalOpen(false);
                  }}
                  style={[styles.bottomButton, styles.archiveButton]}
                >
                  <Text style={styles.archiveLabel}>Archive</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => setModalOpen(false)}
                style={[styles.bottomButton, styles.cancelButton]}
              >
                <Text style={styles.cancelLabel}>Close</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!draft.title.trim()) return;
                  if (draft.id) {
                    const { id, ...patch } = draft;
                    updateTask(draft.id, patch);
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
                  setModalOpen(false);
                }}
                style={[styles.bottomButton, styles.saveButton]}
              >
                <Text style={styles.saveLabel}>
                  {draft.id ? 'Save' : 'Create'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 23, fontWeight: '700', color: colors.textPrimary },
  focusCard: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: 30,
    ...shadows.card,
  },
  focusEyebrow: { ...typography.eyebrow, color: colors.brand },
  focusTitle: { ...typography.h1, fontSize: 30, color: colors.textPrimary },
  focusBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  optionRow: { flexDirection: 'row', gap: spacing.sm },
  filterChip: {
    borderRadius: radii.pill,
    backgroundColor: '#E8EDF4',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  filterChipActive: { backgroundColor: colors.brand },
  filterLabel: { ...typography.bodyStrong, color: '#253448' },
  filterLabelActive: { color: colors.surface },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionAccent: { width: 6, height: 30, borderRadius: 999 },
  sectionTitle: { ...typography.h2, color: colors.textPrimary },
  sectionStack: { gap: spacing.md },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 24,
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    ...shadows.button,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.28)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  sheetTitle: { ...typography.h2, color: colors.textPrimary },
  input: {
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
    color: colors.textPrimary,
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
  archiveButton: { backgroundColor: '#FCE5E5' },
  archiveLabel: { ...typography.bodyStrong, color: colors.accentRed },
  cancelButton: { backgroundColor: '#E8EDF4' },
  cancelLabel: { ...typography.bodyStrong, color: colors.textPrimary },
  saveButton: { backgroundColor: colors.brand },
  saveLabel: { ...typography.bodyStrong, color: colors.surface },
});
