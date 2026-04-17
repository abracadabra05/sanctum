import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { toDateKey } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type {
  TaskItem,
  TaskPriority,
  TaskRepeatRule,
} from '@/shared/types/app';

interface CreateTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  initialCategoryId?: string;
  initialTask?: TaskItem | null;
}

interface TaskDraft {
  title: string;
  notes: string;
  categoryId: string;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  repeatRule: TaskRepeatRule;
}

const priorities: TaskPriority[] = ['low', 'medium', 'high'];
const repeatOptions: { label: string; value: TaskRepeatRule }[] = [
  { label: 'None', value: { type: 'none' } },
  { label: 'Daily', value: { type: 'daily' } },
  { label: 'Weekdays', value: { type: 'weekdays' } },
  { label: 'Weekly', value: { type: 'weekly', day: 1 } },
  { label: 'Custom', value: { type: 'custom', days: [1, 3, 5] } },
];

const createTaskDraft = (categoryId: string): TaskDraft => ({
  title: '',
  notes: '',
  categoryId,
  dueDate: toDateKey(new Date()),
  dueTime: '18:00',
  priority: 'medium',
  repeatRule: { type: 'none' },
});

const buildDraftFromTask = (task: TaskItem): TaskDraft => {
  const due = new Date(task.dueAt);
  return {
    title: task.title,
    notes: task.notes,
    categoryId: task.categoryId,
    dueDate: toDateKey(due),
    dueTime: `${String(due.getHours()).padStart(2, '0')}:${String(
      due.getMinutes(),
    ).padStart(2, '0')}`,
    priority: task.priority,
    repeatRule: task.repeatRule,
  };
};

export function CreateTaskSheet({
  visible,
  onClose,
  initialCategoryId,
  initialTask,
}: CreateTaskSheetProps) {
  const theme = useTheme();
  const taskCategories = useAppStore((state) => state.taskCategories);
  const createTask = useAppStore((state) => state.createTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const archiveTask = useAppStore((state) => state.archiveTask);
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const setLastArchivedItem = useUiStore((state) => state.setLastArchivedItem);

  const categories = useMemo(
    () => taskCategories.filter((item) => !item.archived),
    [taskCategories],
  );

  const fallbackCategoryId = initialCategoryId ?? categories[0]?.id ?? 'work';
  const [draft, setDraft] = useState<TaskDraft>(() =>
    createTaskDraft(fallbackCategoryId),
  );
  const translateYValue = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    setGestureBlock('task-sheet', visible);

    if (!visible) {
      return;
    }

    const nextCategoryId =
      initialTask?.categoryId ??
      initialCategoryId ??
      categories[0]?.id ??
      'work';

    setDraft(
      initialTask
        ? buildDraftFromTask(initialTask)
        : createTaskDraft(nextCategoryId),
    );
    translateYValue.setValue(800);

    Animated.spring(translateYValue, {
      toValue: 0,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  }, [
    categories,
    initialCategoryId,
    initialTask,
    setGestureBlock,
    translateYValue,
    visible,
  ]);

  const closeSheet = useCallback(() => {
    Animated.timing(translateYValue, {
      toValue: 800,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, translateYValue]);

  const resetSheetPosition = useCallback(() => {
    Animated.spring(translateYValue, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  }, [translateYValue]);

  const sheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dy) > Math.abs(gs.dx) && gs.dy > 8,
        onPanResponderMove: (_, gs) => {
          translateYValue.setValue(Math.max(0, gs.dy));
        },
        onPanResponderRelease: (_, gs) => {
          if (gs.dy > 110 || gs.vy > 1.2) {
            closeSheet();
            return;
          }
          resetSheetPosition();
        },
        onPanResponderTerminate: resetSheetPosition,
      }),
    [closeSheet, resetSheetPosition, translateYValue],
  );

  const handleSave = () => {
    if (!draft.title.trim()) {
      return;
    }

    if (initialTask) {
      updateTask(initialTask.id, {
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
        priority: draft.priority,
        repeatRule: draft.repeatRule,
        categoryId: draft.categoryId,
        dueDate: draft.dueDate,
        dueTime: draft.dueTime,
      });
    }

    closeSheet();
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={closeSheet}
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surfaceFloating,
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
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {initialTask ? 'Edit task' : 'Create task'}
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
                    styles.chip,
                    {
                      backgroundColor:
                        draft.categoryId === category.id
                          ? theme.colors.brand
                          : theme.colors.surfaceMuted,
                    },
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
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
                    styles.chip,
                    {
                      backgroundColor:
                        draft.priority === priority
                          ? theme.colors.brand
                          : theme.colors.surfaceMuted,
                    },
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
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
                    styles.chip,
                    {
                      backgroundColor:
                        draft.repeatRule.type === option.value.type
                          ? theme.colors.brand
                          : theme.colors.surfaceMuted,
                    },
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
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
          <View style={styles.actions}>
            {initialTask ? (
              <Pressable
                onPress={() => {
                  archiveTask(initialTask.id);
                  setLastArchivedItem({
                    id: initialTask.id,
                    kind: 'task',
                    title: initialTask.title,
                  });
                  closeSheet();
                }}
                style={[
                  styles.btn,
                  { backgroundColor: theme.colors.accentRedSoft },
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
              style={[
                styles.btn,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <Text
                style={[
                  styles.actionLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Close
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[styles.btn, { backgroundColor: theme.colors.brand }]}
            >
              <Text
                style={[styles.actionLabel, { color: theme.colors.surface }]}
              >
                {initialTask ? 'Save' : 'Create'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
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
  dragHandle: { width: 52, height: 5, borderRadius: 999 },
  title: { ...typography.h2 },
  input: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
  },
  notesInput: { minHeight: 60, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipPressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
  chipLabel: { ...typography.caption },
  inlineRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  inlineInput: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveLabel: { ...typography.bodyStrong },
  actionLabel: { ...typography.bodyStrong },
});
