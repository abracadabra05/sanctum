export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  background: string;
  backgroundTop: string;
  backgroundBottom: string;
  surface: string;
  surfaceMuted: string;
  surfaceStrong: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandStrong: string;
  brandSoft: string;
  accentRed: string;
  accentRedSoft: string;
  accentPink: string;
  accentMint: string;
  accentBlue: string;
  accentGray: string;
  divider: string;
  border: string;
  overlay: string;
  shadow: string;
  input: string;
  tabIcon: string;
  successSurface: string;
  iconNeutral: string;
}

export interface ThemeShadows {
  card: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  button: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface AppTheme {
  mode: Exclude<ThemeMode, 'system'>;
  colors: ThemeColors;
  shadows: ThemeShadows;
}

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
};

export const radii = {
  pill: 999,
  card: 30,
  tile: 32,
  button: 26,
};

export const typography = {
  eyebrow: {
    fontSize: 13,
    letterSpacing: 2.2,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  h1: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  bodyStrong: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F6FAFF',
    backgroundTop: '#F8FBFF',
    backgroundBottom: '#EDF4FB',
    surface: '#FFFFFF',
    surfaceMuted: '#F2F6FB',
    surfaceStrong: '#E5ECF5',
    surfaceElevated: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    brand: '#0F6DCA',
    brandStrong: '#0A57A3',
    brandSoft: '#DDEBFF',
    accentRed: '#C92B2B',
    accentRedSoft: '#FCE5E5',
    accentPink: '#F7DCE9',
    accentMint: '#CFF4F1',
    accentBlue: '#DCEEFF',
    accentGray: '#DDE5F0',
    divider: '#E2E8F0',
    border: '#D9E5F1',
    overlay: 'rgba(15,23,42,0.28)',
    shadow: 'rgba(15,45,78,0.12)',
    input: '#EEF3F9',
    tabIcon: '#94A3B8',
    successSurface: '#0F6DCA',
    iconNeutral: '#6F7E95',
  },
  shadows: {
    card: {
      shadowColor: '#17375B',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 32,
      elevation: 8,
    },
    button: {
      shadowColor: '#0F6DCA',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.22,
      shadowRadius: 20,
      elevation: 6,
    },
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#0A1220',
    backgroundTop: '#0D1626',
    backgroundBottom: '#101D31',
    surface: '#132238',
    surfaceMuted: '#182A43',
    surfaceStrong: '#1D3351',
    surfaceElevated: '#1A2D47',
    textPrimary: '#F3F7FD',
    textSecondary: '#9FB1C8',
    textMuted: '#6E85A4',
    brand: '#4A9CFF',
    brandStrong: '#81BBFF',
    brandSoft: '#173657',
    accentRed: '#FF6B6B',
    accentRedSoft: '#4A2228',
    accentPink: '#3A2942',
    accentMint: '#1F4D4B',
    accentBlue: '#203F61',
    accentGray: '#253850',
    divider: '#28415F',
    border: '#2D4766',
    overlay: 'rgba(2,6,23,0.62)',
    shadow: 'rgba(2,6,23,0.42)',
    input: '#17283E',
    tabIcon: '#7E93AF',
    successSurface: '#4A9CFF',
    iconNeutral: '#A7B7CC',
  },
  shadows: {
    card: {
      shadowColor: '#020617',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
      elevation: 10,
    },
    button: {
      shadowColor: '#0A1628',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.24,
      shadowRadius: 20,
      elevation: 7,
    },
  },
};

export const colors = lightTheme.colors;
export const shadows = lightTheme.shadows;
