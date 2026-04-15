import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { AppMenu } from '@/shared/ui/app-menu';
import { CreateHabitSheet } from '@/shared/ui/create-habit-sheet';
import { CreateTaskSheet } from '@/shared/ui/create-task-sheet';
import { EmptyState } from '@/shared/ui/empty-state';
import { HabitCard } from '@/shared/ui/habit-card';
import { ProgressRing } from '@/shared/ui/progress-ring';
import type { RadialFabItem } from '@/shared/ui/radial-fab';
import { RadialFab } from '@/shared/ui/radial-fab';
import { ScreenShell } from '@/shared/ui/screen-shell';
import { SectionHeading } from '@/shared/ui/section-heading';
import { TaskCard } from '@/shared/ui/task-card';

function DashboardHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View
          style={[
            styles.avatarWrap,
            {
              backgroundColor: theme.colors.brandSoft,
              borderColor: theme.colors.brand,
            },
          ]}
        >
          <View
            style={[
              styles.avatarInner,
              { backgroundColor: theme.colors.surfaceElevated },
            ]}
          >
            <Ionicons
              color={theme.colors.brand}
              name="water-outline"
              size={18}
            />
          </View>
        </View>
        <Text style={[styles.brand, { color: theme.colors.brandStrong }]}>
          Sanctum
        </Text>
      </View>
      <Pressable onPress={onOpenMenu} style={styles.menuButton}>
        <Ionicons color={theme.colors.iconNeutral} name="menu" size={28} />
      </Pressable>
    </View>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createHabitOpen, setCreateHabitOpen] = useState(false);
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
      <ScreenShell
        header={<DashboardHeader onOpenMenu={() => setMenuOpen(true)} />}
      >
        <View>
          <SectionHeading
            actionLabel={`${(hydrationProgress.consumedMl / 1000).toFixed(1)}L / ${(preferences.dailyWaterTargetMl / 1000).toFixed(1)}L`}
            onActionPress={() => setSettingsOpen(true)}
            eyebrow="Hydration"
            title="Stay Fluid"
          />
        </View>

        <View
          style={[
            styles.heroCard,
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
          <Text
            style={[styles.waterSummary, { color: theme.colors.textSecondary }]}
          >
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
                  index === 0
                    ? {
                        backgroundColor: theme.colors.brand,
                        shadowColor: theme.shadows.button.shadowColor,
                        shadowOffset: theme.shadows.button.shadowOffset,
                        shadowOpacity: theme.shadows.button.shadowOpacity,
                        shadowRadius: theme.shadows.button.shadowRadius,
                        elevation: theme.shadows.button.elevation,
                      }
                    : { backgroundColor: theme.colors.surfaceMuted },
                ]}
              >
                <Text
                  style={[
                    styles.ctaLabel,
                    {
                      color:
                        index === 0 ? theme.colors.surface : theme.colors.brand,
                    },
                  ]}
                >
                  +{amount}ml
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.customRow}>
            <Text
              style={[styles.customHint, { color: theme.colors.textSecondary }]}
            >
              Custom amount
            </Text>
            <View style={styles.customActions}>
              <TextInput
                keyboardType="number-pad"
                onChangeText={setCustomWater}
                scrollEnabled={false}
                style={[
                  styles.customInput,
                  {
                    backgroundColor: theme.colors.input,
                    color: theme.colors.textPrimary,
                  },
                ]}
                value={customWater}
              />
              <Pressable
                onPress={() => addWater(Number(customWater) || 0, 'custom')}
                style={[
                  styles.addSmallButton,
                  { backgroundColor: theme.colors.brandSoft },
                ]}
              >
                <Text
                  style={[styles.addSmallLabel, { color: theme.colors.brand }]}
                >
                  Add
                </Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={styles.secondaryLink}
          >
            <Text
              style={[styles.secondaryLinkLabel, { color: theme.colors.brand }]}
            >
              Hydration settings
            </Text>
          </Pressable>
          <View style={styles.entryList}>
            {hydrationToday.entries.slice(0, 4).map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.entryRow,
                  { borderBottomColor: theme.colors.divider },
                ]}
              >
                <Text
                  style={[
                    styles.entryAmount,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  +{entry.amountMl} ml
                </Text>
                <Text
                  style={[
                    styles.entryMeta,
                    { color: theme.colors.textSecondary },
                  ]}
                >
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

        <View>
          <SectionHeading
            eyebrow="Productivity"
            title="Daily To-Do"
            actionLabel="Today"
          />
        </View>
        <View style={styles.stack}>
          {todayTasks.length > 0 ? (
            todayTasks.map((item) => (
              <TaskCard
                key={`${item.task.id}-${item.occurrence.occurrenceDate}`}
                item={item}
                onToggle={completeTaskOccurrence}
              />
            ))
          ) : (
            <EmptyState
              icon="tasks"
              title="No tasks for today"
              description="Tap the + button on the Tasks screen to add your first task."
            />
          )}
        </View>

        <View>
          <SectionHeading eyebrow="Consistency" title="Habit Streaks" />
        </View>
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.habitRow}>
              {habitCards.length > 0 ? (
                habitCards.map((habit) => (
                  <HabitCard
                    habit={habit}
                    key={habit.id}
                    onPress={() => markHabitComplete(habit.id, todayKey)}
                  />
                ))
              ) : (
                <EmptyState
                  icon="habits"
                  title="No habits yet"
                  description="Create your first habit to start building streaks."
                />
              )}
            </View>
          </ScrollView>
        </View>
      </ScreenShell>

      <RadialFab
        onPress={() => setCreateTaskOpen(true)}
        items={
          [
            {
              id: 'search-tasks',
              label: 'Search tasks',
              icon: { name: 'search-outline', type: 'ionicon' },
              onPress: () => router.push('/(tabs)/tasks?search=1'),
            },
            {
              id: 'create-task',
              label: 'Add task',
              icon: { name: 'add-circle-outline', type: 'ionicon' },
              onPress: () => setCreateTaskOpen(true),
            },
            {
              id: 'create-habit',
              label: 'Add habit',
              icon: { name: 'leaf-outline', type: 'ionicon' },
              onPress: () => setCreateHabitOpen(true),
            },
          ] as RadialFabItem[]
        }
      />

      <CreateTaskSheet
        visible={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
      />
      <CreateHabitSheet
        visible={createHabitOpen}
        onClose={() => setCreateHabitOpen(false)}
      />

      <AppMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSearchTasks={() => router.push('/(tabs)/tasks?search=1')}
        onCreateTask={() => router.push('/(tabs)/tasks?compose=1')}
        onCreateHabit={() => router.push('/(tabs)/habits?compose=1')}
        onOpenData={() => router.push('/settings/data')}
        onOpenProfile={() => router.push('/(tabs)/profile')}
      />

      <Modal animationType="slide" transparent visible={settingsOpen}>
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: theme.colors.overlay },
          ]}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: theme.colors.surfaceElevated },
            ]}
          >
            <Text
              style={[styles.sheetTitle, { color: theme.colors.textPrimary }]}
            >
              Hydration preferences
            </Text>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Daily target (ml)
            </Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setTargetDraft}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={targetDraft}
            />
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Quick amounts (comma separated)
            </Text>
            <TextInput
              onChangeText={setQuickDraft}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={quickDraft}
            />
            <View style={styles.sheetActions}>
              <Pressable
                onPress={() => setSettingsOpen(false)}
                style={[
                  styles.cta,
                  { backgroundColor: theme.colors.surfaceMuted },
                ]}
              >
                <Text
                  style={[styles.ctaLabel, { color: theme.colors.textPrimary }]}
                >
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
                style={[styles.cta, { backgroundColor: theme.colors.brand }]}
              >
                <Text
                  style={[styles.ctaLabel, { color: theme.colors.surface }]}
                >
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 26, fontWeight: '700' },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.card,
  },
  waterSummary: {
    ...typography.body,
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
  ctaLabel: { ...typography.bodyStrong },
  customRow: { width: '100%', gap: spacing.sm },
  customHint: {
    ...typography.caption,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: 'center',
    ...typography.bodyStrong,
  },
  addSmallButton: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addSmallLabel: { ...typography.bodyStrong },
  secondaryLink: { alignSelf: 'flex-start' },
  secondaryLinkLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  entryList: { width: '100%', gap: spacing.xs },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  entryAmount: { ...typography.bodyStrong },
  entryMeta: { ...typography.caption },
  stack: { gap: spacing.md },
  habitRow: { flexDirection: 'row', gap: spacing.md },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  sheetTitle: { ...typography.h2 },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
  },
  sheetActions: { flexDirection: 'row', gap: spacing.md },
});
