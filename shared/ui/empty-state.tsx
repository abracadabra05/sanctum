import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/shared/theme';

interface EmptyStateProps {
  icon: 'water' | 'tasks' | 'habits' | 'search';
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  const theme = useTheme();

  const renderIcon = () => {
    const color = theme.colors.textMuted;
    switch (icon) {
      case 'water':
        return <Ionicons color={color} name="water-outline" size={48} />;
      case 'tasks':
        return (
          <Ionicons color={color} name="checkmark-circle-outline" size={48} />
        );
      case 'habits':
        return <MaterialIcons color={color} name="auto-awesome" size={44} />;
      case 'search':
        return <Ionicons color={color} name="search" size={48} />;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.colors.surfaceMuted },
        ]}
      >
        {renderIcon()}
      </View>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <Text style={[styles.action, { color: theme.colors.brand }]}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: {
    ...typography.bodyStrong,
  },
});
