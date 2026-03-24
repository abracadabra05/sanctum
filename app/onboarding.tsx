import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function OnboardingScreen() {
  const theme = useTheme();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [name, setName] = useState('Astra');
  const [waterGoal, setWaterGoal] = useState('2500');
  const [enableNotifications, setEnableNotifications] = useState(true);

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: theme.colors.brand }]}>
          Welcome
        </Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Set up your sanctuary
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Start with your name, hydration goal and reminders. A quick product
          tour will guide you through the rest right after this step.
        </Text>
      </View>

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
          Daily water target (ml)
        </Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setWaterGoal}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
            },
          ]}
          value={waterGoal}
        />

        <Pressable
          onPress={() => setEnableNotifications((value) => !value)}
          style={styles.toggleRow}
        >
          <Text
            style={[styles.toggleText, { color: theme.colors.textPrimary }]}
          >
            Enable reminders
          </Text>
          <View
            style={[
              styles.toggle,
              {
                backgroundColor: enableNotifications
                  ? theme.colors.brandSoft
                  : theme.colors.surfaceMuted,
              },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                {
                  alignSelf: enableNotifications ? 'flex-end' : 'flex-start',
                  backgroundColor: enableNotifications
                    ? theme.colors.brand
                    : theme.colors.surface,
                },
              ]}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={async () => {
            const parsedGoal = Number(waterGoal);
            if (!name.trim() || Number.isNaN(parsedGoal) || parsedGoal <= 0) {
              Alert.alert(
                'Check the form',
                'Please enter a name and a valid daily water target.',
              );
              return;
            }
            await completeOnboarding({
              displayName: name.trim(),
              dailyWaterTargetMl: parsedGoal,
              enableNotifications,
            });
            router.replace('/(tabs)');
          }}
          style={[
            styles.primaryButton,
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
          <Text style={[styles.primaryLabel, { color: theme.colors.surface }]}>
            Continue to Sanctum
          </Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  eyebrow: {
    ...typography.eyebrow,
  },
  title: {
    ...typography.h1,
    fontSize: 34,
  },
  body: {
    ...typography.body,
  },
  card: {
    gap: spacing.md,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyStrong,
  },
  toggleRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    ...typography.bodyStrong,
  },
  toggle: {
    width: 54,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  primaryButton: {
    marginTop: spacing.md,
    minHeight: 58,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    ...typography.bodyStrong,
  },
});
