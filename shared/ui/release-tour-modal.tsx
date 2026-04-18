import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { spacing, typography, useTheme } from '@/shared/theme';

interface ReleaseTourModalProps {
  visible: boolean;
  onFinish: () => void;
}

const steps = [
  {
    id: 'tasks',
    title: 'Create your first task',
    body: 'Open the task builder, add a title, choose the date and time, then save it. The guide starts with a blank list on purpose.',
    hint: 'As soon as the first task is created, the guide moves to habits.',
    icon: 'checkmark-circle-outline',
  },
  {
    id: 'habits',
    title: 'Build a habit from scratch',
    body: 'Now create your first habit: pick a name, set the schedule, choose a reminder if needed, and save it.',
    hint: 'After the first habit is saved, the guide will wrap up.',
    icon: 'leaf-outline',
  },
  {
    id: 'ready',
    title: 'Everything is ready',
    body: 'Dashboard keeps water, tasks and habits together, while Profile lets you replay this guide and open the full settings hub later.',
    hint: null,
    icon: 'dashboard',
  },
] as const;

export function ReleaseTourModal({ visible, onFinish }: ReleaseTourModalProps) {
  const theme = useTheme();
  const router = useRouter();
  const queueQuickAction = useUiStore((state) => state.queueQuickAction);
  const taskCount = useAppStore(
    (state) => state.tasks.filter((item) => !item.archived).length,
  );
  const habitCount = useAppStore(
    (state) => state.habits.filter((item) => !item.archived).length,
  );

  const [stepIndex, setStepIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const startingCountsRef = useRef({ tasks: 0, habits: 0 });
  const taskCountRef = useRef(taskCount);
  const habitCountRef = useRef(habitCount);

  useEffect(() => {
    taskCountRef.current = taskCount;
  }, [taskCount]);

  useEffect(() => {
    habitCountRef.current = habitCount;
  }, [habitCount]);

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      opacity.setValue(0);
      translateY.setValue(18);
      return;
    }

    startingCountsRef.current = {
      tasks: taskCountRef.current,
      habits: habitCountRef.current,
    };

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
  }, [opacity, translateY, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (stepIndex === 0 && taskCount > startingCountsRef.current.tasks) {
      setStepIndex(1);
      return;
    }

    if (stepIndex === 1 && habitCount > startingCountsRef.current.habits) {
      setStepIndex(2);
    }
  }, [habitCount, stepIndex, taskCount, visible]);

  const step = steps[stepIndex];
  const isPracticeStep = step.id === 'tasks' || step.id === 'habits';

  const icon = useMemo(() => {
    if (step.id === 'ready') {
      return (
        <MaterialIcons color={theme.colors.brand} name="dashboard" size={24} />
      );
    }

    return <Ionicons color={theme.colors.brand} name={step.icon} size={24} />;
  }, [step.icon, step.id, theme.colors.brand]);

  const goNext = () => {
    if (stepIndex === steps.length - 1) {
      onFinish();
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const handlePrimaryAction = () => {
    if (step.id === 'tasks') {
      queueQuickAction('open-create-task');
      router.navigate('/tasks');
      return;
    }

    if (step.id === 'habits') {
      queueQuickAction('open-create-habit');
      router.navigate('/habits');
      return;
    }

    onFinish();
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceFloating,
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
              { backgroundColor: theme.colors.surfaceActive },
            ]}
          >
            {icon}
          </View>
          <Pressable onPress={onFinish} style={styles.skipButton}>
            <Text
              style={[styles.skipLabel, { color: theme.colors.textSecondary }]}
            >
              Later
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.eyebrow, { color: theme.colors.brand }]}>
          Interactive guide
        </Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {step.title}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {step.body}
        </Text>
        {step.hint ? (
          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            {step.hint}
          </Text>
        ) : null}

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
          {isPracticeStep ? (
            <Pressable
              onPress={goNext}
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
                Next
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={handlePrimaryAction}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.colors.brand },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.primaryLabel, { color: theme.colors.surface }]}
            >
              {step.id === 'tasks'
                ? 'Open task builder'
                : step.id === 'habits'
                  ? 'Open habit builder'
                  : 'Finish'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 132,
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
  hint: {
    ...typography.caption,
    lineHeight: 18,
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
