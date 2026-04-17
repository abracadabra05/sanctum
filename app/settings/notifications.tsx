import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

const intervalOptions = [60, 90, 120, 180];
const cutoffPresets = ['20:00', '21:00', '22:00'];

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function NotificationsSettingsScreen() {
  const theme = useTheme();
  const preferences = useAppStore((state) => state.preferences);
  const setNotificationPreferences = useAppStore(
    (state) => state.setNotificationPreferences,
  );
  const [enabled, setEnabled] = useState(preferences.notificationsEnabled);
  const [interval, setIntervalDraft] = useState(
    preferences.waterReminderIntervalMinutes ?? 90,
  );
  const [cutoff, setCutoff] = useState(
    preferences.waterReminderCutoffTime ?? '22:00',
  );

  const cutoffValid = useMemo(() => timePattern.test(cutoff), [cutoff]);

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
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Water reminders stay local and only run when you enable them.
        </Text>

        <Pressable
          onPress={() => setEnabled((value) => !value)}
          style={({ pressed }) => [
            styles.toggleCard,
            { backgroundColor: theme.colors.surfaceMuted },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.toggleBody}>
            <Text
              style={[styles.toggleTitle, { color: theme.colors.textPrimary }]}
            >
              Water reminders
            </Text>
            <Text
              style={[styles.toggleHint, { color: theme.colors.textSecondary }]}
            >
              Skip reminders after your cutoff time or once the goal is reached.
            </Text>
          </View>
          <View
            style={[
              styles.togglePill,
              {
                backgroundColor: enabled
                  ? theme.colors.brand
                  : theme.colors.surfaceStrong,
              },
            ]}
          >
            <Text
              style={[
                styles.toggleLabel,
                {
                  color: enabled
                    ? theme.colors.textOnTint
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {enabled ? 'On' : 'Off'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Reminder interval
          </Text>
          <View style={styles.segmentRow}>
            {intervalOptions.map((item) => {
              const active = interval === item;
              return (
                <Pressable
                  key={item}
                  disabled={!enabled}
                  onPress={() => setIntervalDraft(item)}
                  style={({ pressed }) => [
                    styles.segment,
                    {
                      opacity: enabled ? 1 : 0.45,
                      backgroundColor: active
                        ? theme.colors.brand
                        : theme.colors.surfaceMuted,
                    },
                    enabled && pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      {
                        color: active
                          ? theme.colors.textOnTint
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {item}m
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Stop reminders after
          </Text>
          <TextInput
            editable={enabled}
            onChangeText={setCutoff}
            placeholder="22:00"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              {
                opacity: enabled ? 1 : 0.45,
                backgroundColor: theme.colors.input,
                color: theme.colors.textPrimary,
                borderColor: cutoffValid
                  ? 'transparent'
                  : theme.colors.accentRed,
              },
            ]}
            value={cutoff}
          />
          <View style={styles.segmentRow}>
            {cutoffPresets.map((item) => {
              const active = cutoff === item;
              return (
                <Pressable
                  key={item}
                  disabled={!enabled}
                  onPress={() => setCutoff(item)}
                  style={({ pressed }) => [
                    styles.segment,
                    {
                      opacity: enabled ? 1 : 0.45,
                      backgroundColor: active
                        ? theme.colors.brand
                        : theme.colors.surfaceMuted,
                    },
                    enabled && pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      {
                        color: active
                          ? theme.colors.textOnTint
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {!cutoffValid ? (
            <Text style={[styles.errorText, { color: theme.colors.accentRed }]}>
              Use the 24-hour format, for example 22:00.
            </Text>
          ) : null}
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
            Reminder behavior
          </Text>
          <Text
            style={[styles.summaryBody, { color: theme.colors.textSecondary }]}
          >
            Every {interval} minutes until {cutoff}. The app skips reminders
            once your water goal is done.
          </Text>
        </View>

        <Pressable
          disabled={!cutoffValid}
          onPress={async () => {
            await setNotificationPreferences({
              enabled,
              waterReminderIntervalMinutes: interval,
              waterReminderCutoffTime: cutoff,
            });
          }}
          style={[
            styles.button,
            {
              opacity: cutoffValid ? 1 : 0.5,
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
    gap: spacing.lg,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  title: { ...typography.h1 },
  body: { ...typography.body },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  toggleBody: { flex: 1, gap: 2 },
  toggleTitle: { ...typography.bodyStrong },
  toggleHint: { ...typography.caption, lineHeight: 18 },
  togglePill: {
    minWidth: 64,
    minHeight: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  toggleLabel: { ...typography.caption, fontSize: 14 },
  section: { gap: spacing.sm },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  segment: {
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentLabel: { ...typography.bodyStrong, fontSize: 15 },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
  },
  errorText: { ...typography.caption },
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
