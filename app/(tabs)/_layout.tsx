import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

  const renderIcon = (name: string, active: boolean) => {
    const color = active ? theme.colors.brand : theme.colors.tabIcon;

    if (name === 'index') {
      return <MaterialIcons color={color} name="dashboard" size={24} />;
    }

    if (name === 'tasks') {
      return (
        <Ionicons
          color={color}
          name={active ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={24}
        />
      );
    }

    if (name === 'habits') {
      return <MaterialIcons color={color} name="auto-awesome" size={24} />;
    }

    return <Ionicons color={color} name="person" size={22} />;
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
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key].options;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              accessibilityRole="button"
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.item,
                focused && {
                  backgroundColor: theme.colors.brandSoft,
                },
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

  useEffect(() => {
    if (isReady && hasCompletedOnboarding && !hasSeenAppTour) {
      setTourVisible(true);
    }
  }, [hasCompletedOnboarding, hasSeenAppTour, isReady]);

  return (
    <>
      <Tabs
        tabBar={(props) => <SanctumTabBar {...props} />}
        screenOptions={{ headerShown: false }}
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
    </>
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
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 22,
  },
  itemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
});
