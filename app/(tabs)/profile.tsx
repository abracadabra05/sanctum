import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

const settingsLinks = [
  { href: '/settings/water', label: 'Water' },
  { href: '/settings/categories', label: 'Task categories' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/display', label: 'Display & theme' },
  { href: '/settings/data', label: 'Data' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const preferences = useAppStore((state) => state.preferences);
  const allHabits = useAppStore((state) => state.habits);
  const allCategories = useAppStore((state) => state.taskCategories);
  const setAppTourSeen = useAppStore((state) => state.setAppTourSeen);
  const habits = useMemo(
    () => allHabits.filter((habit) => !habit.archived),
    [allHabits],
  );
  const categories = useMemo(
    () => allCategories.filter((category) => !category.archived),
    [allCategories],
  );

  return (
    <ScreenShell
      header={
        <View style={styles.header}>
          <Text
            style={[styles.headerTitle, { color: theme.colors.textPrimary }]}
          >
            Profile
          </Text>
          <Ionicons
            color={theme.colors.iconNeutral}
            name="person-circle-outline"
            size={28}
          />
        </View>
      }
    >
      <View
        style={[
          styles.hero,
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
        <View
          style={[styles.avatar, { backgroundColor: theme.colors.brandSoft }]}
        >
          <Text style={[styles.avatarLabel, { color: theme.colors.brand }]}>
            {preferences.displayName.slice(0, 1)}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
          {preferences.displayName}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Focus, hydration and rituals in one calm space.
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
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          Overview
        </Text>
        <View style={styles.row}>
          <Text style={[styles.key, { color: theme.colors.textSecondary }]}>
            Water goal
          </Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
            {preferences.dailyWaterTargetMl} ml
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.key, { color: theme.colors.textSecondary }]}>
            Quick amounts
          </Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
            {preferences.quickWaterAmounts.join(', ')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.key, { color: theme.colors.textSecondary }]}>
            Categories
          </Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
            {categories.length}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.key, { color: theme.colors.textSecondary }]}>
            Habits
          </Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
            {habits.length}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.key, { color: theme.colors.textSecondary }]}>
            Theme
          </Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
            {preferences.themeMode}
          </Text>
        </View>
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
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          Start guide
        </Text>
        <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>
          Replay the quick tour any time before release or after a major
          settings change.
        </Text>
        <Pressable
          onPress={() => setAppTourSeen(false)}
          style={({ pressed }) => [
            styles.tourButton,
            { backgroundColor: theme.colors.brandSoft },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.tourLabel, { color: theme.colors.brand }]}>
            Replay quick tour
          </Text>
        </Pressable>
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
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          Settings
        </Text>
        {settingsLinks.map((item) => (
          <Link
            href={item.href as never}
            key={item.href}
            style={styles.linkRow}
          >
            <Text style={[styles.linkText, { color: theme.colors.brand }]}>
              {item.label}
            </Text>
          </Link>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: { fontSize: 34, fontWeight: '700' },
  name: { ...typography.h1 },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  card: {
    gap: spacing.md,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  cardTitle: { ...typography.h2 },
  helper: { ...typography.body },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  key: { ...typography.body },
  value: { ...typography.bodyStrong },
  tourButton: {
    minHeight: 52,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourLabel: { ...typography.bodyStrong },
  linkRow: { paddingVertical: 10 },
  linkText: { ...typography.bodyStrong },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
