import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

const links = [
  { href: '/settings/water', label: 'Water preferences' },
  { href: '/settings/categories', label: 'Task categories' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/display', label: 'Display & theme' },
  { href: '/settings/archive', label: 'Archive center' },
  { href: '/settings/data', label: 'Export / import / reset' },
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
          Tune your calm, local-first Sanctum experience.
        </Text>
        {links.map((link) => (
          <Link
            href={link.href as never}
            key={link.href}
            style={[styles.link, { color: theme.colors.brand }]}
          >
            {link.label}
          </Link>
        ))}
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
  link: { ...typography.bodyStrong, paddingVertical: 6 },
});
