import React, { useState } from 'react';
import type { ThemeColors } from '../components/SystemSettings';

const defaultColors: ThemeColors = {
  primary: '#222831',
  secondary: '#393e46',
  accent: '#00adb5',
};

export function useThemeColors() {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);

  // Update CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
  }, [colors]);

  return [colors, setColors] as const;
}
// Empty file. Ready for new code.
