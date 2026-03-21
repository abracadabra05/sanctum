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
import { getHydrationProgress } from '@/features/hydration/selectors';
import { getTaskCompletionRecord } from '@/features/tasks/selectors';
import { toDateKey } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { HabitCard } from '@/shared/ui/habit-card';
import { ProgressRing } from '@/shared/ui/progress-ring';
import { ScreenShell } from '@/shared/ui/screen-shell';
import { SectionHeading } from '@/shared/ui/section-heading';
import { TaskCard } from '@/shared/ui/task-card';

function DashboardHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarInner}>
            <Ionicons color={colors.brand} name="water-outline" size={18} />
          </View>
        </View>
        <Text style={styles.brand}>Sanctum</Text>
      </View>
      <Ionicons color={colors.textSecondary} name="settings" size={28} />
    </View>
  );
}

export default function DashboardScreen() {
  const isReady = useAppStore((state) => state.isReady);
  const hydrate = useAppStore((state) => state.hydrate);
  const rolloverDayIfNeeded = useAppStore((state) => state.rolloverDayIfNeeded);
  const hydrationToday = useAppStore((state) => state.hydrationToday);
  const preferences = useAppStore((state) => state.preferences);
  const tasks = useAppStore((state) => state.tasks);
  const taskCompletions = useAppStore((state) => state.taskCompletions);
  const categories = useAppStore((state) => state.taskCategories);
  const habits = useAppStore((state) => state.habits);
  const addWater = useAppStore((state) => state.addWater);
  const setDailyWaterTarget = useAppStore((state) => state.setDailyWaterTarget);
  const setQuickWaterAmounts = useAppStore(
    (state) => state.setQuickWaterAmounts,
  );
  const completeTaskOccurrence = useAppStore(
    (state) => state.completeTaskOccurrence,
  );
  const markHabitComplete = useAppStore((state) => state.markHabitComplete);
  const [customWater, setCustomWater] = useState(
    String(preferences.quickWaterAmounts[0] ?? 180),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [targetDraft, setTargetDraft] = useState(
    String(preferences.dailyWaterTargetMl),
  );
  const [quickDraft, setQuickDraft] = useState(
    preferences.quickWaterAmounts.join(','),
  );

  useEffect(() => {
    if (!isReady) {
      void hydrate();
    }
  }, [hydrate, isReady]);

  useEffect(() => {
    rolloverDayIfNeeded();
  }, [rolloverDayIfNeeded]);

  const hydrationProgress = useMemo(
    () =>
      getHydrationProgress(
        hydrationToday.consumedMl,
        preferences.dailyWaterTargetMl,
      ),
    [hydrationToday.consumedMl, preferences.dailyWaterTargetMl],
  );

  const todayKey = toDateKey(new Date());
  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.archived)
        .filter((task) => toDateKey(new Date(task.dueAt)) === todayKey)
        .map((task) => ({
          task,
          category:
            categories.find((item) => item.id === task.categoryId) ??
            categories[0],
          occurrence: {
            occurrenceDate: todayKey,
            displayTime: new Date(task.dueAt).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: preferences.timeFormat === '12h',
            }),
            isCompleted: Boolean(
              getTaskCompletionRecord(task.id, todayKey, taskCompletions),
            ),
          },
        }))
        .slice(0, 3),
    [categories, preferences.timeFormat, taskCompletions, tasks, todayKey],
  );

  const habitCards = useMemo(
    () =>
      getHabitCards(
        habits.filter((item) => !item.archived),
        preferences.timeFormat,
      ),
    [habits, preferences.timeFormat],
  );

  return (
    <>
      <ScreenShell header={<DashboardHeader />}>
        <SectionHeading
          actionLabel={`${(hydrationProgress.consumedMl / 1000).toFixed(1)}L / ${(preferences.dailyWaterTargetMl / 1000).toFixed(1)}L`}
          eyebrow="Hydration"
          title="Stay Fluid"
        />

        <View style={styles.heroCard}>
          <ProgressRing
            centerCaption={
              hydrationProgress.isGoalReached ? 'Goal reached' : undefined
            }
            centerLabel={
              hydrationProgress.isGoalReached
                ? undefined
                : `${hydrationProgress.percentage}%`
            }
            percentage={hydrationProgress.percentage}
            successState={hydrationProgress.isGoalReached}
            variant="water"
          />
          <Text style={styles.waterSummary}>
            {hydrationProgress.hasExceededGoal
              ? `+${hydrationProgress.overflowMl} ml above goal`
              : `${Math.max(0, preferences.dailyWaterTargetMl - hydrationProgress.consumedMl)} ml left today`}
          </Text>
          <View style={styles.buttonRow}>
            {preferences.quickWaterAmounts.slice(0, 2).map((amount, index) => (
              <Pressable
                key={amount}
                onPress={() => addWater(amount, 'quick')}
                style={[
                  styles.cta,
                  index === 0 ? styles.ctaPrimary : styles.ctaSecondary,
                ]}
              >
                <Text
                  style={[
                    styles.ctaLabel,
                    index === 0
                      ? styles.ctaLabelPrimary
                      : styles.ctaLabelSecondary,
                  ]}
                >
                  +{amount}ml
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.customRow}>
            <Text style={styles.customHint}>Custom amount</Text>
            <View style={styles.customActions}>
              <TextInput
                keyboardType="number-pad"
                onChangeText={setCustomWater}
                style={styles.customInput}
                value={customWater}
              />
              <Pressable
                onPress={() => addWater(Number(customWater) || 0, 'custom')}
                style={styles.addSmallButton}
              >
                <Text style={styles.addSmallLabel}>Add</Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={styles.secondaryLink}
          >
            <Text style={styles.secondaryLinkLabel}>Hydration settings</Text>
          </Pressable>
          <View style={styles.entryList}>
            {hydrationToday.entries.slice(0, 4).map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <Text style={styles.entryAmount}>+{entry.amountMl} ml</Text>
                <Text style={styles.entryMeta}>
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: preferences.timeFormat === '12h',
                  })}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <SectionHeading
          actionLabel="Today"
          eyebrow="Productivity"
          title="Daily To-Do"
        />
        <View style={styles.stack}>
          {todayTasks.map((item) => (
            <TaskCard
              key={`${item.task.id}-${item.occurrence.occurrenceDate}`}
              item={item}
              onToggle={completeTaskOccurrence}
            />
          ))}
        </View>

        <SectionHeading eyebrow="Consistency" title="Habit Streaks" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.habitRow}>
            {habitCards.map((habit) => (
              <HabitCard
                habit={habit}
                key={habit.id}
                onPress={() => markHabitComplete(habit.id, todayKey)}
              />
            ))}
          </View>
        </ScrollView>
      </ScreenShell>

      <Modal animationType="slide" transparent visible={settingsOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Hydration preferences</Text>
            <Text style={styles.label}>Daily target (ml)</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setTargetDraft}
              style={styles.input}
              value={targetDraft}
            />
            <Text style={styles.label}>Quick amounts (comma separated)</Text>
            <TextInput
              onChangeText={setQuickDraft}
              style={styles.input}
              value={quickDraft}
            />
            <View style={styles.sheetActions}>
              <Pressable
                onPress={() => setSettingsOpen(false)}
                style={[styles.cta, styles.ctaSecondary]}
              >
                <Text style={[styles.ctaLabel, styles.ctaLabelSecondary]}>
                  Close
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const parsedTarget =
                    Number(targetDraft) || preferences.dailyWaterTargetMl;
                  const quickAmounts = quickDraft
                    .split(',')
                    .map((item) => Number(item.trim()))
                    .filter((item) => !Number.isNaN(item) && item > 0);
                  setDailyWaterTarget(parsedTarget);
                  if (quickAmounts.length > 0) {
                    setQuickWaterAmounts(quickAmounts);
                  }
                  setSettingsOpen(false);
                }}
                style={[styles.cta, styles.ctaPrimary]}
              >
                <Text style={[styles.ctaLabel, styles.ctaLabelPrimary]}>
                  Save
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFD1AA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#98C3F5',
  },
  avatarInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 26, fontWeight: '700', color: '#245BDB' },
  heroCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...shadows.card,
  },
  waterSummary: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonRow: { width: '100%', flexDirection: 'row', gap: spacing.md },
  cta: {
    flex: 1,
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimary: { backgroundColor: colors.brand, ...shadows.button },
  ctaSecondary: { backgroundColor: '#E8EDF4' },
  ctaLabel: { ...typography.bodyStrong },
  ctaLabelPrimary: { color: colors.surface },
  ctaLabelSecondary: { color: colors.brand },
  customRow: { width: '100%', gap: spacing.sm },
  customHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  customActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: 'center',
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  addSmallButton: {
    borderRadius: 16,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addSmallLabel: { ...typography.bodyStrong, color: colors.brand },
  secondaryLink: { alignSelf: 'flex-start' },
  secondaryLinkLabel: {
    ...typography.caption,
    color: colors.brand,
    textTransform: 'uppercase',
  },
  entryList: { width: '100%', gap: spacing.xs },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  entryAmount: { ...typography.bodyStrong, color: colors.textPrimary },
  entryMeta: { ...typography.caption, color: colors.textSecondary },
  stack: { gap: spacing.md },
  habitRow: { flexDirection: 'row', gap: spacing.md },
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
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  sheetActions: { flexDirection: 'row', gap: spacing.md },
});
