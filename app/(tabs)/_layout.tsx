import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, Tabs } from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import {
  Animated,
  Dimensions,
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

import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ArchiveSnackbar } from '@/shared/ui/archive-snackbar';
import { ReleaseTourModal } from '@/shared/ui/release-tour-modal';

const labelMap = {
  index: 'Dashboard',
  tasks: 'Tasks',
  habits: 'Habits',
  profile: 'Profile',
};

const tabPaths = ['/', '/tasks', '/habits', '/profile'] as const;
const SCREEN_WIDTH = Dimensions.get('window').width;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function SanctumTabBar({
  state,
  descriptors,
  navigation,
  gestureHandlerRef,
}: BottomTabBarProps & {
  gestureHandlerRef: MutableRefObject<PanGestureHandler | null>;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const setGestureBlock = useUiStore((store) => store.setGestureBlock);
  const dragStartX = useRef(0);
  const isDraggingRef = useRef(false);

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

  const getNearestTabIndex = useCallback(
    (positionX: number) =>
      tabLayouts.reduce((closestIndex, layout, index) => {
        const closestDistance = Math.abs(
          tabLayouts[closestIndex].x - positionX,
        );
        const currentDistance = Math.abs(layout.x - positionX);
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
      setGestureBlock('tabbar-drag', true);
      return;
    }

    if (nativeEvent.oldState !== GestureState.ACTIVE) {
      return;
    }

    isDraggingRef.current = false;
    setGestureBlock('tabbar-drag', false);

    const firstLayout = tabLayouts[0];
    const lastLayout = tabLayouts[tabLayouts.length - 1];
    if (!firstLayout || !lastLayout) {
      return;
    }

    const projectedX = clamp(
      dragStartX.current + nativeEvent.translationX,
      firstLayout.x,
      lastLayout.x,
    );
    const nextIndex =
      Math.abs(nativeEvent.translationX) < 12
        ? state.index
        : getNearestTabIndex(projectedX);
    const nextLayout = tabLayouts[nextIndex] ?? activeLayout;

    Animated.parallel([
      Animated.spring(pillTranslateX, {
        toValue: nextLayout.x,
        damping: 18,
        stiffness: 200,
        useNativeDriver: false,
      }),
      Animated.spring(pillWidth, {
        toValue: nextLayout.width,
        damping: 18,
        stiffness: 200,
        useNativeDriver: false,
      }),
    ]).start();

    if (nextIndex !== state.index) {
      navigation.navigate(state.routes[nextIndex].name);
    }
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
        failOffsetY={[-10, 10]}
        onGestureEvent={handleTabDrag}
        onHandlerStateChange={handleTabDragStateChange}
        ref={gestureHandlerRef}
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
              navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityLabel={
                  options.title ?? labelMap[route.name as keyof typeof labelMap]
                }
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
  const isReady = useAppStore((state) => state.isReady);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.preferences.hasCompletedOnboarding,
  );
  const hasSeenAppTour = useAppStore(
    (state) => state.preferences.hasSeenAppTour,
  );
  const setAppTourSeen = useAppStore((state) => state.setAppTourSeen);
  const isNavigationGestureBlocked = useUiStore(
    (state) => state.isNavigationGestureBlocked,
  );
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const [tourVisible, setTourVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const tabBarGestureRef = useRef<PanGestureHandler | null>(null);
  const ignoreGlobalSwipeRef = useRef(false);

  useEffect(() => {
    if (isReady && hasCompletedOnboarding && !hasSeenAppTour) {
      setTourVisible(true);
    }
  }, [hasCompletedOnboarding, hasSeenAppTour, isReady]);

  const handleGlobalSwipeStateChange = ({
    nativeEvent,
  }: PanGestureHandlerStateChangeEvent) => {
    if (nativeEvent.state === GestureState.ACTIVE) {
      if (useUiStore.getState().isNavigationGestureBlocked) {
        ignoreGlobalSwipeRef.current = true;
        return;
      }

      ignoreGlobalSwipeRef.current = false;
      setGestureBlock('global-tab-swipe', true);
      return;
    }

    if (nativeEvent.oldState !== GestureState.ACTIVE) {
      return;
    }

    setGestureBlock('global-tab-swipe', false);

    if (
      ignoreGlobalSwipeRef.current ||
      useUiStore.getState().isNavigationGestureBlocked
    ) {
      ignoreGlobalSwipeRef.current = false;
      return;
    }

    ignoreGlobalSwipeRef.current = false;

    const horizontalIntent =
      Math.abs(nativeEvent.translationX) >
      Math.abs(nativeEvent.translationY) * 1.4;
    const strongEnough =
      Math.abs(nativeEvent.translationX) > 104 ||
      Math.abs(nativeEvent.velocityX) > 780;

    if (!horizontalIntent || !strongEnough) {
      return;
    }

    const nextIndex = clamp(
      nativeEvent.translationX < 0 ? activeIndex + 1 : activeIndex - 1,
      0,
      3,
    );

    if (nextIndex === activeIndex) {
      return;
    }

    router.navigate(tabPaths[nextIndex]);
  };

  return (
    <View
      style={[styles.layout, { backgroundColor: theme.colors.backgroundTop }]}
    >
      <PanGestureHandler
        activeOffsetX={[-34, 34]}
        enabled={!isNavigationGestureBlocked}
        failOffsetY={[-18, 18]}
        onHandlerStateChange={handleGlobalSwipeStateChange}
        waitFor={tabBarGestureRef}
      >
        <Animated.View style={styles.layout}>
          <Tabs
            screenListeners={{
              state: (event) => {
                const index = event.data.state?.index;
                if (typeof index === 'number') {
                  setActiveIndex(index);
                }
              },
            }}
            screenOptions={{
              headerShown: false,
              animation: 'none',
              transitionSpec: {
                animation: 'timing',
                config: {
                  duration: 240,
                  easing: Easing.out(Easing.cubic),
                },
              },
              sceneStyleInterpolator: ({ current }) => ({
                sceneStyle: {
                  opacity: current.progress.interpolate({
                    inputRange: [-1, -0.18, 0, 0.18, 1],
                    outputRange: [0.9, 0.98, 1, 0.98, 0.9],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              }),
              sceneStyle: { backgroundColor: theme.colors.backgroundTop },
            }}
            tabBar={(props) => (
              <SanctumTabBar {...props} gestureHandlerRef={tabBarGestureRef} />
            )}
          >
            <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
            <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
            <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
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
      </PanGestureHandler>
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
