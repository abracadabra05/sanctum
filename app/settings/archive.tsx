import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

type ArchiveRow =
  | {
      id: string;
      kind: 'task';
      title: string;
      subtitle: string;
      archivedAt: string;
    }
  | {
      id: string;
      kind: 'habit';
      title: string;
      subtitle: string;
      archivedAt: string;
    };

export default function ArchiveCenterScreen() {
  const theme = useTheme();
  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);
  const restoreTask = useAppStore((state) => state.restoreTask);
  const restoreHabit = useAppStore((state) => state.restoreHabit);

  const items = useMemo<ArchiveRow[]>(
    () =>
      [
        ...tasks
          .filter((task) => task.archived && task.archivedAt)
          .map((task) => ({
            id: task.id,
            kind: 'task' as const,
            title: task.title,
            subtitle: 'Task archive',
            archivedAt: task.archivedAt!,
          })),
        ...habits
          .filter((habit) => habit.archived && habit.archivedAt)
          .map((habit) => ({
            id: habit.id,
            kind: 'habit' as const,
            title: habit.name,
            subtitle: 'Habit archive',
            archivedAt: habit.archivedAt!,
          })),
      ].sort(
        (left, right) =>
          new Date(right.archivedAt).getTime() -
          new Date(left.archivedAt).getTime(),
      ),
    [habits, tasks],
  );

  return (
    <ScreenShell>
      <View
        style={[
          styles.card,
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
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Archive center
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Restore archived tasks and habits without losing their local history.
        </Text>

        {items.length ? (
          items.map((item) => (
            <View
              key={`${item.kind}-${item.id}`}
              style={[styles.row, { borderBottomColor: theme.colors.divider }]}
            >
              <View style={styles.rowBody}>
                <Text
                  style={[styles.rowTitle, { color: theme.colors.textPrimary }]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.rowMeta,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.subtitle} • {new Date(item.archivedAt).toLocaleString()}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  if (item.kind === 'task') {
                    restoreTask(item.id);
                    return;
                  }

                  restoreHabit(item.id);
                }}
                style={({ pressed }) => [
                  styles.restoreButton,
                  { backgroundColor: theme.colors.surfaceActive },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.restoreLabel, { color: theme.colors.brand }]}
                >
                  Restore
                </Text>
              </Pressable>
            </View>
          ))
        ) : (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: theme.colors.surfaceMuted },
            ]}
          >
            <Text
              style={[styles.rowTitle, { color: theme.colors.textPrimary }]}
            >
              Archive is empty
            </Text>
            <Text
              style={[styles.rowMeta, { color: theme.colors.textSecondary }]}
            >
              Archived tasks and habits will appear here.
            </Text>
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
    gap: spacing.md,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  title: { ...typography.h1 },
  body: { ...typography.body },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTitle: { ...typography.bodyStrong },
  rowMeta: { ...typography.caption },
  restoreButton: {
    minWidth: 92,
    minHeight: 42,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  restoreLabel: { ...typography.bodyStrong, fontSize: 15 },
  emptyState: {
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
