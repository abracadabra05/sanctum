import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/shared/theme';

interface FabProps {
  onPress: () => void;
}

export function Fab({ onPress }: FabProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create"
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.colors.brand,
          bottom: insets.bottom + spacing.md,
          shadowColor: theme.shadows.button.shadowColor,
          shadowOffset: theme.shadows.button.shadowOffset,
          shadowOpacity: theme.shadows.button.shadowOpacity,
          shadowRadius: theme.shadows.button.shadowRadius,
          elevation: theme.shadows.button.elevation,
        },
        pressed && styles.fabPressed,
      ]}
    >
      <Ionicons color={theme.colors.surface} name="add" size={30} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
