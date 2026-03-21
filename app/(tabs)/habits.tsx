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

import { getHabitCards } from '@/features/habits/selectors';
import { toDateKey } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { HabitCard } from '@/shared/ui/habit-card';
import { ScreenShell } from '@/shared/ui/screen-shell';

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

  useEffect(() => {
    if (!isReady) {
      void hydrate();
    }
  }, [hydrate, isReady]);

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
            <Text style={styles.headerTitle}>Habit Garden</Text>
            <Pressable
              onPress={() => {
                setDraft(createHabitDraft());
                setModalOpen(true);
              }}
            >
              <Ionicons
                color={colors.textSecondary}
                name="add-circle"
                size={28}
              />
            </Pressable>
          </View>
        }
      >
        <View style={styles.summary}>
          <Text style={styles.eyebrow}>Consistency</Text>
          <Text style={styles.title}>Keep your rituals alive</Text>
          <Text style={styles.body}>
            Habits keep streaks, schedules and reminders separate from one-off
            tasks.
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
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    active && styles.segmentLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.grid}>
          {cards.map((habit) => (
            <HabitCard
              habit={habit}
              key={habit.id}
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
              onPress={() => markHabitComplete(habit.id, toDateKey(new Date()))}
            />
          ))}
        </View>
      </ScreenShell>

      <Modal animationType="slide" transparent visible={modalOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {draft.id ? 'Edit habit' : 'Create habit'}
            </Text>
            <TextInput
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, name: value }))
              }
              placeholder="Habit name"
              style={styles.input}
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
                    style={[
                      styles.optionChip,
                      draft.icon === icon && styles.optionChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        draft.icon === icon && styles.optionLabelActive,
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
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      draft.accentColor === color && styles.colorSwatchActive,
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
                    style={[styles.segment, active && styles.segmentActive]}
                  >
                    <Text
                      style={[
                        styles.segmentLabel,
                        active && styles.segmentLabelActive,
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
              style={styles.input}
              value={draft.targetPerPeriod}
            />
            <Text style={styles.inlineLabel}>Schedule</Text>
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
                    style={[styles.dayChip, active && styles.segmentActive]}
                  >
                    <Text
                      style={[
                        styles.segmentLabel,
                        active && styles.segmentLabelActive,
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
                style={[
                  styles.segment,
                  draft.reminderEnabled && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    draft.reminderEnabled && styles.segmentLabelActive,
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
                style={[styles.input, styles.inlineInput]}
                value={draft.reminderTime}
              />
            </View>
            <View style={styles.actionRow}>
              {draft.id ? (
                <Pressable
                  onPress={() => {
                    archiveHabit(draft.id!);
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
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  summary: {
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    ...shadows.card,
  },
  eyebrow: { ...typography.eyebrow, color: colors.brand },
  title: { ...typography.h1, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  segmentRow: { flexDirection: 'row', gap: spacing.sm },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: '#E8EDF4',
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: colors.brand },
  segmentLabel: { ...typography.bodyStrong, color: colors.textPrimary },
  segmentLabelActive: { color: colors.surface },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
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
  optionsRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  optionChip: {
    borderRadius: radii.pill,
    backgroundColor: '#E8EDF4',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionChipActive: { backgroundColor: colors.brand },
  optionLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  optionLabelActive: { color: colors.surface },
  colorSwatch: { width: 30, height: 30, borderRadius: 15 },
  colorSwatchActive: { borderWidth: 3, borderColor: colors.brandStrong },
  inlineLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8EDF4',
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
  archiveButton: { backgroundColor: '#FCE5E5' },
  archiveLabel: { ...typography.bodyStrong, color: colors.accentRed },
  cancelButton: { backgroundColor: '#E8EDF4' },
  cancelLabel: { ...typography.bodyStrong, color: colors.textPrimary },
  saveButton: { backgroundColor: colors.brand },
  saveLabel: { ...typography.bodyStrong, color: colors.surface },
});
