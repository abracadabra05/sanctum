import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppStore } from '@/shared/store/app-store';
import { ThemeProvider, useTheme } from '@/shared/theme';

function AppNavigator() {
  const theme = useTheme();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.backgroundTop);
  }, [theme.colors.backgroundTop]);

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.backgroundTop },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen
          name="onboarding"
          options={{ animation: 'fade_from_bottom' }}
        />
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen
          name="settings"
          options={{ animation: 'fade_from_bottom' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const themeMode = useAppStore((state) => state.preferences.themeMode);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider mode={themeMode}>
        <AppNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
