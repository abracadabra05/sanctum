import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

import {
  buildTaskDraftFromTask,
  createTaskDraft,
  getDraftErrors,
  getTaskDatePresets,
  taskRepeatOptions,
  taskTimePresets,
  validateTaskDraft,
} from '@/shared/lib/planning-forms';
import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { TaskItem, TaskPriority } from '@/shared/types/app';
import { DateStepper } from '@/shared/ui/date-stepper';
import { TimeStepper } from '@/shared/ui/time-stepper';
import { useDraggableSheet } from '@/shared/ui/use-draggable-sheet';

interface CreateTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  initialCategoryId?: string;
  initialTask?: TaskItem | null;
}

const priorities: TaskPriority[] = ['low', 'medium', 'high'];

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
  const timeFormat = useAppStore((state) => state.preferences.timeFormat);
  const setLastArchivedItem = useUiStore((state) => state.setLastArchivedItem);

  const categories = useMemo(
    () => taskCategories.filter((item) => !item.archived),
    [taskCategories],
  );
  const fallbackCategoryId = initialCategoryId ?? categories[0]?.id ?? 'work';
  const [draft, setDraft] = useState(() => createTaskDraft(fallbackCategoryId));
  const [showErrors, setShowErrors] = useState(false);
  const {
    closeSheet,
    handleSheetGestureEvent,
    handleSheetStateChange,
    overlayOpacity,
    translateYValue,
  } = useDraggableSheet({
    visible,
    onClose,
    sheetBlockKey: 'task-sheet',
    dragBlockKey: 'task-sheet-drag',
  });

  const validation = useMemo(() => validateTaskDraft(draft), [draft]);
  const errors = validation.success
    ? {}
    : getDraftErrors(validation.error.issues);

  useEffect(() => {
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
        ? buildTaskDraftFromTask(initialTask)
        : createTaskDraft(nextCategoryId),
    );
    setShowErrors(false);
  }, [categories, initialCategoryId, initialTask, visible]);

  const handleSave = () => {
    if (!validation.success) {
      setShowErrors(true);
      return;
    }

    if (initialTask) {
      updateTask(initialTask.id, {
        title: draft.title.trim(),
        notes: draft.notes.trim(),
        categoryId: draft.categoryId,
        dueDate: draft.dueDate,
        dueTime: draft.dueTime,
        priority: draft.priority,
        repeatRule: draft.repeatRule,
      });
    } else {
      createTask({
        title: draft.title.trim(),
        notes: draft.notes.trim(),
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
      onRequestClose={closeSheet}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.overlay, opacity: overlayOpacity },
          ]}
        />
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
          <PanGestureHandler
            activeOffsetY={12}
            failOffsetX={[-12, 12]}
            onGestureEvent={handleSheetGestureEvent}
            onHandlerStateChange={handleSheetStateChange}
          >
            <View style={styles.dragArea}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: theme.colors.divider },
                ]}
              />
            </View>
          </PanGestureHandler>

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
                borderColor:
                  showErrors && errors.title
                    ? theme.colors.accentRed
                    : 'transparent',
              },
            ]}
            value={draft.title}
          />
          {showErrors && errors.title ? (
            <Text style={[styles.errorText, { color: theme.colors.accentRed }]}>
              {errors.title}
            </Text>
          ) : null}

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
                            ? theme.colors.textOnTint
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

          <DateStepper
            label="Due date"
            onChange={(dueDate) =>
              setDraft((current) => ({ ...current, dueDate }))
            }
            presets={getTaskDatePresets()}
            value={draft.dueDate}
          />

          <TimeStepper
            label="Due time"
            onChange={(dueTime) =>
              setDraft((current) => ({ ...current, dueTime }))
            }
            presets={taskTimePresets}
            timeFormat={timeFormat}
            value={draft.dueTime}
          />

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
                            ? theme.colors.textOnTint
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
              {taskRepeatOptions.map((option) => (
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
                            ? theme.colors.textOnTint
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

          {showErrors && errors.form ? (
            <Text style={[styles.errorText, { color: theme.colors.accentRed }]}>
              {errors.form}
            </Text>
          ) : null}

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
              style={[
                styles.btn,
                {
                  opacity: validation.success ? 1 : 0.7,
                  backgroundColor: theme.colors.brand,
                },
              ]}
            >
              <Text
                style={[styles.actionLabel, { color: theme.colors.textOnTint }]}
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
    borderWidth: 1,
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
  errorText: { ...typography.caption, marginTop: -spacing.sm },
});
