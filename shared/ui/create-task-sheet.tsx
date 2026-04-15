import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { TaskPriority, TaskRepeatRule } from '@/shared/types/app';

interface CreateTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  initialCategoryId?: string;
}

const priorities: TaskPriority[] = ['low', 'medium', 'high'];
const repeatOptions: { label: string; value: TaskRepeatRule }[] = [
  { label: 'None', value: { type: 'none' } },
  { label: 'Daily', value: { type: 'daily' } },
  { label: 'Weekdays', value: { type: 'weekdays' } },
  { label: 'Weekly', value: { type: 'weekly', day: 1 } },
  { label: 'Custom', value: { type: 'custom', days: [1, 3, 5] } },
];

const createInitialDraft = (categoryId: string) => ({
  id: null as string | null,
  title: '',
  notes: '',
  categoryId,
  dueDate: toDateKey(new Date()),
  dueTime: '18:00',
  priority: 'medium' as TaskPriority,
  repeatRule: { type: 'none' } as TaskRepeatRule,
});

export function CreateTaskSheet({
  visible,
  onClose,
  initialCategoryId,
}: CreateTaskSheetProps) {
  const theme = useTheme();
  const taskCategories = useAppStore((state) => state.taskCategories);
  const createTask = useAppStore((state) => state.createTask);

  const categories = useMemo(
    () => taskCategories.filter((item) => !item.archived),
    [taskCategories],
  );

  const draftCategoryId = initialCategoryId ?? categories[0]?.id ?? 'work';
  const [draft, setDraft] = useState(() => createInitialDraft(draftCategoryId));
  const translateYValue = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateYValue, {
        toValue: 0,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateYValue]);

  const closeSheet = useCallback(() => {
    Animated.timing(translateYValue, {
      toValue: 800,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [translateYValue, onClose]);

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

  const handleSave = () => {
    if (!draft.title.trim()) return;
    createTask({
      title: draft.title.trim(),
      notes: draft.notes,
      priority: draft.priority,
      repeatRule: draft.repeatRule,
      categoryId: draft.categoryId,
      dueDate: draft.dueDate,
      dueTime: draft.dueTime,
    });
    setDraft(createInitialDraft(draftCategoryId));
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
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Create task
          </Text>
          <TextInput
            onChangeText={(v) => setDraft((d) => ({ ...d, title: v }))}
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
            onChangeText={(v) => setDraft((d) => ({ ...d, notes: v }))}
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
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    setDraft((d) => ({ ...d, categoryId: cat.id }))
                  }
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor:
                        draft.categoryId === cat.id
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
                          draft.categoryId === cat.id
                            ? theme.colors.surface
                            : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <View style={styles.inlineRow}>
            <TextInput
              onChangeText={(v) => setDraft((d) => ({ ...d, dueDate: v }))}
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
              onChangeText={(v) => setDraft((d) => ({ ...d, dueTime: v }))}
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
              {priorities.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setDraft((d) => ({ ...d, priority: p }))}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor:
                        draft.priority === p
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
                          draft.priority === p
                            ? theme.colors.surface
                            : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionRow}>
              {repeatOptions.map((opt) => (
                <Pressable
                  key={opt.label}
                  onPress={() =>
                    setDraft((d) => ({ ...d, repeatRule: opt.value }))
                  }
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor:
                        draft.repeatRule.type === opt.value.type
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
                          draft.repeatRule.type === opt.value.type
                            ? theme.colors.surface
                            : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              onPress={closeSheet}
              style={[
                styles.btn,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <Text style={{ color: theme.colors.textPrimary }}>Close</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[styles.btn, { backgroundColor: theme.colors.brand }]}
            >
              <Text style={{ color: theme.colors.surface }}>Create</Text>
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
});
