import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function NotificationsSettingsScreen() {
  const theme = useTheme();
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
          Notifications
        </Text>
        <Pressable
          onPress={() => setEnabled((value) => !value)}
          style={styles.toggleRow}
        >
          <Text style={[styles.labelText, { color: theme.colors.textPrimary }]}>
            Enable notifications
          </Text>
          <Text style={[styles.valueText, { color: theme.colors.brand }]}>
            {enabled ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Water interval (minutes)
        </Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setIntervalDraft}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
            },
          ]}
          value={interval}
        />
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Water cutoff time
        </Text>
        <TextInput
          onChangeText={setCutoff}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
            },
          ]}
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
            Save notifications
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: { ...typography.bodyStrong },
  valueText: { ...typography.bodyStrong },
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
