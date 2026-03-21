import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function DisplaySettingsScreen() {
  const preferences = useAppStore((state) => state.preferences);
  const setDisplayPreferences = useAppStore(
    (state) => state.setDisplayPreferences,
  );
  const [name, setName] = useState(preferences.displayName);
  const [timeFormat, setTimeFormat] = useState(preferences.timeFormat);
  const [weekStartsOn, setWeekStartsOn] = useState(
    String(preferences.weekStartsOn),
  );

  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Display</Text>
        <Text style={styles.label}>Display name</Text>
        <TextInput onChangeText={setName} style={styles.input} value={name} />
        <View style={styles.segmentRow}>
          {['12h', '24h'].map((item) => (
            <Pressable
              key={item}
              onPress={() => setTimeFormat(item as '12h' | '24h')}
              style={[
                styles.segment,
                timeFormat === item && styles.segmentActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  timeFormat === item && styles.segmentLabelActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Week starts on (0-6)</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setWeekStartsOn}
          style={styles.input}
          value={weekStartsOn}
        />
        <Pressable
          onPress={() =>
            setDisplayPreferences({
              displayName: name.trim() || preferences.displayName,
              timeFormat,
              weekStartsOn: Number(weekStartsOn) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
            })
          }
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>Save display settings</Text>
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
  segmentRow: { flexDirection: 'row', gap: spacing.sm },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: '#E8EDF4',
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: colors.brand },
  segmentLabel: { ...typography.bodyStrong, color: colors.textPrimary },
  segmentLabelActive: { color: colors.surface },
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
