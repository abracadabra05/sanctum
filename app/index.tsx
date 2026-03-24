import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { useTheme } from '@/shared/theme';

export default function IndexRoute() {
  const theme = useTheme();
  const isReady = useAppStore((state) => state.isReady);
  const hydrate = useAppStore((state) => state.hydrate);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.preferences.hasCompletedOnboarding,
  );

  useEffect(() => {
    if (!isReady) {
      void hydrate();
    }
  }, [hydrate, isReady]);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.backgroundTop,
        }}
      >
        <ActivityIndicator color={theme.colors.brand} size="large" />
      </View>
    );
  }

  return <Redirect href={hasCompletedOnboarding ? '/(tabs)' : '/onboarding'} />;
}
