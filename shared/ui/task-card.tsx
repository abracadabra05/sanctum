import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { TaskListItemViewModel } from '@/shared/types/app';

interface TaskCardProps {
  item: TaskListItemViewModel;
  onToggle: (taskId: string, occurrenceDate: string) => void;
  onEdit?: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
}

const getContrastText = (hex: string) => {
  const sanitized = hex.replace('#', '');
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((char) => char + char)
          .join('')
      : sanitized;

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.65 ? '#111827' : '#FFFFFF';
};

export function TaskCard({ item, onToggle, onEdit, onArchive }: TaskCardProps) {
  const theme = useTheme();
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const done = item.occurrence.isCompleted;
  const translateX = useRef(new Animated.Value(0)).current;
  const categoryTextColor = useMemo(
    () => getContrastText(item.category.color),
    [item.category.color],
  );
  const priorityTextColor = theme.colors[
    `priority${item.task.priority.charAt(0).toUpperCase() + item.task.priority.slice(1)}` as keyof typeof theme.colors
  ] as string;

  const resetPosition = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  }, [translateX]);

  const archiveTask = useCallback(() => {
    Animated.timing(translateX, {
      toValue: -420,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0);
      onArchive?.(item.task.id);
    });
  }, [item.task.id, onArchive, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          gestureState.dx < -10,
        onPanResponderGrant: () => {
          setGestureBlock('task-swipe', true);
        },
        onPanResponderMove: (_, gestureState) => {
          translateX.setValue(Math.max(gestureState.dx, -140));
        },
        onPanResponderRelease: (_, gestureState) => {
          setGestureBlock('task-swipe', false);
          if (gestureState.dx < -96 && onArchive) {
            archiveTask();
            return;
          }
          resetPosition();
        },
        onPanResponderTerminate: () => {
          setGestureBlock('task-swipe', false);
          resetPosition();
        },
      }),
    [archiveTask, onArchive, resetPosition, setGestureBlock, translateX],
  );

  return (
    <View style={styles.swipeWrap}>
      <View
        style={[
          styles.archiveAction,
          { backgroundColor: theme.colors.accentRed },
        ]}
      >
        <Ionicons
          color={theme.colors.surface}
          name="archive-outline"
          size={20}
        />
        <Text
          style={[styles.archiveActionLabel, { color: theme.colors.surface }]}
        >
          Archive
        </Text>
      </View>
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...(onArchive ? panResponder.panHandlers : {})}
      >
        <Pressable
          onLongPress={() => onEdit?.(item.task.id)}
          onPress={() => onToggle(item.task.id, item.occurrence.occurrenceDate)}
          style={[
            styles.card,
            {
              backgroundColor: done
                ? theme.colors.surfaceMuted
                : theme.colors.surface,
              shadowColor: theme.shadows.card.shadowColor,
              shadowOffset: theme.shadows.card.shadowOffset,
              shadowOpacity: theme.shadows.card.shadowOpacity,
              shadowRadius: theme.shadows.card.shadowRadius,
              elevation: theme.shadows.card.elevation,
            },
          ]}
        >
          <View style={styles.leading}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: done ? theme.colors.brand : theme.colors.border,
                  backgroundColor: done
                    ? theme.colors.brand
                    : theme.colors.surface,
                },
              ]}
            >
              {done ? (
                <Ionicons
                  color={theme.colors.surface}
                  name="checkmark"
                  size={18}
                />
              ) : null}
            </View>
          </View>
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                {
                  color: done
                    ? theme.colors.textSecondary
                    : theme.colors.textPrimary,
                  textDecorationLine: done ? 'line-through' : 'none',
                },
              ]}
            >
              {item.task.title}
            </Text>
            {item.task.notes ? (
              <Text
                style={[styles.notes, { color: theme.colors.textSecondary }]}
              >
                {item.task.notes}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <Text
                style={[
                  styles.badge,
                  {
                    backgroundColor: item.category.color,
                    color: categoryTextColor,
                  },
                ]}
              >
                {item.category.label.toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.time,
                  {
                    color: done
                      ? theme.colors.textMuted
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {done ? 'Done' : item.occurrence.displayTime}
              </Text>
              <Text style={[styles.priority, { color: priorityTextColor }]}>
                {item.task.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.card,
  },
  archiveAction: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.card,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  archiveActionLabel: {
    ...typography.bodyStrong,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  leading: {
    justifyContent: 'center',
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyStrong,
  },
  notes: {
    ...typography.caption,
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
    fontWeight: '700',
  },
  time: {
    ...typography.body,
  },
  priority: {
    fontSize: 12,
    fontWeight: '700',
  },
});
