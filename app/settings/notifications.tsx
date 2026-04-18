import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';
import { TimeStepper } from '@/shared/ui/time-stepper';

const intervalOptions = [60, 90, 120, 180];
const cutoffPresets = ['20:00', '21:00', '22:00'];

export default function NotificationsSettingsScreen() {
  const theme = useTheme();
  const preferences = useAppStore((state) => state.preferences);
  const timeFormat = useAppStore((state) => state.preferences.timeFormat);
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
          <TimeStepper
            disabled={!enabled}
            label="Stop reminders after"
            minuteStep={30}
            onChange={setCutoff}
            presets={cutoffPresets}
            timeFormat={timeFormat}
            value={cutoff}
          />
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
