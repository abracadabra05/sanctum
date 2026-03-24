import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

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
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: theme.colors.backgroundTop },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const themeMode = useAppStore((state) => state.preferences.themeMode);

  return (
    <ThemeProvider mode={themeMode}>
      <AppNavigator />
    </ThemeProvider>
  );
}
