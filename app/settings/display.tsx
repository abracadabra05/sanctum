import { useState } from 'react';
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

export default function DisplaySettingsScreen() {
  const theme = useTheme();
  const preferences = useAppStore((state) => state.preferences);
  const setDisplayPreferences = useAppStore(
    (state) => state.setDisplayPreferences,
  );
  const [name, setName] = useState(preferences.displayName);
  const [timeFormat, setTimeFormat] = useState(preferences.timeFormat);
  const [weekStartsOn, setWeekStartsOn] = useState(
    String(preferences.weekStartsOn),
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>(preferences.themeMode);

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
          Display
        </Text>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Display name
        </Text>
        <TextInput
          onChangeText={setName}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
            },
          ]}
          value={name}
        />
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Theme
        </Text>
        <View style={styles.segmentRow}>
          {['system', 'light', 'dark'].map((item) => (
            <Pressable
              key={item}
              onPress={() => setThemeMode(item as ThemeMode)}
              style={[
                styles.segment,
                {
                  backgroundColor:
                    themeMode === item
                      ? theme.colors.brand
                      : theme.colors.surfaceMuted,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    color:
                      themeMode === item
                        ? theme.colors.surface
                        : theme.colors.textPrimary,
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.segmentRow}>
          {['12h', '24h'].map((item) => (
            <Pressable
              key={item}
              onPress={() => setTimeFormat(item as '12h' | '24h')}
              style={[
                styles.segment,
                {
                  backgroundColor:
                    timeFormat === item
                      ? theme.colors.brand
                      : theme.colors.surfaceMuted,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  {
                    color:
                      timeFormat === item
                        ? theme.colors.surface
                        : theme.colors.textPrimary,
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Week starts on (0-6)
        </Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setWeekStartsOn}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
            },
          ]}
          value={weekStartsOn}
        />
        <Pressable
          onPress={() =>
            setDisplayPreferences({
              displayName: name.trim() || preferences.displayName,
              timeFormat,
              weekStartsOn: Number(weekStartsOn) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
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
          <Text style={[styles.buttonLabel, { color: theme.colors.surface }]}>
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
  segmentRow: { flexDirection: 'row', gap: spacing.sm },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentLabel: { ...typography.bodyStrong },
  button: {
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { ...typography.bodyStrong },
});
