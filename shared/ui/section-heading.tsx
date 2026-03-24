import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/shared/theme';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  actionLabel?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  actionLabel,
}: SectionHeadingProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: theme.colors.textPrimary }]}>
          {eyebrow}
        </Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {title}
        </Text>
      </View>
      {actionLabel ? (
        <Text style={[styles.action, { color: theme.colors.brand }]}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    gap: 8,
    flexShrink: 1,
  },
  eyebrow: {
    ...typography.eyebrow,
  },
  title: {
    ...typography.h1,
  },
  action: {
    ...typography.bodyStrong,
  },
});
