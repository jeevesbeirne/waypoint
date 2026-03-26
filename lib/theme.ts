export const colors = {
  primary: '#0F1B2D' as const,
  background: '#F8F6F1' as const,
  surface: '#FFFFFF' as const,
  accent: '#D4870A' as const,
  accentLight: '#FEF3C7' as const,
  text: {
    primary: '#0F1B2D' as const,
    secondary: '#4B5563' as const,
    muted: '#9CA3AF' as const,
    inverse: '#FFFFFF' as const,
  },
  success: '#16A34A' as const,
  warning: '#D97706' as const,
  error: '#DC2626' as const,
  neutral: '#6B7280' as const,
  overlay: 'rgba(15, 27, 45, 0.35)' as const,
  border: '#E5E7EB' as const,
  phase: {
    learn: '#3B82F6' as const,
    build: '#8B5CF6' as const,
    deliver: '#10B981' as const,
  },
  dark: {
    primary: '#F8F6F1' as const,
    background: '#0F1B2D' as const,
    surface: '#1A2D44' as const,
    border: '#2D3F54' as const,
    text: {
      primary: '#F8F6F1' as const,
      secondary: '#9CA3AF' as const,
      muted: '#6B7280' as const,
      inverse: '#0F1B2D' as const,
    },
  },
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const radii = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

export type PhaseKey = 'learn' | 'build' | 'deliver';

export const phaseConfig = {
  learn: {
    key: 'learn' as PhaseKey,
    name: 'Learn & Listen',
    days: '1–30',
    color: colors.phase.learn,
    icon: '🔍',
    description: 'Diagnose your situation, build relationships, understand culture',
  },
  build: {
    key: 'build' as PhaseKey,
    name: 'Build & Connect',
    days: '31–60',
    color: colors.phase.build,
    icon: '🤝',
    description: 'Secure early wins, build your coalition, clarify expectations',
  },
  deliver: {
    key: 'deliver' as PhaseKey,
    name: 'Deliver & Lead',
    days: '61–90',
    color: colors.phase.deliver,
    icon: '🚀',
    description: 'Drive momentum, develop your team, sustain progress',
  },
};
