import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type AppTheme, type ThemeMode } from './tokens';

const ThemeContext = createContext<AppTheme>(lightTheme);

export function ThemeProvider({
  children,
  mode,
}: PropsWithChildren<{ mode: ThemeMode }>) {
  const systemScheme = useColorScheme();
  const theme = useMemo(() => {
    if (mode === 'dark') {
      return darkTheme;
    }

    if (mode === 'light') {
      return lightTheme;
    }

    return systemScheme === 'dark' ? darkTheme : lightTheme;
  }, [mode, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
