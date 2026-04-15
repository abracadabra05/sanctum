import { useCallback, useEffect, useRef, useState } from 'react';
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

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';

interface CreateHabitSheetProps {
  visible: boolean;
  onClose: () => void;
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
  id: string | null;
  name: string;
  icon: 'sparkles' | 'circle' | 'leaf' | 'book' | 'moon';
  accentColor: string;
  goalMode: 'daily' | 'weekly';
  targetPerPeriod: string;
  schedule: number[];
  reminderEnabled: boolean;
  reminderTime: string;
};

const createDraft = (): HabitDraft => ({
  id: null,
  name: '',
  icon: 'sparkles',
  accentColor: '#CFF4F1',
  goalMode: 'daily',
  targetPerPeriod: '1',
  schedule: [1, 2, 3, 4, 5],
  reminderEnabled: false,
  reminderTime: '20:00',
});

export function CreateHabitSheet({ visible, onClose }: CreateHabitSheetProps) {
  const theme = useTheme();
  const createHabit = useAppStore((state) => state.createHabit);
  const [draft, setDraft] = useState<HabitDraft>(createDraft);
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
      setDraft(createDraft());
    });
  }, [translateYValue, onClose]);

  const sheetPanResponder = useCallback(
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
    if (!draft.name.trim() || draft.schedule.length === 0) return;
    createHabit({
      name: draft.name.trim(),
      icon: draft.icon,
      accentColor: draft.accentColor,
      goalMode: draft.goalMode,
      targetPerPeriod: Number(draft.targetPerPeriod) || 1,
      schedule: { days: draft.schedule as (0 | 1 | 2 | 3 | 4 | 5 | 6)[] },
      reminder: {
        enabled: draft.reminderEnabled,
        time: draft.reminderEnabled ? draft.reminderTime : null,
      },
    });
    closeSheet();
  };

  const panHandlers = sheetPanResponder().panHandlers;

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
          <View {...panHandlers} style={styles.dragArea}>
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: theme.colors.divider },
              ]}
            />
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Create habit
          </Text>
          <TextInput
            onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
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
                  onPress={() => setDraft((d) => ({ ...d, icon }))}
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
                    setDraft((d) => ({ ...d, accentColor: color }))
                  }
                  style={[
                    styles.swatch,
                    { backgroundColor: color },
                    draft.accentColor === color && {
                      borderWidth: 3,
                      borderColor: theme.colors.brandStrong,
                    },
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
                  onPress={() => setDraft((d) => ({ ...d, goalMode: mode }))}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: active
                        ? theme.colors.brand
                        : theme.colors.surfaceMuted,
                    },
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
            onChangeText={(v) =>
              setDraft((d) => ({ ...d, targetPerPeriod: v }))
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
                    setDraft((d) => ({
                      ...d,
                      schedule: active
                        ? d.schedule.filter((item) => item !== day)
                        : [...d.schedule, day].sort(),
                    }))
                  }
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: active
                        ? theme.colors.brand
                        : theme.colors.surfaceMuted,
                    },
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
                setDraft((d) => ({ ...d, reminderEnabled: !d.reminderEnabled }))
              }
              style={[
                styles.segment,
                {
                  backgroundColor: draft.reminderEnabled
                    ? theme.colors.brand
                    : theme.colors.surfaceMuted,
                },
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
              onChangeText={(v) => setDraft((d) => ({ ...d, reminderTime: v }))}
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
});
