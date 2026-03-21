import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function NotificationsSettingsScreen() {
  const preferences = useAppStore((state) => state.preferences);
  const setNotificationPreferences = useAppStore(
    (state) => state.setNotificationPreferences,
  );
  const [enabled, setEnabled] = useState(preferences.notificationsEnabled);
  const [interval, setIntervalDraft] = useState(
    String(preferences.waterReminderIntervalMinutes ?? 90),
  );
  const [cutoff, setCutoff] = useState(
    preferences.waterReminderCutoffTime ?? '22:00',
  );

  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable
          onPress={() => setEnabled((value) => !value)}
          style={styles.toggleRow}
        >
          <Text style={styles.labelText}>Enable notifications</Text>
          <Text style={styles.valueText}>{enabled ? 'ON' : 'OFF'}</Text>
        </Pressable>
        <Text style={styles.label}>Water interval (minutes)</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setIntervalDraft}
          style={styles.input}
          value={interval}
        />
        <Text style={styles.label}>Water cutoff time</Text>
        <TextInput
          onChangeText={setCutoff}
          style={styles.input}
          value={cutoff}
        />
        <Pressable
          onPress={async () => {
            await setNotificationPreferences({
              enabled,
              waterReminderIntervalMinutes: Number(interval) || 90,
              waterReminderCutoffTime: cutoff,
            });
          }}
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>Save notifications</Text>
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: { ...typography.bodyStrong, color: colors.textPrimary },
  valueText: { ...typography.bodyStrong, color: colors.brand },
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
