const emberOrange = '#F97316';
const iceFlameBlue = '#60A5FA';
const offWhiteText = '#F3F4F6';
const graphiteBlack = '#0E0E0F';
const darkCard = '#1A1B1E';
const darkBorder = '#2C2D30';

export default {
  dark: {
    text: offWhiteText,
    textSecondary: '#9CA3AF',
    background: graphiteBlack,
    backgroundSecondary: '#18191B',
    surface: darkCard,
    surfaceAlt: '#1C1D20',
    surfaceInset: '#18191B',
    tint: emberOrange,
    accent: iceFlameBlue,
    tabIconDefault: '#6B7280',
    tabIconSelected: emberOrange,
    border: darkBorder,
    borderSubtle: '#242528',
    card: darkCard,
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    glow: emberOrange + '30',
    glowBlue: iceFlameBlue + '30',
    shareTrayBg: 'rgba(15,15,16,0.94)',
    shareTrayBorder: 'rgba(255,255,255,0.1)',
    statsTickerBg: '#000000',
  },
  light: {
    text: '#2A2620',
    textSecondary: '#6A5E50',
    textMuted: '#9A8D7E',
    background: '#E7D9C8',
    backgroundSecondary: '#EFE0D2',
    surface: '#F5E7D7',
    surfaceAlt: '#EFE0D2',
    surfaceInset: '#F9EFE4',
    tint: emberOrange,
    accent: '#4EA6FF',
    accentSoft: '#D2E9FF',
    accentOrange: emberOrange,
    accentOrangeSoft: '#FFE1C7',
    accentBlue: '#4EA6FF',
    accentBlueSoft: '#D2E9FF',
    tabIconDefault: '#9A8D7E',
    tabIconSelected: emberOrange,
    border: '#D2C1AE',
    borderSubtle: '#D2C1AE',
    card: '#F5E7D7',
    error: '#DC3545',
    success: '#A67C52',
    warning: '#D97706',
    glow: emberOrange + '30',
    glowBlue: '#4EA6FF' + '30',
    shareTrayBg: 'rgba(240,240,242,0.94)',
    shareTrayBorder: 'rgba(0,0,0,0.1)',
    statsTickerBg: '#DCCAB8',
  },
};

export const FOCUS_AREA_COLORS: Record<string, string> = {
  communication: '#60A5FA',
  trust: '#F97316',
  play: '#FBBF24',
  intimacy: '#EF4444',
  conflict: '#60A5FA',
  gratitude: '#34D399',
  growth: '#4ADE80',
  boundaries: '#F97316',
  desire: '#EF4444',
  intention: '#FBBF24',
};

