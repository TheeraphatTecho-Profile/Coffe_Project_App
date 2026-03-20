// Legacy exports for backward compatibility
// @deprecated - Use useTheme hook instead
import { lightTheme } from '../theme/theme';
export const COLORS = lightTheme.colors;
export const FONTS = lightTheme.typography;
export const SPACING = lightTheme.spacing;
export const RADIUS = lightTheme.radius;
export const SHADOWS = lightTheme.shadows;
export const ANIMATIONS = lightTheme.animations;

// New theme system exports
export { useTheme, ThemeProvider, useColors, useSpacing, useTypography, useAnimations } from '../theme/ThemeProvider';
export type { Theme, ThemeMode } from '../theme/types';
