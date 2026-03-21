import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function WaterSettingsScreen() {
  const preferences = useAppStore((state) => state.preferences);
  const setDailyWaterTarget = useAppStore((state) => state.setDailyWaterTarget);
  const setQuickWaterAmounts = useAppStore(
    (state) => state.setQuickWaterAmounts,
  );
  const [target, setTarget] = useState(String(preferences.dailyWaterTargetMl));
  const [quick, setQuick] = useState(preferences.quickWaterAmounts.join(','));

  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Water</Text>
        <Text style={styles.label}>Daily target</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setTarget}
          style={styles.input}
          value={target}
        />
        <Text style={styles.label}>Quick amounts</Text>
        <TextInput onChangeText={setQuick} style={styles.input} value={quick} />
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
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>Save water settings</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    ...shadows.card,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  button: {
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    ...shadows.button,
  },
  buttonLabel: { ...typography.bodyStrong, color: colors.surface },
});
