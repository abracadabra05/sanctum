import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useUiStore } from '@/shared/store/ui-store';
import { spacing, typography, useTheme } from '@/shared/theme';

interface AppMenuProps {
  visible: boolean;
  onClose: () => void;
  onSearchTasks: () => void;
  onCreateTask: () => void;
  onCreateHabit: () => void;
  onOpenData: () => void;
  onOpenProfile: () => void;
}

const items = [
  { key: 'search', label: 'Search tasks', icon: 'search-outline' },
  { key: 'task', label: 'Quick add task', icon: 'add-circle-outline' },
  { key: 'habit', label: 'Quick add habit', icon: 'leaf-outline' },
  { key: 'data', label: 'Data actions', icon: 'download-outline' },
  { key: 'profile', label: 'Profile & settings', icon: 'person-outline' },
] as const;

export function AppMenu(props: AppMenuProps) {
  const theme = useTheme();
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    setGestureBlock('app-menu', props.visible);

    if (!props.visible) {
      opacity.setValue(0);
      translateY.setValue(-10);
      scale.setValue(0.98);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, props.visible, scale, setGestureBlock, translateY]);

  const handlers = {
    search: props.onSearchTasks,
    task: props.onCreateTask,
    habit: props.onCreateHabit,
    data: props.onOpenData,
    profile: props.onOpenProfile,
  } as const;

  return (
    <Modal transparent visible={props.visible} animationType="none">
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: theme.colors.overlay, opacity },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          style={StyleSheet.absoluteFill}
          onPress={props.onClose}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surfaceFloating,
              borderColor: theme.colors.border,
              shadowColor: theme.shadows.card.shadowColor,
              shadowOffset: theme.shadows.card.shadowOffset,
              shadowOpacity: theme.shadows.card.shadowOpacity,
              shadowRadius: theme.shadows.card.shadowRadius,
              elevation: theme.shadows.card.elevation,
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Quick actions
          </Text>
          {items.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => {
                props.onClose();
                handlers[item.key]();
              }}
              style={({ pressed }) => [
                styles.item,
                { borderBottomColor: theme.colors.divider },
                pressed && styles.itemPressed,
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: theme.colors.surfaceActive },
                ]}
              >
                <Ionicons
                  color={theme.colors.brand}
                  name={item.icon}
                  size={18}
                />
              </View>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 92,
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    width: '88%',
    borderRadius: 28,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyStrong,
    marginBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.bodyStrong,
  },
});
