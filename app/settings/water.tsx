import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { getHydrationHistoryItems } from '@/features/hydration/selectors';
import { useI18n } from '@/shared/i18n';
import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { HydrationHistoryList } from '@/shared/ui/hydration-history-list';
import { ScreenShell } from '@/shared/ui/screen-shell';

const targetPresets = [1800, 2200, 2500, 3000];
const quickPresets = [150, 250, 350, 500];

const buildQuickDraft = (amounts: number[]) =>
  Array.from({ length: 4 }, (_, index) => String(amounts[index] ?? ''));

export default function WaterSettingsScreen() {
  const theme = useTheme();
  const { language, t } = useI18n();
  const preferences = useAppStore((state) => state.preferences);
  const hydrationToday = useAppStore((state) => state.hydrationToday);
  const hydrationHistory = useAppStore((state) => state.hydrationHistory);
  const setDailyWaterTarget = useAppStore((state) => state.setDailyWaterTarget);
  const setQuickWaterAmounts = useAppStore(
    (state) => state.setQuickWaterAmounts,
  );
  const [target, setTarget] = useState(String(preferences.dailyWaterTargetMl));
  const [quickDraft, setQuickDraft] = useState(() =>
    buildQuickDraft(preferences.quickWaterAmounts),
  );

  const parsedQuickAmounts = useMemo(
    () =>
      quickDraft
        .map((item) => Number(item))
        .filter((item) => !Number.isNaN(item) && item > 0),
    [quickDraft],
  );

  const hydrationHistoryItems = useMemo(
    () =>
      getHydrationHistoryItems(
        hydrationToday,
        hydrationHistory,
        preferences.dailyWaterTargetMl,
        7,
        language,
      ),
    [
      hydrationHistory,
      hydrationToday,
      language,
      preferences.dailyWaterTargetMl,
    ],
  );

  const setQuickValue = (index: number, value: string) => {
    setQuickDraft((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? value.replace(/[^0-9]/g, '') : item,
      ),
    );
  };

  const bumpTarget = (delta: number) => {
    const next = Math.max(
      250,
      (Number(target) || preferences.dailyWaterTargetMl) + delta,
    );
    setTarget(String(next));
  };

  return (
    <ScreenShell>
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
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {t('settings.water.title')}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {t('settings.water.body')}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            {t('settings.water.dailyTarget')}
          </Text>
          <View style={styles.targetRow}>
            <Pressable
              onPress={() => bumpTarget(-100)}
              style={[
                styles.stepButton,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <Text
                style={[styles.stepLabel, { color: theme.colors.textPrimary }]}
              >
                -100
              </Text>
            </Pressable>
            <TextInput
              keyboardType="number-pad"
              onChangeText={(value) => setTarget(value.replace(/[^0-9]/g, ''))}
              style={[
                styles.targetInput,
                {
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={target}
            />
            <Pressable
              onPress={() => bumpTarget(100)}
              style={[
                styles.stepButton,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <Text
                style={[styles.stepLabel, { color: theme.colors.textPrimary }]}
              >
                +100
              </Text>
            </Pressable>
          </View>
          <View style={styles.presetRow}>
            {targetPresets.map((preset) => {
              const active = Number(target) === preset;
              return (
                <Pressable
                  key={preset}
                  onPress={() => setTarget(String(preset))}
                  style={({ pressed }) => [
                    styles.presetChip,
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
                      styles.presetLabel,
                      {
                        color: active
                          ? theme.colors.textOnTint
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {preset} ml
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            {t('settings.water.quickButtons')}
          </Text>
          <View style={styles.quickGrid}>
            {quickDraft.map((value, index) => (
              <View
                key={`quick-${index}`}
                style={[
                  styles.quickSlot,
                  { backgroundColor: theme.colors.surfaceMuted },
                ]}
              >
                <Text
                  style={[
                    styles.quickSlotLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t('settings.water.quickSlot', { index: index + 1 })}
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={(nextValue) => setQuickValue(index, nextValue)}
                  placeholder={`${quickPresets[index]}`}
                  placeholderTextColor={theme.colors.textMuted}
                  style={[
                    styles.quickInput,
                    { color: theme.colors.textPrimary },
                  ]}
                  value={value}
                />
              </View>
            ))}
          </View>
          <View style={styles.presetRow}>
            {quickPresets.map((preset, index) => (
              <Pressable
                key={`quick-preset-${preset}`}
                onPress={() => setQuickValue(index, String(preset))}
                style={({ pressed }) => [
                  styles.presetChip,
                  { backgroundColor: theme.colors.surfaceMuted },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.presetLabel,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {t('settings.water.slotPreset', {
                    index: index + 1,
                    amount: preset,
                  })}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.summaryBox,
            { backgroundColor: theme.colors.surfaceMuted },
          ]}
        >
          <Text
            style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}
          >
            {t('settings.water.summaryTitle')}
          </Text>
          <Text
            style={[styles.summaryBody, { color: theme.colors.textSecondary }]}
          >
            {t('settings.water.summaryBody', {
              target: Number(target) || preferences.dailyWaterTargetMl,
              buttons:
                parsedQuickAmounts.join(', ') ||
                t('settings.water.summaryNotSet'),
            })}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            setDailyWaterTarget(
              Number(target) || preferences.dailyWaterTargetMl,
            );
            setQuickWaterAmounts(parsedQuickAmounts);
          }}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.brand,
              shadowColor: theme.shadows.button.shadowColor,
              shadowOffset: theme.shadows.button.shadowOffset,
              shadowOpacity: theme.shadows.button.shadowOpacity,
              shadowRadius: theme.shadows.button.shadowRadius,
              elevation: theme.shadows.button.elevation,
            },
          ]}
        >
          <Text
            style={[styles.buttonLabel, { color: theme.colors.textOnTint }]}
          >
            {t('settings.water.save')}
          </Text>
        </Pressable>
      </View>

      <HydrationHistoryList items={hydrationHistoryItems} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
    gap: spacing.lg,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  title: { ...typography.h1 },
  body: { ...typography.body },
  section: { gap: spacing.sm },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepButton: {
    minWidth: 72,
    minHeight: 52,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  stepLabel: { ...typography.bodyStrong, fontSize: 15 },
  targetInput: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
    textAlign: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  presetLabel: { ...typography.caption, fontSize: 14 },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickSlot: {
    width: '47%',
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 6,
  },
  quickSlotLabel: { ...typography.caption },
  quickInput: {
    ...typography.bodyStrong,
    fontSize: 18,
    paddingVertical: 0,
  },
  summaryBox: {
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 4,
  },
  summaryTitle: { ...typography.bodyStrong, fontSize: 15 },
  summaryBody: { ...typography.caption, lineHeight: 18 },
  button: {
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { ...typography.bodyStrong },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
