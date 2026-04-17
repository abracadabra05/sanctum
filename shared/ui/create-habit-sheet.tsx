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

import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { HabitItem } from '@/shared/types/app';

interface CreateHabitSheetProps {
  visible: boolean;
  onClose: () => void;
  initialHabit?: HabitItem | null;
}

const habitIcons: ('sparkles' | 'circle' | 'leaf' | 'book' | 'moon')[] = [
  'sparkles',
  'circle',
  'leaf',
  'book',
  'moon',
];

const habitColors = ['#CFF4F1', '#EFD7E7', '#DCEEFF', '#F9E4C8', '#E8E3FF'];

type HabitDraft = {
  name: string;
  icon: HabitItem['icon'];
  accentColor: string;
  goalMode: HabitItem['goalMode'];
  targetPerPeriod: string;
  schedule: number[];
  reminderEnabled: boolean;
  reminderTime: string;
};

const createDraft = (): HabitDraft => ({
  name: '',
  icon: 'sparkles',
  accentColor: '#CFF4F1',
  goalMode: 'daily',
  targetPerPeriod: '1',
  schedule: [1, 2, 3, 4, 5],
  reminderEnabled: false,
  reminderTime: '20:00',
});

const buildDraftFromHabit = (habit: HabitItem): HabitDraft => ({
  name: habit.name,
  icon: habit.icon,
  accentColor: habit.accentColor,
  goalMode: habit.goalMode,
  targetPerPeriod: String(habit.targetPerPeriod),
  schedule: [...habit.schedule.days],
  reminderEnabled: habit.reminder.enabled,
  reminderTime: habit.reminder.time ?? '20:00',
});

export function CreateHabitSheet({
  visible,
  onClose,
  initialHabit,
}: CreateHabitSheetProps) {
  const theme = useTheme();
  const createHabit = useAppStore((state) => state.createHabit);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const archiveHabit = useAppStore((state) => state.archiveHabit);
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const setLastArchivedItem = useUiStore((state) => state.setLastArchivedItem);
  const [draft, setDraft] = useState<HabitDraft>(createDraft);
  const translateYValue = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    setGestureBlock('habit-sheet', visible);

    if (!visible) {
      return;
    }

    setDraft(initialHabit ? buildDraftFromHabit(initialHabit) : createDraft());
    translateYValue.setValue(800);

    Animated.spring(translateYValue, {
      toValue: 0,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  }, [initialHabit, setGestureBlock, translateYValue, visible]);

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
    if (!draft.name.trim() || draft.schedule.length === 0) {
      return;
    }

    const payload = {
      name: draft.name.trim(),
      icon: draft.icon,
      accentColor: draft.accentColor,
      goalMode: draft.goalMode,
      targetPerPeriod: Number(draft.targetPerPeriod) || 1,
      schedule: {
        days: draft.schedule as (0 | 1 | 2 | 3 | 4 | 5 | 6)[],
      },
      reminder: {
        enabled: draft.reminderEnabled,
        time: draft.reminderEnabled ? draft.reminderTime : null,
      },
    };

    if (initialHabit) {
      updateHabit(initialHabit.id, payload);
    } else {
      createHabit(payload);
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
            {initialHabit ? 'Edit habit' : 'Create habit'}
          </Text>
          <TextInput
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, name: value }))
            }
            placeholder="Habit name"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input,
                color: theme.colors.textPrimary,
              },
            ]}
            value={draft.name}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {habitIcons.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setDraft((current) => ({ ...current, icon }))}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor:
                        draft.icon === icon
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
                          draft.icon === icon
                            ? theme.colors.surface
                            : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {icon}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {habitColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      accentColor: color,
                    }))
                  }
                  style={({ pressed }) => [
                    styles.swatch,
                    { backgroundColor: color },
                    draft.accentColor === color && {
                      borderWidth: 3,
                      borderColor: theme.colors.brandStrong,
                    },
                    pressed && styles.chipPressed,
                  ]}
                />
              ))}
            </View>
          </ScrollView>
          <View style={styles.segmentRow}>
            {(['daily', 'weekly'] as const).map((mode) => {
              const active = draft.goalMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() =>
                    setDraft((current) => ({ ...current, goalMode: mode }))
                  }
                  style={({ pressed }) => [
                    styles.segment,
                    {
                      backgroundColor: active
                        ? theme.colors.brand
                        : theme.colors.surfaceMuted,
                    },
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      {
                        color: active
                          ? theme.colors.surface
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {mode}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, targetPerPeriod: value }))
            }
            placeholder="Target per period"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input,
                color: theme.colors.textPrimary,
              },
            ]}
            value={draft.targetPerPeriod}
          />
          <Text
            style={[styles.inlineLabel, { color: theme.colors.textSecondary }]}
          >
            Schedule
          </Text>
          <View style={styles.optionsRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, day) => {
              const active = draft.schedule.includes(day);
              return (
                <Pressable
                  key={`${label}-${day}`}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      schedule: active
                        ? current.schedule.filter((item) => item !== day)
                        : [...current.schedule, day].sort(),
                    }))
                  }
                  style={({ pressed }) => [
                    styles.dayChip,
                    {
                      backgroundColor: active
                        ? theme.colors.brand
                        : theme.colors.surfaceMuted,
                    },
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
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
          <View style={styles.inlineRow}>
            <Pressable
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  reminderEnabled: !current.reminderEnabled,
                }))
              }
              style={({ pressed }) => [
                styles.segment,
                {
                  backgroundColor: draft.reminderEnabled
                    ? theme.colors.brand
                    : theme.colors.surfaceMuted,
                },
                pressed && styles.chipPressed,
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    color: draft.reminderEnabled
                      ? theme.colors.surface
                      : theme.colors.textPrimary,
                  },
                ]}
              >
                Reminder
              </Text>
            </Pressable>
            <TextInput
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, reminderTime: value }))
              }
              placeholder="20:00"
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.input,
                styles.inlineInput,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={draft.reminderTime}
            />
          </View>
          <View style={styles.actions}>
            {initialHabit ? (
              <Pressable
                onPress={() => {
                  archiveHabit(initialHabit.id);
                  setLastArchivedItem({
                    id: initialHabit.id,
                    kind: 'habit',
                    title: initialHabit.name,
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
                {initialHabit ? 'Save' : 'Create'}
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
  optionsRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipPressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
  chipLabel: { ...typography.caption, textTransform: 'uppercase' },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  segmentRow: { flexDirection: 'row', gap: spacing.sm },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentLabel: { ...typography.bodyStrong },
  inlineLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
