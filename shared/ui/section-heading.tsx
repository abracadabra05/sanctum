import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/shared/theme';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeading({
  eyebrow,
  title,
  actionLabel,
  onActionPress,
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
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.actionWrap,
            pressed && styles.actionPressed,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[styles.action, { color: theme.colors.brand }]}
          >
            {actionLabel}
          </Text>
        </Pressable>
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
  actionWrap: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  actionPressed: {
    opacity: 0.7,
  },
});
