import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

const settingsLinks = [
  {
    href: '/settings/water',
    label: 'Water',
    summary: 'Goal, quick buttons and hydration defaults',
    icon: 'water-outline',
  },
  {
    href: '/settings/categories',
    label: 'Task categories',
    summary: 'Create, edit and archive custom categories',
    icon: 'pricetags-outline',
  },
  {
    href: '/settings/notifications',
    label: 'Notifications',
    summary: 'Reminder timing and cutoff rules',
    icon: 'notifications-outline',
  },
  {
    href: '/settings/display',
    label: 'Display & theme',
    summary: 'Theme mode, clock format and week start',
    icon: 'color-palette-outline',
  },
  {
    href: '/settings/archive',
    label: 'Archive center',
    summary: 'Restore archived tasks and habits',
    icon: 'archive-outline',
  },
  {
    href: '/settings/data',
    label: 'Data',
    summary: 'Export, import and reset local state',
    icon: 'download-outline',
  },
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

  const overviewRows = [
    {
      label: 'Water plan',
      value: `${preferences.dailyWaterTargetMl} ml`,
      detail: `${preferences.quickWaterAmounts.length} quick buttons`,
    },
    {
      label: 'Active habits',
      value: String(habits.length),
      detail: 'Tracked inside the Habits tab',
    },
    {
      label: 'Task categories',
      value: String(categories.length),
      detail: 'Preset and custom filters',
    },
    {
      label: 'Appearance',
      value:
        preferences.themeMode === 'system'
          ? 'System'
          : preferences.themeMode === 'dark'
            ? 'Dark'
            : 'Light',
      detail: `${preferences.timeFormat} clock`,
    },
  ];

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
          Local settings hub for hydration, tasks, habits and release checks.
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
        {overviewRows.map((row) => (
          <View
            key={row.label}
            style={[
              styles.overviewRow,
              { backgroundColor: theme.colors.surfaceMuted },
            ]}
          >
            <View style={styles.overviewCopy}>
              <Text style={[styles.key, { color: theme.colors.textPrimary }]}>
                {row.label}
              </Text>
              <Text
                style={[styles.detail, { color: theme.colors.textSecondary }]}
              >
                {row.detail}
              </Text>
            </View>
            <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
              {row.value}
            </Text>
          </View>
        ))}
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
          Release prep
        </Text>
        <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>
          Replay the onboarding guide after larger UI changes and before final
          QA.
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
          <Link asChild href={item.href as never} key={item.href}>
            <Pressable
              style={[
                styles.settingsRow,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: theme.colors.surfaceFloating },
                ]}
              >
                <Ionicons
                  color={theme.colors.brand}
                  name={item.icon as never}
                  size={18}
                />
              </View>
              <View style={styles.settingsCopy}>
                <Text
                  style={[styles.linkText, { color: theme.colors.textPrimary }]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.linkSummary,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.summary}
                </Text>
              </View>
              <Ionicons
                color={theme.colors.textMuted}
                name="chevron-forward"
                size={18}
              />
            </Pressable>
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
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  overviewCopy: { flex: 1, gap: 2 },
  key: { ...typography.bodyStrong },
  detail: { ...typography.caption, lineHeight: 18 },
  value: { ...typography.bodyStrong },
  helper: { ...typography.body },
  tourButton: {
    minHeight: 52,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourLabel: { ...typography.bodyStrong },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCopy: { flex: 1, gap: 2 },
  linkText: { ...typography.bodyStrong, fontSize: 16 },
  linkSummary: { ...typography.caption, lineHeight: 18 },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
