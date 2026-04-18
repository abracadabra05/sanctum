import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/shared/i18n';
import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';

export function ArchiveSnackbar() {
  const theme = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const lastArchivedItem = useUiStore((state) => state.lastArchivedItem);
  const clearLastArchivedItem = useUiStore(
    (state) => state.clearLastArchivedItem,
  );
  const restoreTask = useAppStore((state) => state.restoreTask);
  const restoreHabit = useAppStore((state) => state.restoreHabit);
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lastArchivedItem) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 120,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timeoutId = setTimeout(() => {
      clearLastArchivedItem();
    }, 4200);

    return () => clearTimeout(timeoutId);
  }, [clearLastArchivedItem, lastArchivedItem, opacity, translateY]);

  if (!lastArchivedItem) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom + 106,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.container,
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
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {lastArchivedItem.kind === 'task'
              ? t('snackbar.taskArchived')
              : t('snackbar.habitArchived')}
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            {lastArchivedItem.title}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            if (lastArchivedItem.kind === 'task') {
              restoreTask(lastArchivedItem.id);
            } else {
              restoreHabit(lastArchivedItem.id);
            }
            clearLastArchivedItem();
          }}
          style={({ pressed }) => [
            styles.undoButton,
            { backgroundColor: theme.colors.surfaceActive },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.undoLabel, { color: theme.colors.brand }]}>
            {t('common.undo')}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 120,
  },
  container: {
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: { ...typography.bodyStrong, fontSize: 15 },
  body: { ...typography.caption, fontSize: 14 },
  undoButton: {
    minWidth: 78,
    minHeight: 42,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  undoLabel: { ...typography.bodyStrong, fontSize: 15 },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
