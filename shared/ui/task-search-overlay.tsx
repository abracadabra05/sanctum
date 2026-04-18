import { BlurView } from 'expo-blur';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getTaskPriorityLabel, useI18n } from '@/shared/i18n';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { TaskListItemViewModel } from '@/shared/types/app';

interface TaskSearchOverlayProps {
  visible: boolean;
  query: string;
  results: TaskListItemViewModel[];
  includeArchived: boolean;
  scopeLabel: string;
  onChangeQuery: (value: string) => void;
  onClose: () => void;
  onToggleIncludeArchived: () => void;
  onSelect?: (item: TaskListItemViewModel) => void;
}

export function TaskSearchOverlay({
  visible,
  query,
  results,
  includeArchived,
  scopeLabel,
  onChangeQuery,
  onClose,
  onToggleIncludeArchived,
  onSelect,
}: TaskSearchOverlayProps) {
  const theme = useTheme();
  const { language, t } = useI18n();
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const hasQuery = Boolean(query.trim());

  useEffect(() => {
    setGestureBlock('task-search-overlay', visible);

    if (!visible) {
      opacity.setValue(0);
      translateY.setValue(12);
      scale.setValue(0.98);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, setGestureBlock, translateY, visible]);

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.root}>
        <BlurView
          intensity={theme.mode === 'dark' ? 32 : 42}
          style={StyleSheet.absoluteFill}
          tint={theme.mode}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.overlay, opacity },
          ]}
        />
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[
            styles.contentWrap,
            {
              opacity,
              transform: [{ translateY }, { scale }],
            },
          ]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.searchCard,
              {
                backgroundColor: theme.colors.surfaceFloating,
                borderColor: theme.colors.border,
                shadowColor: theme.shadows.card.shadowColor,
                shadowOffset: theme.shadows.card.shadowOffset,
                shadowOpacity: theme.shadows.card.shadowOpacity,
                shadowRadius: theme.shadows.card.shadowRadius,
                elevation: theme.shadows.card.elevation,
              },
            ]}
          >
            <View style={styles.inputRow}>
              <TextInput
                autoFocus
                onChangeText={onChangeQuery}
                placeholder={t('search.placeholder')}
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={query}
              />
              {query ? (
                <Pressable
                  hitSlop={10}
                  onPress={() => onChangeQuery('')}
                  style={styles.trailingButton}
                >
                  <Text
                    style={[
                      styles.trailingLabel,
                      { color: theme.colors.brand },
                    ]}
                  >
                    {t('search.clear')}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                hitSlop={10}
                onPress={onClose}
                style={styles.trailingButton}
              >
                <Text
                  style={[
                    styles.trailingLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t('search.close')}
                </Text>
              </Pressable>
            </View>
            <View style={styles.scopeRow}>
              <Text
                style={[
                  styles.scopeLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {scopeLabel}
              </Text>
              <Pressable
                onPress={onToggleIncludeArchived}
                style={[
                  styles.scopeToggle,
                  {
                    backgroundColor: includeArchived
                      ? theme.colors.brandSoft
                      : theme.colors.surfaceMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.scopeToggleLabel,
                    {
                      color: includeArchived
                        ? theme.colors.brand
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {includeArchived
                    ? t('search.archivedIncluded')
                    : t('search.includeArchived')}
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.resultsCard,
              {
                backgroundColor: theme.colors.surfaceFloating,
                borderColor: theme.colors.border,
                shadowColor: theme.shadows.card.shadowColor,
                shadowOffset: theme.shadows.card.shadowOffset,
                shadowOpacity: theme.shadows.card.shadowOpacity,
                shadowRadius: theme.shadows.card.shadowRadius,
                elevation: theme.shadows.card.elevation,
              },
            ]}
          >
            <View style={styles.resultsHeader}>
              <Text
                style={[
                  styles.resultsTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t('search.title')}
              </Text>
              <Text
                style={[
                  styles.resultsMeta,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {hasQuery
                  ? t('search.results', { count: results.length })
                  : scopeLabel}
              </Text>
            </View>

            {results.length ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.resultsList}>
                  {results.map((item) => (
                    <Pressable
                      key={`${item.task.id}-${item.occurrence.occurrenceDate}`}
                      onPress={() => onSelect?.(item)}
                      style={({ pressed }) => [
                        styles.resultRow,
                        {
                          backgroundColor: theme.colors.surfaceMuted,
                          borderColor: theme.colors.divider,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.resultBody}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.resultTitle,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          {item.task.title}
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.resultSubtitle,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {item.category.label} • {item.occurrence.displayTime}{' '}
                          • {getTaskPriorityLabel(language, item.task.priority)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View
                style={[
                  styles.emptyState,
                  { backgroundColor: theme.colors.surfaceMuted },
                ]}
              >
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {hasQuery
                    ? t('search.empty.noMatchTitle')
                    : t('search.empty.noFilterTitle')}
                </Text>
                <Text
                  style={[
                    styles.emptyDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {hasQuery
                    ? t('search.empty.noMatchBody')
                    : t('search.empty.noFilterBody')}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  contentWrap: {
    gap: spacing.md,
  },
  searchCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scopeRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  scopeLabel: { ...typography.caption, flex: 1 },
  scopeToggle: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scopeToggleLabel: {
    ...typography.caption,
    fontSize: 13,
  },
  input: {
    flex: 1,
    ...typography.bodyStrong,
  },
  trailingButton: {
    paddingVertical: spacing.xs,
  },
  trailingLabel: {
    ...typography.caption,
    fontSize: 14,
  },
  resultsCard: {
    maxHeight: 320,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  resultsTitle: {
    ...typography.bodyStrong,
  },
  resultsMeta: {
    ...typography.caption,
  },
  resultsList: {
    gap: spacing.sm,
  },
  resultRow: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  resultBody: {
    gap: 4,
  },
  resultTitle: {
    ...typography.bodyStrong,
  },
  resultSubtitle: {
    ...typography.caption,
  },
  emptyState: {
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.bodyStrong,
  },
  emptyDescription: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
