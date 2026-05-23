// Theme configuration for HOG-U Mobile App

export const theme = {
  colors: {
    primary: '#1a7f63',
    secondary: '#4ade80',
    background: '#0a0a0a',
    surface: '#1a1a1a',
    card: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    textTertiary: '#666666',
    success: '#4ade80',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    disabled: '#4a4a4a',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
    h2: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
    h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    bodyBold: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
    small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    smallBold: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
    tiny: { fontSize: 10, fontWeight: '400', lineHeight: 14 },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#1a7f63',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'CRITICAL':
      return theme.colors.danger;
    case 'HIGH':
      return theme.colors.warning;
    case 'MODERATE':
      return theme.colors.info;
    case 'LOW':
      return theme.colors.success;
    default:
      return theme.colors.textSecondary;
  }
};

export const getActivityColor = (activityType) => {
  const colors = {
    Run: '#ef4444',
    Ride: '#3b82f6',
    Walk: '#f59e0b',
    Swim: '#06b6d4',
    Workout: '#8b5cf6',
    Hike: '#22c55e',
  };
  return colors[activityType] || theme.colors.secondary;
};
