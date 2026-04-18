import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabActions } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  State as GestureState,
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/shared/i18n';
import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ArchiveSnackbar } from '@/shared/ui/archive-snackbar';
import { ReleaseTourModal } from '@/shared/ui/release-tour-modal';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const TAB_BAR_BLOCKERS = new Set([
  'task-sheet',
  'task-sheet-drag',
  'habit-sheet',
  'habit-sheet-drag',
  'habit-detail-sheet',
  'task-search-overlay',
  'app-menu',
  'radial-fab',
  'release-tour',
  'task-filter-scroll',
  'dashboard-habits-scroll',
  'task-card-swipe-intent',
  'task-swipe',
]);

function SanctumTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const gestureBlockers = useUiStore((store) => store.gestureBlockers);
  const isTabBarBlocked = useMemo(
    () => gestureBlockers.some((reason) => TAB_BAR_BLOCKERS.has(reason)),
    [gestureBlockers],
  );
  const dragStartX = useRef(0);
  const isDraggingRef = useRef(false);
  const labelMap = useMemo(
    () => ({
      index: t('tabs.dashboard'),
      tasks: t('tasks.header'),
      habits: t('habits.header'),
      profile: t('profile.header'),
    }),
    [t],
  );

  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>(
    Array.from({ length: state.routes.length }, () => ({ x: 0, width: 0 })),
  );

  const pillTranslateX = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(
    new Animated.Value(state.index === 0 ? 1 : 0),
  ).current;
  const pillWidth = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    const layout = tabLayouts[state.index];
    if (!layout || layout.width <= 0 || isDraggingRef.current) {
      return;
    }

    Animated.parallel([
      Animated.spring(pillTranslateX, {
        toValue: layout.x,
        damping: 18,
        stiffness: 200,
        useNativeDriver: false,
      }),
      Animated.spring(pillWidth, {
        toValue: layout.width,
        damping: 18,
        stiffness: 200,
        useNativeDriver: false,
      }),
      Animated.timing(pillOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [pillOpacity, pillTranslateX, pillWidth, state.index, tabLayouts]);

  const pillStyle = useMemo(
    () => ({
      transform: [{ translateX: pillTranslateX }],
      width: pillWidth,
      opacity: pillOpacity,
    }),
    [pillOpacity, pillTranslateX, pillWidth],
  );

  const animatePillToTab = useCallback(
    (index: number) => {
      const layout = tabLayouts[index];
      if (!layout || layout.width <= 0) {
        return;
      }

      Animated.parallel([
        Animated.spring(pillTranslateX, {
          toValue: layout.x,
          damping: 18,
          stiffness: 200,
          useNativeDriver: false,
        }),
        Animated.spring(pillWidth, {
          toValue: layout.width,
          damping: 18,
          stiffness: 200,
          useNativeDriver: false,
        }),
        Animated.timing(pillOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    },
    [pillOpacity, pillTranslateX, pillWidth, tabLayouts],
  );

  const getNearestTabIndex = useCallback(
    (positionX: number) =>
      tabLayouts.reduce((closestIndex, layout, index) => {
        const closestCenter =
          tabLayouts[closestIndex].x + tabLayouts[closestIndex].width / 2;
        const currentCenter = layout.x + layout.width / 2;
        const closestDistance = Math.abs(closestCenter - positionX);
        const currentDistance = Math.abs(currentCenter - positionX);
        return currentDistance < closestDistance ? index : closestIndex;
      }, state.index),
    [state.index, tabLayouts],
  );

  const handleTabLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => {
      const next = [...prev];
      next[index] = { x, width };
      return next;
    });
  };

  const renderIcon = (name: string, active: boolean) => {
    const color = active ? theme.colors.brand : theme.colors.tabIcon;

    if (name === 'index') {
      return <MaterialIcons color={color} name="dashboard" size={22} />;
    }
    if (name === 'tasks') {
      return (
        <Ionicons
          color={color}
          name={active ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={22}
        />
      );
    }
    if (name === 'habits') {
      return <MaterialIcons color={color} name="auto-awesome" size={22} />;
    }
    return <Ionicons color={color} name="person" size={20} />;
  };

  const handleTabDragStateChange = ({
    nativeEvent,
  }: PanGestureHandlerStateChangeEvent) => {
    const activeLayout = tabLayouts[state.index];
    if (!activeLayout) {
      return;
    }

    if (nativeEvent.state === GestureState.ACTIVE) {
      isDraggingRef.current = true;
      dragStartX.current = activeLayout.x;
      pillOpacity.setValue(1);
      return;
    }

    if (nativeEvent.oldState !== GestureState.ACTIVE) {
      return;
    }

    isDraggingRef.current = false;

    const firstLayout = tabLayouts[0];
    const lastLayout = tabLayouts[tabLayouts.length - 1];
    if (!firstLayout || !lastLayout) {
      return;
    }

    const projectedCenter = clamp(
      dragStartX.current + nativeEvent.translationX + activeLayout.width / 2,
      firstLayout.x + firstLayout.width / 2,
      lastLayout.x + lastLayout.width / 2,
    );
    const nextIndex =
      Math.abs(nativeEvent.translationX) < 12
        ? state.index
        : getNearestTabIndex(projectedCenter);

    if (nextIndex !== state.index) {
      const route = state.routes[nextIndex];
      if (route) {
        animatePillToTab(nextIndex);
        navigation.dispatch(TabActions.jumpTo(route.name));
      }
      return;
    }
    animatePillToTab(state.index);
  };

  const handleTabDrag = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (!isDraggingRef.current) {
      return;
    }

    const firstLayout = tabLayouts[0];
    const lastLayout = tabLayouts[tabLayouts.length - 1];
    if (!firstLayout || !lastLayout) {
      return;
    }

    const nextX = clamp(
      dragStartX.current + nativeEvent.translationX,
      firstLayout.x,
      lastLayout.x,
    );

    pillTranslateX.setValue(nextX);
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.colors.backgroundBottom,
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
      ]}
    >
      <PanGestureHandler
        activeOffsetX={[-12, 12]}
        enabled={!isTabBarBlocked}
        failOffsetY={[-10, 10]}
        onGestureEvent={handleTabDrag}
        onHandlerStateChange={handleTabDragStateChange}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surfaceFloating,
              shadowColor: theme.shadows.card.shadowColor,
              shadowOffset: theme.shadows.card.shadowOffset,
              shadowOpacity: theme.shadows.card.shadowOpacity,
              shadowRadius: theme.shadows.card.shadowRadius,
              elevation: theme.shadows.card.elevation,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.pill,
              { backgroundColor: theme.colors.surfaceActive },
              pillStyle,
            ]}
          />

          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key].options;
            const onPress = () => {
              if (isTabBarBlocked) {
                return;
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                animatePillToTab(index);
                navigation.dispatch(TabActions.jumpTo(route.name));
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityLabel={
                  options.title ?? labelMap[route.name as keyof typeof labelMap]
                }
                disabled={isTabBarBlocked}
                onLayout={handleTabLayout(index)}
                onPress={onPress}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                ]}
              >
                {renderIcon(route.name, focused)}
                <Text
                  style={[
                    styles.label,
                    {
                      color: focused
                        ? theme.colors.brand
                        : theme.colors.tabIcon,
                    },
                  ]}
                >
                  {options.title ??
                    labelMap[route.name as keyof typeof labelMap]}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useI18n();
  const isReady = useAppStore((state) => state.isReady);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.preferences.hasCompletedOnboarding,
  );
  const hasSeenAppTour = useAppStore(
    (state) => state.preferences.hasSeenAppTour,
  );
  const setAppTourSeen = useAppStore((state) => state.setAppTourSeen);
  const [tourVisible, setTourVisible] = useState(false);

  useEffect(() => {
    if (isReady && hasCompletedOnboarding && !hasSeenAppTour) {
      setTourVisible(true);
    }
  }, [hasCompletedOnboarding, hasSeenAppTour, isReady]);

  return (
    <View
      style={[styles.layout, { backgroundColor: theme.colors.backgroundTop }]}
    >
      <Animated.View style={styles.layout}>
        <Tabs
          detachInactiveScreens={false}
          screenOptions={{
            headerShown: false,
            lazy: false,
            freezeOnBlur: false,
            sceneStyle: { backgroundColor: theme.colors.backgroundTop },
            transitionSpec: {
              animation: 'timing',
              config: {
                duration: 300,
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              },
            },
            sceneStyleInterpolator: ({ current }) => ({
              sceneStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-14, 0, 14],
                    }),
                  },
                  {
                    scale: current.progress.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [0.996, 1, 0.996],
                    }),
                  },
                ],
              },
            }),
          }}
          tabBar={(props) => <SanctumTabBar {...props} />}
        >
          <Tabs.Screen name="index" options={{ title: t('tabs.dashboard') }} />
          <Tabs.Screen name="tasks" options={{ title: t('tasks.header') }} />
          <Tabs.Screen name="habits" options={{ title: t('habits.header') }} />
          <Tabs.Screen
            name="profile"
            options={{ title: t('profile.header') }}
          />
        </Tabs>
        <ArchiveSnackbar />
        <ReleaseTourModal
          visible={tourVisible}
          onFinish={() => {
            setTourVisible(false);
            setAppTourSeen(true);
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
  },
  wrapper: {
    paddingHorizontal: spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    borderRadius: 22,
    top: spacing.sm,
    bottom: spacing.sm,
    zIndex: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 22,
    zIndex: 1,
  },
  itemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
});
