import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getTaskCategoryLabel, useI18n } from '@/shared/i18n';
import { formatDateTimeLabel } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

type ArchiveFilter = 'all' | 'tasks' | 'habits' | 'categories';

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
    }
  | {
      id: string;
      kind: 'category';
      title: string;
      subtitle: string;
      archivedAt: string;
    };

export default function ArchiveCenterScreen() {
  const theme = useTheme();
  const { language, locale, t } = useI18n();
  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);
  const categories = useAppStore((state) => state.taskCategories);
  const timeFormat = useAppStore((state) => state.preferences.timeFormat);
  const restoreTask = useAppStore((state) => state.restoreTask);
  const restoreHabit = useAppStore((state) => state.restoreHabit);
  const restoreTaskCategory = useAppStore((state) => state.restoreTaskCategory);
  const [activeFilter, setActiveFilter] = useState<ArchiveFilter>('all');

  const archiveFilters: { id: ArchiveFilter; label: string }[] = [
    { id: 'all', label: t('settings.archive.filter.all') },
    { id: 'tasks', label: t('settings.archive.filter.tasks') },
    { id: 'habits', label: t('settings.archive.filter.habits') },
    { id: 'categories', label: t('settings.archive.filter.categories') },
  ];

  const items = useMemo<ArchiveRow[]>(
    () =>
      [
        ...tasks
          .filter((task) => task.archived && task.archivedAt)
          .map((task) => ({
            id: task.id,
            kind: 'task' as const,
            title: task.title,
            subtitle: t('settings.archive.subtitle.task'),
            archivedAt: task.archivedAt!,
          })),
        ...habits
          .filter((habit) => habit.archived && habit.archivedAt)
          .map((habit) => ({
            id: habit.id,
            kind: 'habit' as const,
            title: habit.name,
            subtitle: t('settings.archive.subtitle.habit'),
            archivedAt: habit.archivedAt!,
          })),
        ...categories
          .filter((category) => category.archived && category.archivedAt)
          .map((category) => ({
            id: category.id,
            kind: 'category' as const,
            title: getTaskCategoryLabel(category, language),
            subtitle: t('settings.archive.subtitle.category'),
            archivedAt: category.archivedAt!,
          })),
      ].sort(
        (left, right) =>
          new Date(right.archivedAt).getTime() -
          new Date(left.archivedAt).getTime(),
      ),
    [categories, habits, language, t, tasks],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        activeFilter === 'all'
          ? true
          : activeFilter === 'tasks'
            ? item.kind === 'task'
            : activeFilter === 'habits'
              ? item.kind === 'habit'
              : item.kind === 'category',
      ),
    [activeFilter, items],
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
          {t('settings.archive.title')}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {t('settings.archive.body')}
        </Text>

        <View style={styles.filterRow}>
          {archiveFilters.map((filter) => {
            const active = filter.id === activeFilter;
            return (
              <Pressable
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? theme.colors.brand
                      : theme.colors.surfaceMuted,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: active
                        ? theme.colors.textOnTint
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredItems.length ? (
          filteredItems.map((item) => (
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
                  {item.subtitle} •{' '}
                  {formatDateTimeLabel(item.archivedAt, timeFormat, {
                    includeWeekday: true,
                    includeYear: true,
                    locale,
                  })}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  if (item.kind === 'task') {
                    restoreTask(item.id);
                    return;
                  }

                  if (item.kind === 'habit') {
                    restoreHabit(item.id);
                    return;
                  }

                  restoreTaskCategory(item.id);
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
                  {t('common.restore')}
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
              {t('settings.archive.emptyTitle')}
            </Text>
            <Text
              style={[styles.rowMeta, { color: theme.colors.textSecondary }]}
            >
              {t('settings.archive.emptyBody')}
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  filterLabel: { ...typography.caption, fontSize: 14 },
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
