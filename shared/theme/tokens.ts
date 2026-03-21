export const colors = {
  backgroundTop: '#F8FBFF',
  backgroundBottom: '#EDF4FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F6FB',
  surfaceStrong: '#E5ECF5',
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
  habitMintText: '#0B6D74',
  shadow: 'rgba(15, 45, 78, 0.12)',
};

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

export const shadows = {
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
};
