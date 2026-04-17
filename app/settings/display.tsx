import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import {
  radii,
  spacing,
  typography,
  useTheme,
  type ThemeMode,
} from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

const themeOptions: { value: ThemeMode; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Follow device appearance' },
  { value: 'light', label: 'Light', hint: 'Bright surfaces and soft contrast' },
  { value: 'dark', label: 'Dark', hint: 'Deeper surfaces for night use' },
];

const weekdays = [
  { value: 1 as const, label: 'Mon' },
  { value: 2 as const, label: 'Tue' },
  { value: 3 as const, label: 'Wed' },
  { value: 4 as const, label: 'Thu' },
  { value: 5 as const, label: 'Fri' },
  { value: 6 as const, label: 'Sat' },
  { value: 0 as const, label: 'Sun' },
];

export default function DisplaySettingsScreen() {
  const theme = useTheme();
  const preferences = useAppStore((state) => state.preferences);
  const setDisplayPreferences = useAppStore(
    (state) => state.setDisplayPreferences,
  );
  const [name, setName] = useState(preferences.displayName);
  const [timeFormat, setTimeFormat] = useState(preferences.timeFormat);
  const [weekStartsOn, setWeekStartsOn] = useState(preferences.weekStartsOn);
  const [themeMode, setThemeMode] = useState<ThemeMode>(preferences.themeMode);

  const currentThemeSummary = useMemo(
    () => themeOptions.find((item) => item.value === themeMode)?.hint ?? '',
    [themeMode],
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
          Display & theme
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Keep names and time settings readable at a glance.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Display name
          </Text>
          <TextInput
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input,
                color: theme.colors.textPrimary,
              },
            ]}
            value={name}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Theme
          </Text>
          <View style={styles.optionStack}>
            {themeOptions.map((option) => {
              const active = themeMode === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setThemeMode(option.value)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    {
                      backgroundColor: active
                        ? theme.colors.surfaceActive
                        : theme.colors.surfaceMuted,
                      borderColor: active
                        ? theme.colors.brand
                        : theme.colors.border,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.optionBody}>
                    <Text
                      style={[
                        styles.optionTitle,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionHint,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {option.hint}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: active
                          ? theme.colors.brand
                          : theme.colors.border,
                        backgroundColor: active
                          ? theme.colors.brand
                          : 'transparent',
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Time format
          </Text>
          <View style={styles.segmentRow}>
            {(['12h', '24h'] as const).map((item) => {
              const active = timeFormat === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setTimeFormat(item)}
                  style={({ pressed }) => [
                    styles.segment,
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
                      styles.segmentLabel,
                      {
                        color: active
                          ? theme.colors.textOnTint
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {item === '12h' ? '12-hour' : '24-hour'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            First day of week
          </Text>
          <View style={styles.chipWrap}>
            {weekdays.map((day) => {
              const active = weekStartsOn === day.value;
              return (
                <Pressable
                  key={day.label}
                  onPress={() => setWeekStartsOn(day.value)}
                  style={({ pressed }) => [
                    styles.dayChip,
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
                      styles.dayLabel,
                      {
                        color: active
                          ? theme.colors.textOnTint
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
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
            Current mode
          </Text>
          <Text
            style={[styles.summaryBody, { color: theme.colors.textSecondary }]}
          >
            {currentThemeSummary}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            setDisplayPreferences({
              displayName: name.trim() || preferences.displayName,
              timeFormat,
              weekStartsOn,
              themeMode,
            })
          }
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
            Save display settings
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
  section: { gap: spacing.sm },
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
  optionStack: { gap: spacing.sm },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionBody: { flex: 1, gap: 2 },
  optionTitle: { ...typography.bodyStrong },
  optionHint: { ...typography.caption, lineHeight: 18 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  segmentRow: { flexDirection: 'row', gap: spacing.sm },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentLabel: { ...typography.bodyStrong, fontSize: 15 },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayChip: {
    minWidth: 58,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  dayLabel: { ...typography.caption, fontSize: 14 },
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
