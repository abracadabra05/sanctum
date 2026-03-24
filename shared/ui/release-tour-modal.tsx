import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { spacing, typography, useTheme } from '@/shared/theme';

interface ReleaseTourModalProps {
  visible: boolean;
  onFinish: () => void;
}

const steps = [
  {
    id: 'dashboard',
    title: 'Dashboard keeps the day calm',
    body: "Track water, see today's top tasks and check your habit momentum from one screen.",
    icon: 'dashboard',
    route: '/',
  },
  {
    id: 'tasks',
    title: 'Tasks are built for fast action',
    body: 'Use search, category filters and quick create. Swipe left to clear a task, tap to complete, long press to edit.',
    icon: 'checkmark-circle-outline',
    route: '/tasks',
  },
  {
    id: 'habits',
    title: 'Habits stay separate from tasks',
    body: 'Tap a card to mark progress. Long press any habit to edit schedule, reminder and goal.',
    icon: 'leaf-outline',
    route: '/habits',
  },
  {
    id: 'profile',
    title: 'Profile is your control room',
    body: 'Theme, notifications, data export and the tour itself now live there for easy recovery.',
    icon: 'person-outline',
    route: '/profile',
  },
] as const;

export function ReleaseTourModal({ visible, onFinish }: ReleaseTourModalProps) {
  const theme = useTheme();
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      opacity.setValue(0);
      translateY.setValue(18);
      return;
    }

    router.replace(steps[0].route);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, router, translateY, visible]);

  const step = steps[stepIndex];

  const goNext = () => {
    if (stepIndex === steps.length - 1) {
      onFinish();
      return;
    }

    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    router.replace(steps[nextIndex].route);
  };

  const icon = useMemo(() => {
    if (step.id === 'dashboard') {
      return (
        <MaterialIcons color={theme.colors.brand} name="dashboard" size={24} />
      );
    }

    return <Ionicons color={theme.colors.brand} name={step.icon} size={24} />;
  }, [step.icon, step.id, theme.colors.brand]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surfaceElevated,
              shadowColor: theme.shadows.card.shadowColor,
              shadowOffset: theme.shadows.card.shadowOffset,
              shadowOpacity: theme.shadows.card.shadowOpacity,
              shadowRadius: theme.shadows.card.shadowRadius,
              elevation: theme.shadows.card.elevation,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.topRow}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: theme.colors.brandSoft },
              ]}
            >
              {icon}
            </View>
            <Pressable onPress={onFinish} style={styles.skipButton}>
              <Text
                style={[
                  styles.skipLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Skip
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.eyebrow, { color: theme.colors.brand }]}>
            Quick tour
          </Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {step.title}
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            {step.body}
          </Text>

          <View style={styles.dotsRow}>
            {steps.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === stepIndex
                        ? theme.colors.brand
                        : theme.colors.surfaceMuted,
                    width: index === stepIndex ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onFinish}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: theme.colors.surfaceMuted },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.secondaryLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Later
              </Text>
            </Pressable>
            <Pressable
              onPress={goNext}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.colors.brand },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.primaryLabel, { color: theme.colors.surface }]}
              >
                {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: 132,
  },
  card: {
    borderRadius: 26,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipLabel: {
    ...typography.caption,
    fontSize: 14,
  },
  eyebrow: {
    ...typography.eyebrow,
    fontSize: 11,
  },
  title: {
    ...typography.h2,
  },
  body: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
