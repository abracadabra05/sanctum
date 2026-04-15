import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ReleaseTourModal } from '@/shared/ui/release-tour-modal';

const labelMap = {
  index: 'Dashboard',
  tasks: 'Tasks',
  habits: 'Habits',
  profile: 'Profile',
};

function SanctumTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Track each tab's layout for pill positioning
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>(
    Array(state.routes.length).fill({ x: 0, width: 0 }),
  );

  // Animated pill position
  const pillTranslateX = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(
    new Animated.Value(state.index === 0 ? 1 : 0),
  ).current;

  const pillWidth = useRef(new Animated.Value(60)).current;

  // Sync pill position with current tab index
  useEffect(() => {
    const layout = tabLayouts[state.index];
    if (layout && layout.width > 0) {
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
    }
  }, [state.index, tabLayouts, pillTranslateX, pillWidth, pillOpacity]);

  const pillStyle = useMemo(
    () => ({
      left: pillTranslateX,
      width: pillWidth,
      opacity: pillOpacity,
    }),
    [pillTranslateX, pillWidth, pillOpacity],
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

  const tabPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 15,
        onPanResponderRelease: (_, gs) => {
          if (Math.abs(gs.dx) > 40) {
            const idx = state.index;
            if (gs.dx < 0 && idx < state.routes.length - 1) {
              navigation.navigate(state.routes[idx + 1].name);
            } else if (gs.dx > 0 && idx > 0) {
              navigation.navigate(state.routes[idx - 1].name);
            }
          }
        },
      }),
    [state.index, state.routes, navigation],
  );

  return (
    <View
      {...tabPanResponder.panHandlers}
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.colors.backgroundBottom,
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surfaceElevated,
            shadowColor: theme.shadows.card.shadowColor,
            shadowOffset: theme.shadows.card.shadowOffset,
            shadowOpacity: theme.shadows.card.shadowOpacity,
            shadowRadius: theme.shadows.card.shadowRadius,
            elevation: theme.shadows.card.elevation,
          },
        ]}
      >
        {/* Animated indicator pill */}
        <Animated.View
          style={[
            styles.pill,
            { backgroundColor: theme.colors.brandSoft },
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
              onPress={onPress}
              onLayout={handleTabLayout(index)}
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
                    color: focused ? theme.colors.brand : theme.colors.tabIcon,
                  },
                ]}
              >
                {options.title ?? labelMap[route.name as keyof typeof labelMap]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const isReady = useAppStore((state) => state.isReady);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.preferences.hasCompletedOnboarding,
  );
  const hasSeenAppTour = useAppStore(
    (state) => state.preferences.hasSeenAppTour,
  );
  const setAppTourSeen = useAppStore((state) => state.setAppTourSeen);
  const [tourVisible, setTourVisible] = useState(false);
  const navRef = useRef<{
    navigate: (name: string) => void;
    currentIndex: number;
  }>({ navigate: () => {}, currentIndex: 0 });

  const routeNames = ['index', 'tasks', 'habits', 'profile'];

  const swipePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (e) => {
          const { pageX, pageY } = e.nativeEvent;
          const { width, height } = Dimensions.get('window');
          // Dead zone in bottom-right for RadialFab
          if (pageX > width * 0.65 && pageY > height * 0.75) {
            return false;
          }
          return false;
        },
        onMoveShouldSetPanResponder: (e, gs) => {
          const { pageX, pageY } = e.nativeEvent;
          const { width, height } = Dimensions.get('window');
          // Estimate initial touch point
          const startX = pageX - gs.dx;
          const startY = pageY - gs.dy;

          if (startX > width * 0.65 && startY > height * 0.75) {
            return false;
          }

          return Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 15;
        },
        onPanResponderRelease: (_, gs) => {
          if (Math.abs(gs.dx) > 50) {
            const idx = navRef.current.currentIndex;
            if (gs.dx < 0 && idx < routeNames.length - 1) {
              navRef.current.navigate(routeNames[idx + 1]);
            } else if (gs.dx > 0 && idx > 0) {
              navRef.current.navigate(routeNames[idx - 1]);
            }
          }
        },
      }),
    [routeNames],
  );

  useEffect(() => {
    if (isReady && hasCompletedOnboarding && !hasSeenAppTour) {
      setTourVisible(true);
    }
  }, [hasCompletedOnboarding, hasSeenAppTour, isReady]);

  return (
    <View style={{ flex: 1 }} {...swipePanResponder.panHandlers}>
      <Tabs
        tabBar={(props) => {
          navRef.current = {
            navigate: (name: string) => props.navigation.navigate(name),
            currentIndex: props.state.index,
          };
          return <SanctumTabBar {...props} />;
        }}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
        <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
      <ReleaseTourModal
        visible={tourVisible}
        onFinish={() => {
          setTourVisible(false);
          setAppTourSeen(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    height: '100%',
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
