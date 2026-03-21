import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

const settingsLinks = [
  { href: '/settings', label: 'Settings hub' },
  { href: '/settings/water', label: 'Water' },
  { href: '/settings/categories', label: 'Task categories' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/display', label: 'Display' },
  { href: '/settings/data', label: 'Data' },
];

export default function ProfileScreen() {
  const preferences = useAppStore((state) => state.preferences);
  const allHabits = useAppStore((state) => state.habits);
  const allCategories = useAppStore((state) => state.taskCategories);
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
          <Text style={styles.headerTitle}>Profile</Text>
          <Ionicons
            color={colors.textSecondary}
            name="person-circle-outline"
            size={28}
          />
        </View>
      }
    >
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>
            {preferences.displayName.slice(0, 1)}
          </Text>
        </View>
        <Text style={styles.name}>{preferences.displayName}</Text>
        <Text style={styles.subtitle}>
          Your calm operating system for focus, health and rituals.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <View style={styles.row}>
          <Text style={styles.key}>Daily hydration goal</Text>
          <Text style={styles.value}>{preferences.dailyWaterTargetMl} ml</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Quick water amounts</Text>
          <Text style={styles.value}>
            {preferences.quickWaterAmounts.join(', ')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Active categories</Text>
          <Text style={styles.value}>{categories.length}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Active habits</Text>
          <Text style={styles.value}>{habits.length}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        {settingsLinks.map((item) => (
          <Link
            href={item.href as never}
            key={item.href}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>{item.label}</Text>
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
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    ...shadows.card,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: { fontSize: 34, fontWeight: '700', color: colors.brand },
  name: { ...typography.h1, color: colors.textPrimary },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    ...shadows.card,
  },
  cardTitle: { ...typography.h2, color: colors.textPrimary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  key: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.bodyStrong, color: colors.textPrimary },
  linkRow: { paddingVertical: 10 },
  linkText: { ...typography.bodyStrong, color: colors.brand },
});
