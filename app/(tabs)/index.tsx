import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getHabitCards } from '@/features/habits/selectors';
import { getHydrationProgress } from '@/features/hydration/selectors';
import { getOutstandingTasksForDate } from '@/features/tasks/selectors';
import { getTaskCategoryLabel, translate, useI18n } from '@/shared/i18n';
import {
  extractLocalTime,
  formatTimeLabel,
  toDateKey,
} from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
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
  const { language, locale, t } = useI18n();
  const hydrationToday = useAppStore((state) => state.hydrationToday);
  const preferences = useAppStore((state) => state.preferences);
  const tasks = useAppStore((state) => state.tasks);
  const taskCompletions = useAppStore((state) => state.taskCompletions);
  const categories = useAppStore((state) => state.taskCategories);
  const habits = useAppStore((state) => state.habits);
  const addWater = useAppStore((state) => state.addWater);
  const completeTaskOccurrence = useAppStore(
    (state) => state.completeTaskOccurrence,
  );
  const markHabitComplete = useAppStore((state) => state.markHabitComplete);
  const queueQuickAction = useUiStore((state) => state.queueQuickAction);
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const [customWater, setCustomWater] = useState(
    String(preferences.quickWaterAmounts[0] ?? 180),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createHabitOpen, setCreateHabitOpen] = useState(false);

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
      getOutstandingTasksForDate(tasks, taskCompletions, todayKey)
        .sort((left, right) => left.dueAt.localeCompare(right.dueAt))
        .map((task) => ({
          task,
          category: (() => {
            const source = categories.find(
              (item) => item.id === task.categoryId,
            ) ??
              categories[0] ?? {
                id: 'uncategorized',
                label: translate(language, 'task.category.uncategorized'),
                color: '#E8EDF4',
                kind: 'preset' as const,
                archived: false,
                archivedAt: null,
              };

            return {
              ...source,
              label: getTaskCategoryLabel(source, language),
            };
          })(),
          occurrence: {
            occurrenceDate: todayKey,
            displayTime: formatTimeLabel(
              extractLocalTime(task.dueAt),
              preferences.timeFormat,
              locale,
            ),
            isCompleted: false,
          },
        }))
        .slice(0, 3),
    [
      categories,
      language,
      locale,
      preferences.timeFormat,
      taskCompletions,
      tasks,
      todayKey,
    ],
  );

  const habitCards = useMemo(
    () =>
      getHabitCards(
        habits.filter((item) => !item.archived),
        preferences.timeFormat,
        language,
      ),
    [habits, language, preferences.timeFormat],
  );

  return (
    <>
      <ScreenShell
        header={<DashboardHeader onOpenMenu={() => setMenuOpen(true)} />}
      >
        <View>
          <SectionHeading
            actionLabel={`${(hydrationProgress.consumedMl / 1000).toFixed(1)}L / ${(preferences.dailyWaterTargetMl / 1000).toFixed(1)}L`}
            onActionPress={() => router.navigate('/settings/water')}
            eyebrow={t('dashboard.hydration.eyebrow')}
            title={t('dashboard.hydration.title')}
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
          <View style={styles.waterTopRow}>
            <ProgressRing
              centerCaption={
                hydrationProgress.isGoalReached
                  ? t('dashboard.progress.goalReached')
                  : undefined
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
            <Pressable
              onPress={() => router.navigate('/settings/water')}
              style={[
                styles.waterControl,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <View
                style={[
                  styles.waterControlIcon,
                  { backgroundColor: theme.colors.brandSoft },
                ]}
              >
                <Ionicons
                  color={theme.colors.brand}
                  name="water-outline"
                  size={18}
                />
              </View>
              <Text
                style={[
                  styles.waterControlLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t('dashboard.waterControl')}
              </Text>
              <Ionicons
                color={theme.colors.iconNeutral}
                name="settings-outline"
                size={18}
              />
            </Pressable>
          </View>

          <Text
            style={[styles.waterSummary, { color: theme.colors.textSecondary }]}
          >
            {hydrationProgress.hasExceededGoal
              ? t('dashboard.summary.aboveGoal', {
                  amount: hydrationProgress.overflowMl,
                })
              : t('dashboard.summary.leftToday', {
                  amount: Math.max(
                    0,
                    preferences.dailyWaterTargetMl -
                      hydrationProgress.consumedMl,
                  ),
                })}
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
              {t('dashboard.customAmount')}
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
                  {t('dashboard.add')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View>
          <SectionHeading
            eyebrow={t('dashboard.tasks.eyebrow')}
            title={t('dashboard.tasks.title')}
            actionLabel={t('dashboard.tasks.action')}
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
              title={t('dashboard.tasks.emptyTitle')}
              description={t('dashboard.tasks.emptyBody')}
            />
          )}
        </View>

        <View>
          <SectionHeading
            eyebrow={t('dashboard.habits.eyebrow')}
            title={t('dashboard.habits.title')}
          />
        </View>
        <View>
          <ScrollView
            horizontal
            onTouchCancel={() =>
              setGestureBlock('dashboard-habits-scroll', false)
            }
            onTouchEnd={() => setGestureBlock('dashboard-habits-scroll', false)}
            onTouchStart={() =>
              setGestureBlock('dashboard-habits-scroll', true)
            }
            showsHorizontalScrollIndicator={false}
          >
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
                  title={t('dashboard.habits.emptyTitle')}
                  description={t('dashboard.habits.emptyBody')}
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
              id: 'create-task',
              label: t('dashboard.fab.addTask'),
              icon: { name: 'add-circle-outline', type: 'ionicon' },
              onPress: () => setCreateTaskOpen(true),
            },
            {
              id: 'create-habit',
              label: t('dashboard.fab.addHabit'),
              icon: { name: 'leaf-outline', type: 'ionicon' },
              onPress: () => setCreateHabitOpen(true),
            },
            {
              id: 'search-tasks',
              label: t('dashboard.fab.searchTasks'),
              icon: { name: 'search-outline', type: 'ionicon' },
              onPress: () => {
                queueQuickAction('open-task-search');
                router.navigate('/tasks');
              },
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
        onSearchTasks={() => {
          queueQuickAction('open-task-search');
          router.navigate('/tasks');
        }}
        onCreateTask={() => setCreateTaskOpen(true)}
        onCreateHabit={() => setCreateHabitOpen(true)}
        onOpenData={() => router.navigate('/settings/data')}
        onOpenProfile={() => router.navigate('/profile')}
      />
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
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.card,
  },
  waterTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  waterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  waterControlIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterControlLabel: { ...typography.bodyStrong, fontSize: 15 },
  waterSummary: {
    ...typography.body,
    textAlign: 'left',
  },
  buttonRow: { width: '100%', flexDirection: 'row', gap: spacing.md },
  cta: {
    flex: 1,
    minHeight: 52,
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
  stack: { gap: spacing.md },
  habitRow: { flexDirection: 'row', gap: spacing.md },
});
