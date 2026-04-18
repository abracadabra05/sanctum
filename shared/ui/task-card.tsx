import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  State as GestureState,
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { TaskListItemViewModel } from '@/shared/types/app';

interface TaskCardProps {
  item: TaskListItemViewModel;
  onToggle: (taskId: string, occurrenceDate: string) => void;
  onEdit?: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
  onSecondaryAction?: (taskId: string) => void;
  secondaryActionLabel?: string;
}

const MAX_SWIPE = 140;
const ARCHIVE_THRESHOLD = 96;

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

export function TaskCard({
  item,
  onToggle,
  onEdit,
  onArchive,
  onSecondaryAction,
  secondaryActionLabel,
}: TaskCardProps) {
  const theme = useTheme();
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const done = item.occurrence.isCompleted;
  const cardSurfaceColor = done
    ? theme.colors.surfaceMuted
    : theme.colors.surface;
  const translateX = useRef(new Animated.Value(0)).current;
  const categoryTextColor = useMemo(
    () => getContrastText(item.category.color),
    [item.category.color],
  );
  const priorityTextColor = theme.colors[
    `priority${item.task.priority.charAt(0).toUpperCase() + item.task.priority.slice(1)}` as keyof typeof theme.colors
  ] as string;

  const clearGestureBlocks = useCallback(() => {
    setGestureBlock('task-card-swipe-intent', false);
    setGestureBlock('task-swipe', false);
  }, [setGestureBlock]);

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

  const handleGestureEvent = ({
    nativeEvent,
  }: PanGestureHandlerGestureEvent) => {
    translateX.setValue(
      Math.max(-MAX_SWIPE, Math.min(0, nativeEvent.translationX)),
    );
  };

  const handleStateChange = ({
    nativeEvent,
  }: PanGestureHandlerStateChangeEvent) => {
    if (nativeEvent.state === GestureState.BEGAN) {
      setGestureBlock('task-card-swipe-intent', true);
      return;
    }

    if (nativeEvent.state === GestureState.ACTIVE) {
      setGestureBlock('task-swipe', true);
      return;
    }

    if (nativeEvent.oldState === GestureState.ACTIVE) {
      setGestureBlock('task-swipe', false);
      if (
        nativeEvent.translationX < -ARCHIVE_THRESHOLD ||
        nativeEvent.velocityX < -900
      ) {
        archiveTask();
        setTimeout(() => {
          setGestureBlock('task-card-swipe-intent', false);
        }, 140);
        return;
      }

      resetPosition();
      setTimeout(() => {
        setGestureBlock('task-card-swipe-intent', false);
      }, 140);
      return;
    }

    if (
      nativeEvent.state === GestureState.CANCELLED ||
      nativeEvent.state === GestureState.END ||
      nativeEvent.state === GestureState.FAILED
    ) {
      clearGestureBlocks();
      resetPosition();
    }
  };

  return (
    <View style={[styles.swipeWrap, { backgroundColor: cardSurfaceColor }]}>
      <View style={styles.archiveLayer}>
        <View
          style={[
            styles.archiveAction,
            { backgroundColor: theme.colors.accentRed },
          ]}
        >
          <Ionicons
            color={theme.colors.textOnTint}
            name="archive-outline"
            size={20}
          />
          <Text
            style={[
              styles.archiveActionLabel,
              { color: theme.colors.textOnTint },
            ]}
          >
            Archive
          </Text>
        </View>
      </View>

      <PanGestureHandler
        activeOffsetX={[-14, 14]}
        failOffsetY={[-10, 10]}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
      >
        <Animated.View
          style={[styles.frontLayer, { transform: [{ translateX }] }]}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardSurfaceColor,
                shadowColor: theme.shadows.card.shadowColor,
                shadowOffset: theme.shadows.card.shadowOffset,
                shadowOpacity: theme.shadows.card.shadowOpacity,
                shadowRadius: theme.shadows.card.shadowRadius,
                elevation: theme.shadows.card.elevation,
              },
            ]}
          >
            <View style={styles.cardContent}>
              <Pressable
                onLongPress={() => onEdit?.(item.task.id)}
                onPress={() =>
                  onToggle(item.task.id, item.occurrence.occurrenceDate)
                }
                style={styles.cardPressable}
              >
                <View style={styles.leading}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: done
                          ? theme.colors.brand
                          : theme.colors.border,
                        backgroundColor: done
                          ? theme.colors.brand
                          : theme.colors.surface,
                      },
                    ]}
                  >
                    {done ? (
                      <Ionicons
                        color={theme.colors.textOnTint}
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
                      style={[
                        styles.notes,
                        { color: theme.colors.textSecondary },
                      ]}
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
                    <Text
                      style={[styles.priority, { color: priorityTextColor }]}
                    >
                      {item.task.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Pressable>
              {secondaryActionLabel && onSecondaryAction ? (
                <View style={styles.secondaryRow}>
                  <Pressable
                    onPress={() => onSecondaryAction(item.task.id)}
                    style={[
                      styles.secondaryButton,
                      { backgroundColor: theme.colors.surfaceActive },
                    ]}
                  >
                    <Text
                      style={[
                        styles.secondaryLabel,
                        { color: theme.colors.brand },
                      ]}
                    >
                      {secondaryActionLabel}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.card,
  },
  archiveLayer: {
    ...StyleSheet.absoluteFillObject,
    padding: 2,
  },
  archiveAction: {
    flex: 1,
    borderRadius: radii.card - 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  archiveActionLabel: {
    ...typography.bodyStrong,
  },
  frontLayer: {
    borderRadius: radii.card,
  },
  card: {
    borderRadius: radii.card,
  },
  cardContent: {
    gap: spacing.xs,
  },
  cardPressable: {
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
  secondaryRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  secondaryButton: {
    minHeight: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryLabel: {
    ...typography.caption,
    fontSize: 13,
  },
});
