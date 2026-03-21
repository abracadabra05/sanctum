import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@/shared/theme';

const iconMap = {
  index: (active: boolean) => (
    <MaterialIcons
      color={active ? colors.brand : colors.textMuted}
      name="dashboard"
      size={24}
    />
  ),
  tasks: (active: boolean) => (
    <Ionicons
      color={active ? colors.brand : colors.textMuted}
      name={active ? 'checkmark-circle' : 'checkmark-circle-outline'}
      size={24}
    />
  ),
  habits: (active: boolean) => (
    <MaterialIcons
      color={active ? colors.brand : colors.textMuted}
      name="auto-awesome"
      size={24}
    />
  ),
  profile: (active: boolean) => (
    <Ionicons
      color={active ? colors.brand : colors.textMuted}
      name="person"
      size={22}
    />
  ),
};

const labelMap = {
  index: 'Dashboard',
  tasks: 'Tasks',
  habits: 'Habits',
  profile: 'Profile',
};

function SanctumTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
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

          const renderIcon = iconMap[route.name as keyof typeof iconMap];

          return (
            <Pressable
              accessibilityRole="button"
              key={route.key}
              onPress={onPress}
              style={[styles.item, focused && styles.itemActive]}
            >
              {renderIcon(focused)}
              <Text style={[styles.label, focused && styles.labelActive]}>
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
  return (
    <Tabs
      tabBar={(props) => <SanctumTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 22,
  },
  itemActive: {
    backgroundColor: colors.brandSoft,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: colors.brand,
  },
});
