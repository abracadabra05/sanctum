import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import type { TaskListItemViewModel } from '@/shared/types/app';

interface TaskCardProps {
  item: TaskListItemViewModel;
  onToggle: (taskId: string, occurrenceDate: string) => void;
  onEdit?: (taskId: string) => void;
}

const priorityColor = {
  low: '#7C8CA5',
  medium: '#0F6DCA',
  high: '#C92B2B',
};

export function TaskCard({ item, onToggle, onEdit }: TaskCardProps) {
  const done = item.occurrence.isCompleted;

  return (
    <Pressable
      onLongPress={() => onEdit?.(item.task.id)}
      onPress={() => onToggle(item.task.id, item.occurrence.occurrenceDate)}
      style={[styles.card, done && styles.cardMuted]}
    >
      <View style={styles.leading}>
        <View style={[styles.checkbox, done && styles.checkboxActive]}>
          {done ? (
            <Ionicons color={colors.surface} name="checkmark" size={18} />
          ) : null}
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, done && styles.titleDone]}>
          {item.task.title}
        </Text>
        {item.task.notes ? (
          <Text style={styles.notes}>{item.task.notes}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text
            style={[
              styles.badge,
              {
                backgroundColor: item.category.color,
                color: colors.textPrimary,
              },
            ]}
          >
            {item.category.label.toUpperCase()}
          </Text>
          <Text style={[styles.time, done && styles.timeMuted]}>
            {done ? 'Done' : item.occurrence.displayTime}
          </Text>
          <Text
            style={[
              styles.priority,
              { color: priorityColor[item.task.priority] },
            ]}
          >
            {item.task.priority.toUpperCase()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    ...shadows.card,
  },
  cardMuted: {
    backgroundColor: '#F1F5FA',
  },
  leading: {
    justifyContent: 'center',
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C7D2E4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  titleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  notes: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    overflow: 'hidden',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    ...typography.body,
    color: colors.textSecondary,
  },
  timeMuted: {
    color: colors.textMuted,
  },
  priority: {
    fontSize: 12,
    fontWeight: '700',
  },
});
