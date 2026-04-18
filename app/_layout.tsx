import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { AppState } from 'react-native';
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

function AppBootstrap() {
  const isReady = useAppStore((state) => state.isReady);
  const hydrate = useAppStore((state) => state.hydrate);
  const rolloverDayIfNeeded = useAppStore((state) => state.rolloverDayIfNeeded);

  useEffect(() => {
    if (!isReady) {
      void hydrate();
    }
  }, [hydrate, isReady]);

  useEffect(() => {
    if (isReady) {
      rolloverDayIfNeeded();
    }
  }, [isReady, rolloverDayIfNeeded]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') {
        return;
      }

      const store = useAppStore.getState();
      if (!store.isReady) {
        void store.hydrate();
        return;
      }

      store.rolloverDayIfNeeded();
    });

    return () => subscription.remove();
  }, []);

  return null;
}

export default function RootLayout() {
  const themeMode = useAppStore((state) => state.preferences.themeMode);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider mode={themeMode}>
        <AppBootstrap />
        <AppNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
