export const CATEGORY_STYLES = {
  Play: {
    label: 'Play',
    color: '#FBBF24',
  },
  Deep: {
    label: 'Deep',
    color: '#3B82F6',
  },
  Romantic: {
    label: 'Romantic',
    color: '#F472B6',
  },
  Competitive: {
    label: 'Competitive',
    color: '#10B981',
  },
  Seasonal: {
    label: 'Seasonal',
    color: '#F97316',
  },
} as const;

export type CategoryType = keyof typeof CATEGORY_STYLES;

export const getCategoryStyle = (category: string): { label: string; color: string } => {
  const normalized = category.toLowerCase();
  
  switch (normalized) {
    case 'play':
    case 'fun':
      return CATEGORY_STYLES.Play;
    case 'deep':
      return CATEGORY_STYLES.Deep;
    case 'romantic':
      return CATEGORY_STYLES.Romantic;
    case 'competitive':
      return CATEGORY_STYLES.Competitive;
    case 'seasonal':
      return CATEGORY_STYLES.Seasonal;
    default:
      return { label: category, color: '#9CA3AF' };
  }
};
