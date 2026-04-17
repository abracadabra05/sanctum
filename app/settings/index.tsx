import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

const links = [
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
    summary: 'Water reminder timing and cutoff rules',
    icon: 'notifications-outline',
  },
  {
    href: '/settings/display',
    label: 'Display & theme',
    summary: 'Theme mode, time format and week start',
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
    summary: 'Export, import and reset local data',
    icon: 'download-outline',
  },
];

export default function SettingsIndexScreen() {
  const theme = useTheme();

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
          Settings
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          App-level controls live here. Data stays local unless you export it.
        </Text>
        <View style={styles.list}>
          {links.map((link) => (
            <Link asChild href={link.href as never} key={link.href}>
              <Pressable
                style={[
                  styles.row,
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
                    name={link.icon as never}
                    size={18}
                  />
                </View>
                <View style={styles.copy}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {link.label}
                  </Text>
                  <Text
                    style={[
                      styles.rowBody,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {link.summary}
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
  body: { ...typography.body },
  list: { gap: spacing.sm },
  row: {
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
  copy: { flex: 1, gap: 2 },
  rowTitle: { ...typography.bodyStrong, fontSize: 16 },
  rowBody: { ...typography.caption, lineHeight: 18 },
});