export const THEME_TAG_COLORS: Record<string, { background: string; text: string; border: string }> = {
  Communication: { background: '#D4E4FF', text: '#2563EB', border: '#60A5FA' },
  Gratitude: { background: '#D1FAE5', text: '#059669', border: '#34D399' },
  'Conflict / Repair': { background: '#D4E4FF', text: '#2563EB', border: '#60A5FA' },
  Conflict: { background: '#D4E4FF', text: '#2563EB', border: '#60A5FA' },
  Repair: { background: '#FEF3C7', text: '#B45309', border: '#FBBF24' },
  'Self-Love': { background: '#FCE7F3', text: '#BE185D', border: '#F472B6' },
  Boundaries: { background: '#FFEDD5', text: '#C2410C', border: '#F97316' },
  Curiosity: { background: '#E9D5FF', text: '#7C3AED', border: '#A78BFA' },
  'Thoughtful / Emotional Depth': { background: '#E5E7EB', text: '#6B7280', border: '#9CA3AF' },
  'Deep Talk': { background: '#E5E7EB', text: '#6B7280', border: '#9CA3AF' },
  Intimacy: { background: '#FFE4E6', text: '#DC2626', border: '#EF4444' },
  Connection: { background: '#D4E4FF', text: '#2563EB', border: '#60A5FA' },
  Reflection: { background: '#E5E7EB', text: '#6B7280', border: '#9CA3AF' },
  Acknowledgment: { background: '#D1FAE5', text: '#059669', border: '#34D399' },
  Growth: { background: '#DCFCE7', text: '#16A34A', border: '#4ADE80' },
  Partnership: { background: '#D4E4FF', text: '#2563EB', border: '#60A5FA' },
  Progress: { background: '#DCFCE7', text: '#16A34A', border: '#4ADE80' },
  Courage: { background: '#FFEDD5', text: '#C2410C', border: '#F97316' },
  Vulnerability: { background: '#E5E7EB', text: '#6B7280', border: '#9CA3AF' },
  Presence: { background: '#E5E7EB', text: '#6B7280', border: '#9CA3AF' },
  'Daily Practice': { background: '#FEF3C7', text: '#B45309', border: '#FBBF24' },
  'Weekly Practice': { background: '#FEF3C7', text: '#B45309', border: '#FBBF24' },
  'Monthly Practice': { background: '#FEF3C7', text: '#B45309', border: '#FBBF24' },
  Appreciation: { background: '#D1FAE5', text: '#059669', border: '#34D399' },
  Surprise: { background: '#FCE7F3', text: '#BE185D', border: '#F472B6' },
  Alignment: { background: '#E9D5FF', text: '#7C3AED', border: '#A78BFA' },
  Love: { background: '#FCE7F3', text: '#BE185D', border: '#F472B6' },
  Effort: { background: '#EDE6D9', text: '#78716C', border: '#A8A29E' },
  Playfulness: { background: '#FEF3C7', text: '#B45309', border: '#FBBF24' },
  Authenticity: { background: '#E9D5FF', text: '#7C3AED', border: '#A78BFA' },
  Joy: { background: '#FEF3C7', text: '#B45309', border: '#FBBF24' },
  Commitment: { background: '#EDE6D9', text: '#78716C', border: '#A8A29E' },
  Resilience: { background: '#DCFCE7', text: '#16A34A', border: '#4ADE80' },
  Choice: { background: '#E9D5FF', text: '#7C3AED', border: '#A78BFA' },
  Worth: { background: '#FCE7F3', text: '#BE185D', border: '#F472B6' },
  Trust: { background: '#FFEDD5', text: '#C2410C', border: '#F97316' },
  Desire: { background: '#FFE4E6', text: '#DC2626', border: '#EF4444' },
};

export function getThemeTagColor(tag: string): { background: string; text: string; border: string } {
  const normalized = tag.trim();
  if (THEME_TAG_COLORS[normalized]) {
    return THEME_TAG_COLORS[normalized];
  }
  return { background: '#E5E7EB', text: '#6B7280', border: '#9CA3AF' };
}

export const TAG_COLORS_LIGHT = {
  communication: '#D4E4FF',
  trust: '#E3DBFF',
  intimacy: '#FFD7EC',
  growth: '#DFF4D3',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const NOTEBOOK_CATEGORY_COLORS = {
  dark: {
    notes: {
      background: '#FF6B35' + '15',
      border: '#FF6B35',
      pill: '#FF6B35',
    },
    journal: {
      background: '#10B981' + '15',
      border: '#10B981',
      pill: '#10B981',
    },
    love_letter: {
      background: '#60A5FA' + '15',
      border: '#60A5FA',
      pill: '#60A5FA',
    },
    poems: {
      background: '#EF4444' + '15',
      border: '#EF4444',
      pill: '#EF4444',
    },
  },
  light: {
    notes: {
      background: '#FFDECC',
      border: '#FF6B35',
      pill: '#FF6B35',
    },
    journal: {
      background: '#D1FAE5',
      border: '#10B981',
      pill: '#10B981',
    },
    love_letter: {
      background: '#D4E4FF',
      border: '#60A5FA',
      pill: '#60A5FA',
    },
    poems: {
      background: '#FFEDD5',
      border: '#EF4444',
      pill: '#EF4444',
    },
  },
};
