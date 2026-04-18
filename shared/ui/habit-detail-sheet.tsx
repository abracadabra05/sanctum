import { useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useI18n } from '@/shared/i18n';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { HabitDetailViewModel } from '@/shared/types/app';

interface HabitDetailSheetProps {
  visible: boolean;
  habit: HabitDetailViewModel | null;
  onClose: () => void;
  onEdit: () => void;
  onToggleToday: () => void;
}

export function HabitDetailSheet({
  visible,
  habit,
  onClose,
  onEdit,
  onToggleToday,
}: HabitDetailSheetProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);

  useEffect(() => {
    setGestureBlock('habit-detail-sheet', visible);
    return () => setGestureBlock('habit-detail-sheet', false);
  }, [setGestureBlock, visible]);

  if (!habit) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
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
          <View style={[styles.hero, { backgroundColor: habit.accentColor }]}>
            <Text style={styles.heroEyebrow}>{t('habitDetail.eyebrow')}</Text>
            <Text style={styles.heroTitle}>{habit.name}</Text>
            <Text style={styles.heroBody}>
              {habit.progressLabel} • {habit.weeklySummary}
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              {t('habitDetail.schedule')}
            </Text>
            <Text
              style={[
                styles.sectionBody,
                { color: theme.colors.textSecondary },
              ]}
            >
              {habit.scheduleLabel || t('habitDetail.noSchedule')}
            </Text>
            {habit.nextReminder ? (
              <Text
                style={[
                  styles.sectionBody,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t('habit.reminder', { time: habit.nextReminder })}
              </Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              {t('habitDetail.recentHistory')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.historyRow}>
                {habit.recentHistory.map((entry) => (
                  <View
                    key={entry.date}
                    style={[
                      styles.historyChip,
                      {
                        backgroundColor: entry.isCompleted
                          ? theme.colors.surfaceActive
                          : theme.colors.surfaceMuted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyLabel,
                        {
                          color: entry.isCompleted
                            ? theme.colors.brand
                            : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {entry.label}
                    </Text>
                    <Text
                      style={[
                        styles.historyState,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {entry.isCompleted
                        ? t('habit.history.done')
                        : t('habit.history.open')}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={[
                styles.button,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <Text
                style={[
                  styles.buttonLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t('common.close')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onEdit}
              style={[
                styles.button,
                { backgroundColor: theme.colors.brandSoft },
              ]}
            >
              <Text style={[styles.buttonLabel, { color: theme.colors.brand }]}>
                {t('common.edit')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onToggleToday}
              style={[styles.button, { backgroundColor: theme.colors.brand }]}
            >
              <Text
                style={[styles.buttonLabel, { color: theme.colors.textOnTint }]}
              >
                {habit.isCompletedToday
                  ? t('habitDetail.toggleUndo')
                  : t('habitDetail.toggleDone')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  hero: {
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  heroEyebrow: {
    ...typography.caption,
    color: '#111827',
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.h1,
    color: '#111827',
  },
  heroBody: {
    ...typography.body,
    color: '#334155',
  },
  section: { gap: spacing.xs },
  sectionTitle: { ...typography.bodyStrong },
  sectionBody: { ...typography.body, fontSize: 15 },
  historyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  historyChip: {
    width: 124,
    borderRadius: 20,
    padding: spacing.md,
    gap: 4,
  },
  historyLabel: { ...typography.caption },
  historyState: { ...typography.bodyStrong, fontSize: 15 },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  buttonLabel: { ...typography.caption, fontSize: 14 },
});
