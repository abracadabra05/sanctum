import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import { getHabitCards, getHabitDetail } from '@/features/habits/selectors';
import { toDateKey } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { HabitItem } from '@/shared/types/app';
import { CreateHabitSheet } from '@/shared/ui/create-habit-sheet';
import { EmptyState } from '@/shared/ui/empty-state';
import { HabitCard } from '@/shared/ui/habit-card';
import { HabitDetailSheet } from '@/shared/ui/habit-detail-sheet';
import type { RadialFabItem } from '@/shared/ui/radial-fab';
import { RadialFab } from '@/shared/ui/radial-fab';
import { ScreenShell } from '@/shared/ui/screen-shell';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HabitsScreen() {
  const theme = useTheme();
  const habits = useAppStore((state) => state.habits);
  const preferences = useAppStore((state) => state.preferences);
  const markHabitComplete = useAppStore((state) => state.markHabitComplete);
  const restoreHabit = useAppStore((state) => state.restoreHabit);
  const [showArchived, setShowArchived] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [detailHabitId, showArchived, sheetOpen]);

  const openCreate = useCallback(() => {
    setEditingHabit(null);
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback(
    (habitId: string) => {
      const item = habits.find((entry) => entry.id === habitId);
      if (!item) {
        return;
      }

      setEditingHabit(item);
      setSheetOpen(true);
    },
    [habits],
  );

  useFocusEffect(
    useCallback(() => {
      const quickAction = useUiStore.getState().consumeQuickAction();
      if (quickAction === 'open-create-habit') {
        openCreate();
      }
    }, [openCreate]),
  );

  const visibleHabits = useMemo(
    () =>
      habits
        .filter((habit) => habit.archived === showArchived)
        .sort((left, right) => {
          if (!showArchived) {
            return left.name.localeCompare(right.name);
          }

          const leftTime = left.archivedAt
            ? new Date(left.archivedAt).getTime()
            : 0;
          const rightTime = right.archivedAt
            ? new Date(right.archivedAt).getTime()
            : 0;
          return rightTime - leftTime;
        }),
    [habits, showArchived],
  );

  const cards = useMemo(
    () => getHabitCards(visibleHabits, preferences.timeFormat),
    [preferences.timeFormat, visibleHabits],
  );

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === detailHabitId) ?? null,
    [detailHabitId, habits],
  );

  const detail = useMemo(
    () =>
      selectedHabit
        ? getHabitDetail(selectedHabit, preferences.timeFormat)
        : null,
    [preferences.timeFormat, selectedHabit],
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
            <Pressable onPress={openCreate} style={styles.headerAction}>
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
              backgroundColor: theme.colors.surfaceFloating,
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
            Keep rituals steady
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            Open a habit for details, then mark today complete in one step.
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
                        ? theme.colors.textOnTint
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
              <View key={habit.id} style={styles.cardWrap}>
                <HabitCard
                  habit={habit}
                  onLongPress={() => openEdit(habit.id)}
                  onPress={() =>
                    showArchived
                      ? restoreHabit(habit.id)
                      : setDetailHabitId(habit.id)
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
        onPress={openCreate}
        items={
          [
            {
              id: 'create-habit',
              label: 'Add habit',
              icon: { name: 'leaf-outline', type: 'ionicon' },
              onPress: openCreate,
            },
          ] as RadialFabItem[]
        }
      />

      <CreateHabitSheet
        visible={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingHabit(null);
        }}
        initialHabit={editingHabit}
      />

      <HabitDetailSheet
        visible={Boolean(detailHabitId)}
        habit={detail}
        onClose={() => setDetailHabitId(null)}
        onEdit={() => {
          if (!detailHabitId) {
            return;
          }

          openEdit(detailHabitId);
          setDetailHabitId(null);
        }}
        onToggleToday={() => {
          if (!detailHabitId) {
            return;
          }

          markHabitComplete(detailHabitId, toDateKey(new Date()));
        }}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  eyebrow: { ...typography.eyebrow },
  title: { ...typography.h1 },
  body: { ...typography.caption, fontSize: 14, lineHeight: 20 },
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
  cardWrap: {
    width: '47%',
  },
});
