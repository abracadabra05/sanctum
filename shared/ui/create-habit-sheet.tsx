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
  buildHabitDraftFromHabit,
  createHabitDraft,
  getDraftErrors,
  reminderTimePresets,
  validateHabitDraft,
} from '@/shared/lib/planning-forms';
import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { HabitItem } from '@/shared/types/app';
import { TimeStepper } from '@/shared/ui/time-stepper';
import { useDraggableSheet } from '@/shared/ui/use-draggable-sheet';

interface CreateHabitSheetProps {
  visible: boolean;
  onClose: () => void;
  initialHabit?: HabitItem | null;
}

const habitIcons: HabitItem['icon'][] = [
  'sparkles',
  'circle',
  'leaf',
  'book',
  'moon',
];

const habitColors = ['#CFF4F1', '#EFD7E7', '#DCEEFF', '#F9E4C8', '#E8E3FF'];

export function CreateHabitSheet({
  visible,
  onClose,
  initialHabit,
}: CreateHabitSheetProps) {
  const theme = useTheme();
  const createHabit = useAppStore((state) => state.createHabit);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const archiveHabit = useAppStore((state) => state.archiveHabit);
  const timeFormat = useAppStore((state) => state.preferences.timeFormat);
  const setLastArchivedItem = useUiStore((state) => state.setLastArchivedItem);
  const [draft, setDraft] = useState(createHabitDraft);
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
    sheetBlockKey: 'habit-sheet',
    dragBlockKey: 'habit-sheet-drag',
  });

  const validation = useMemo(() => validateHabitDraft(draft), [draft]);
  const errors = validation.success
    ? {}
    : getDraftErrors(validation.error.issues);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraft(
      initialHabit
        ? buildHabitDraftFromHabit(initialHabit)
        : createHabitDraft(),
    );
    setShowErrors(false);
  }, [initialHabit, visible]);

  const handleSave = () => {
    if (!validation.success) {
      setShowErrors(true);
      return;
    }

    const payload = {
      name: draft.name.trim(),
      icon: draft.icon,
      accentColor: draft.accentColor,
      goalMode: draft.goalMode,
      targetPerPeriod: Number(draft.targetPerPeriod),
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
                borderColor:
                  showErrors && errors.name
                    ? theme.colors.accentRed
                    : 'transparent',
              },
            ]}
            value={draft.name}
          />
          {showErrors && errors.name ? (
            <Text style={[styles.errorText, { color: theme.colors.accentRed }]}>
              {errors.name}
            </Text>
          ) : null}

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
                            ? theme.colors.textOnTint
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
                          ? theme.colors.textOnTint
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
              setDraft((current) => ({
                ...current,
                targetPerPeriod: value.replace(/[^0-9]/g, ''),
              }))
            }
            placeholder="Target per period"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input,
                color: theme.colors.textPrimary,
                borderColor:
                  showErrors && errors.targetPerPeriod
                    ? theme.colors.accentRed
                    : 'transparent',
              },
            ]}
            value={draft.targetPerPeriod}
          />
          {showErrors && errors.targetPerPeriod ? (
            <Text style={[styles.errorText, { color: theme.colors.accentRed }]}>
              {errors.targetPerPeriod}
            </Text>
          ) : null}

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
          {showErrors && errors.schedule ? (
            <Text style={[styles.errorText, { color: theme.colors.accentRed }]}>
              {errors.schedule}
            </Text>
          ) : null}

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
                      ? theme.colors.textOnTint
                      : theme.colors.textPrimary,
                  },
                ]}
              >
                Reminder
              </Text>
            </Pressable>
          </View>

          <TimeStepper
            disabled={!draft.reminderEnabled}
            label="Reminder time"
            onChange={(reminderTime) =>
              setDraft((current) => ({ ...current, reminderTime }))
            }
            presets={reminderTimePresets}
            timeFormat={timeFormat}
            value={draft.reminderTime}
          />
          {showErrors && errors.reminderTime ? (
            <Text style={[styles.errorText, { color: theme.colors.accentRed }]}>
              {errors.reminderTime}
            </Text>
          ) : null}

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
    borderWidth: 1,
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
