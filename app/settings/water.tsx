import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function WaterSettingsScreen() {
  const theme = useTheme();
  const preferences = useAppStore((state) => state.preferences);
  const setDailyWaterTarget = useAppStore((state) => state.setDailyWaterTarget);
  const setQuickWaterAmounts = useAppStore(
    (state) => state.setQuickWaterAmounts,
  );
  const [target, setTarget] = useState(String(preferences.dailyWaterTargetMl));
  const [quick, setQuick] = useState(preferences.quickWaterAmounts.join(','));

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
          Water
        </Text>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Daily target
        </Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setTarget}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
            },
          ]}
          value={target}
        />
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Quick amounts
        </Text>
        <TextInput
          onChangeText={setQuick}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
            },
          ]}
          value={quick}
        />
        <Pressable
          onPress={() => {
            setDailyWaterTarget(
              Number(target) || preferences.dailyWaterTargetMl,
            );
            setQuickWaterAmounts(
              quick
                .split(',')
                .map((item) => Number(item.trim()))
                .filter((item) => !Number.isNaN(item) && item > 0),
            );
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
          <Text style={[styles.buttonLabel, { color: theme.colors.surface }]}>
            Save water settings
          </Text>
        </Pressable>
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
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
  },
  button: {
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { ...typography.bodyStrong },
});
