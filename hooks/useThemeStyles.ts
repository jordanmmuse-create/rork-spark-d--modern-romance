import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import Colors from '@/constants/colors';

export function useThemeStyles() {
  const theme = useAppStore((state) => state.theme);

  return useMemo(
    () => {
      const colors = Colors[theme];
      const isDark = theme === 'dark';
      return {
        theme,
        colors,
        isDark,
      };
    },
    [theme]
  );
}
