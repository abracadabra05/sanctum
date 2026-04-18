import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { HydrationHistoryListItemViewModel } from '@/shared/types/app';

interface HydrationHistoryListProps {
  items: HydrationHistoryListItemViewModel[];
  onPressMore?: () => void;
  compact?: boolean;
}

export function HydrationHistoryList({
  items,
  onPressMore,
  compact = false,
}: HydrationHistoryListProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Hydration history
        </Text>
        {onPressMore ? (
          <Pressable onPress={onPressMore}>
            <Text style={[styles.link, { color: theme.colors.brand }]}>
              Open
            </Text>
          </Pressable>
        ) : null}
      </View>

      {items.length ? (
        items.map((item) => (
          <View
            key={item.date}
            style={[
              styles.row,
              compact && styles.compactRow,
              { backgroundColor: theme.colors.surfaceMuted },
            ]}
          >
            <View style={styles.rowBody}>
              <Text
                style={[styles.rowTitle, { color: theme.colors.textPrimary }]}
              >
                {item.label}
              </Text>
              <Text
                style={[styles.rowMeta, { color: theme.colors.textSecondary }]}
              >
                {item.consumedMl} / {item.targetMl} ml
              </Text>
            </View>
            <View style={styles.badges}>
              <Text
                style={[
                  styles.percentage,
                  {
                    color: item.isGoalReached
                      ? theme.colors.brand
                      : theme.colors.textPrimary,
                  },
                ]}
              >
                {item.percentage}%
              </Text>
              {item.isGoalReached ? (
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: theme.colors.brandSoft },
                  ]}
                >
                  <Text
                    style={[styles.statusLabel, { color: theme.colors.brand }]}
                  >
                    Goal
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ))
      ) : (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: theme.colors.surfaceMuted },
          ]}
        >
          <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
            No history yet
          </Text>
          <Text style={[styles.rowMeta, { color: theme.colors.textSecondary }]}>
            Daily totals appear here after the app rolls into a new day.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: { ...typography.h2 },
  link: { ...typography.caption, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  compactRow: {
    paddingVertical: spacing.sm,
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { ...typography.bodyStrong },
  rowMeta: { ...typography.caption, lineHeight: 18 },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  percentage: { ...typography.bodyStrong },
  statusPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusLabel: { ...typography.caption, fontSize: 12 },
  emptyState: {
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
});
