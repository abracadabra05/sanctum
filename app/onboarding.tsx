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
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function OnboardingScreen() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [name, setName] = useState('Astra');
  const [waterGoal, setWaterGoal] = useState('2500');
  const [enableNotifications, setEnableNotifications] = useState(true);

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Welcome</Text>
        <Text style={styles.title}>Set up your sanctuary</Text>
        <Text style={styles.body}>
          A quick setup for your name, hydration target and optional reminders.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Display name</Text>
        <TextInput onChangeText={setName} style={styles.input} value={name} />

        <Text style={styles.label}>Daily water target (ml)</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setWaterGoal}
          style={styles.input}
          value={waterGoal}
        />

        <Pressable
          onPress={() => setEnableNotifications((value) => !value)}
          style={styles.toggleRow}
        >
          <Text style={styles.toggleText}>Enable reminders</Text>
          <View
            style={[styles.toggle, enableNotifications && styles.toggleActive]}
          >
            <View
              style={[
                styles.toggleThumb,
                enableNotifications && styles.toggleThumbActive,
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
          style={styles.primaryButton}
        >
          <Text style={styles.primaryLabel}>Enter Sanctum</Text>
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
    color: colors.brand,
  },
  title: {
    ...typography.h1,
    fontSize: 34,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    ...shadows.card,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  toggleRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  toggle: {
    width: 54,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#D7E1EF',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleActive: {
    backgroundColor: '#BFD9FF',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand,
  },
  primaryButton: {
    marginTop: spacing.md,
    minHeight: 58,
    borderRadius: radii.button,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  primaryLabel: {
    ...typography.bodyStrong,
    color: colors.surface,
  },
});
