import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

const links = [
  { href: '/settings/water', label: 'Water preferences' },
  { href: '/settings/categories', label: 'Task categories' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/display', label: 'Display' },
  { href: '/settings/data', label: 'Export / import / reset' },
];

export default function SettingsIndexScreen() {
  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.body}>
          Tune your local-first Sanctum experience.
        </Text>
        {links.map((link) => (
          <Link href={link.href as never} key={link.href} style={styles.link}>
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
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    ...shadows.card,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  link: { ...typography.bodyStrong, color: colors.brand, paddingVertical: 6 },
});
