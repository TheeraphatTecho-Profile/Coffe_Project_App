import { lightTheme } from './theme';

// Re-export legacy constants from lightTheme for backward compatibility
export const COLORS = lightTheme.colors;
export const FONTS = lightTheme.typography;
export const SPACING = lightTheme.spacing;
export const RADIUS = lightTheme.radius;
export const SHADOWS = lightTheme.shadows;
export const ANIMATIONS = lightTheme.animations;

export { lightTheme, darkTheme } from './theme';
export { useTheme, ThemeProvider, useColors, useSpacing, useTypography, useAnimations } from './ThemeProvider';
export type { Theme, ThemeMode } from './types';
