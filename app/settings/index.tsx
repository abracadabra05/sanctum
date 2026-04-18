import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/shared/i18n';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function SettingsIndexScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const links = useMemo(
    () => [
      {
        href: '/settings/water',
        label: t('settings.index.water.label'),
        summary: t('settings.index.water.summary'),
        icon: 'water-outline',
      },
      {
        href: '/settings/categories',
        label: t('settings.index.categories.label'),
        summary: t('settings.index.categories.summary'),
        icon: 'pricetags-outline',
      },
      {
        href: '/settings/notifications',
        label: t('settings.index.notifications.label'),
        summary: t('settings.index.notifications.summary'),
        icon: 'notifications-outline',
      },
      {
        href: '/settings/display',
        label: t('settings.index.display.label'),
        summary: t('settings.index.display.summary'),
        icon: 'color-palette-outline',
      },
      {
        href: '/settings/archive',
        label: t('settings.index.archive.label'),
        summary: t('settings.index.archive.summary'),
        icon: 'archive-outline',
      },
      {
        href: '/settings/data',
        label: t('settings.index.data.label'),
        summary: t('settings.index.data.summary'),
        icon: 'download-outline',
      },
    ],
    [t],
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
          {t('settings.index.title')}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {t('settings.index.body')}
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
