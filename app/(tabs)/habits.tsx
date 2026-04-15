import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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

import { getHabitCards } from '@/features/habits/selectors';
import { toDateKey } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { EmptyState } from '@/shared/ui/empty-state';
import { HabitCard } from '@/shared/ui/habit-card';
import type { RadialFabItem } from '@/shared/ui/radial-fab';
import { RadialFab } from '@/shared/ui/radial-fab';
import { ScreenShell } from '@/shared/ui/screen-shell';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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

const createHabitDraft = (): HabitDraft => ({
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

export default function HabitsScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ compose?: string }>();
  const router = useRouter();
  const isReady = useAppStore((state) => state.isReady);
  const hydrate = useAppStore((state) => state.hydrate);
  const habits = useAppStore((state) => state.habits);
  const preferences = useAppStore((state) => state.preferences);
  const markHabitComplete = useAppStore((state) => state.markHabitComplete);
  const createHabit = useAppStore((state) => state.createHabit);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const archiveHabit = useAppStore((state) => state.archiveHabit);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<HabitDraft>(createHabitDraft());
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [showArchived, modalOpen]);

  useEffect(() => {
    if (params.compose === '1') {
      setDraft(createHabitDraft());
      setModalOpen(true);
      router.replace('/(tabs)/habits');
    }
  }, [params.compose, router]);

  const cards = useMemo(
    () =>
      getHabitCards(
        habits.filter((habit) => habit.archived === showArchived),
        preferences.timeFormat,
      ),
    [habits, preferences.timeFormat, showArchived],
  );

  return (
    <>
      <ScreenShell
        header={
          <View style={styles.header}>
            <Text
              style={[styles.headerTitle, { color: theme.colors.textPrimary }]}
            >
              Habits
            </Text>
            <Pressable
              onPress={() => {
                setDraft(createHabitDraft());
                setModalOpen(true);
              }}
              style={styles.headerAction}
            >
              <Ionicons
                color={theme.colors.iconNeutral}
                name="add-circle"
                size={28}
              />
            </Pressable>
          </View>
        }
      >
        <View
          style={[
            styles.summary,
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
          <Text style={[styles.eyebrow, { color: theme.colors.brand }]}>
            Consistency
          </Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Keep your rituals alive
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Habits hold streaks, schedules and reminders without mixing into
            one-off tasks.
          </Text>
        </View>

        <View style={styles.segmentRow}>
          {[
            { id: 'active', label: 'Active' },
            { id: 'archived', label: 'Archived' },
          ].map((item) => {
            const active = (item.id === 'archived') === showArchived;
            return (
              <Pressable
                key={item.id}
                onPress={() => setShowArchived(item.id === 'archived')}
                style={({ pressed }) => [
                  styles.segment,
                  {
                    backgroundColor: active
                      ? theme.colors.brand
                      : theme.colors.surfaceMuted,
                  },
                  pressed && styles.segmentPressed,
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
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.grid}>
          {cards.length > 0 ? (
            cards.map((habit) => (
              <View key={habit.id}>
                <HabitCard
                  habit={habit}
                  onLongPress={() => {
                    const item = habits.find((entry) => entry.id === habit.id);
                    if (!item) return;
                    setDraft({
                      id: item.id,
                      name: item.name,
                      icon: item.icon,
                      accentColor: item.accentColor,
                      goalMode: item.goalMode,
                      targetPerPeriod: String(item.targetPerPeriod),
                      schedule: item.schedule.days,
                      reminderEnabled: item.reminder.enabled,
                      reminderTime: item.reminder.time ?? '20:00',
                    });
                    setModalOpen(true);
                  }}
                  onPress={() =>
                    markHabitComplete(habit.id, toDateKey(new Date()))
                  }
                />
              </View>
            ))
          ) : (
            <EmptyState
              icon="habits"
              title={showArchived ? 'No archived habits' : 'No habits yet'}
              description={
                showArchived
                  ? 'Your archived habits will appear here.'
                  : 'Tap the + button to create your first habit.'
              }
            />
          )}
        </View>
      </ScreenShell>

      <RadialFab
        onPress={() => {
          setDraft(createHabitDraft());
          setModalOpen(true);
        }}
        items={
          [
            {
              id: 'create-habit',
              label: 'Add habit',
              icon: { name: 'leaf-outline', type: 'ionicon' },
              onPress: () => {
                setDraft(createHabitDraft());
                setModalOpen(true);
              },
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
              {draft.id ? 'Edit habit' : 'Create habit'}
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
                    onPress={() =>
                      setDraft((current) => ({ ...current, icon }))
                    }
                    style={({ pressed }) => [
                      styles.optionChip,
                      {
                        backgroundColor:
                          draft.icon === icon
                            ? theme.colors.brand
                            : theme.colors.surfaceMuted,
                      },
                      pressed && styles.segmentPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
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
                      styles.colorSwatch,
                      { backgroundColor: color },
                      draft.accentColor === color && {
                        borderWidth: 3,
                        borderColor: theme.colors.brandStrong,
                      },
                      pressed && styles.segmentPressed,
                    ]}
                  />
                ))}
              </View>
            </ScrollView>
            <View style={styles.segmentRow}>
              {['daily', 'weekly'].map((mode) => {
                const active = draft.goalMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        goalMode: mode as 'daily' | 'weekly',
                      }))
                    }
                    style={({ pressed }) => [
                      styles.segment,
                      {
                        backgroundColor: active
                          ? theme.colors.brand
                          : theme.colors.surfaceMuted,
                      },
                      pressed && styles.segmentPressed,
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
              style={[
                styles.inlineLabel,
                { color: theme.colors.textSecondary },
              ]}
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
                      pressed && styles.segmentPressed,
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
                  pressed && styles.segmentPressed,
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
            <View style={styles.actionRow}>
              {draft.id ? (
                <Pressable
                  onPress={() => {
                    archiveHabit(draft.id!);
                    closeSheet();
                  }}
                  style={({ pressed }) => [
                    styles.bottomButton,
                    { backgroundColor: theme.colors.accentRedSoft },
                    pressed && styles.segmentPressed,
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
                  pressed && styles.segmentPressed,
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
                  if (!draft.name.trim() || draft.schedule.length === 0) return;
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
                  if (draft.id) {
                    updateHabit(draft.id, payload);
                  } else {
                    createHabit(payload);
                  }
                  closeSheet();
                }}
                style={({ pressed }) => [
                  styles.bottomButton,
                  { backgroundColor: theme.colors.brand },
                  pressed && styles.segmentPressed,
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    gap: spacing.sm,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  eyebrow: { ...typography.eyebrow },
  title: { ...typography.h1 },
  body: { ...typography.body },
  segmentRow: { flexDirection: 'row', gap: spacing.sm },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  segmentLabel: { ...typography.bodyStrong },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
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
  optionsRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  optionChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  colorSwatch: { width: 30, height: 30, borderRadius: 15 },
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
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  bottomButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveLabel: { ...typography.bodyStrong },
  cancelLabel: { ...typography.bodyStrong },
  saveLabel: { ...typography.bodyStrong },
});
