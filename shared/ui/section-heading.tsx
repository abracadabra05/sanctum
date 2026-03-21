import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';

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
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
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
    color: colors.textPrimary,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  action: {
    ...typography.bodyStrong,
    color: colors.brand,
  },
});
