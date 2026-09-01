/**
 * Appearance Module — Public API
 *
 * Single import point for all appearance operations.
 */

export {
  THEMES,
  ALL_TASKBAR_CLASSES,
  ALL_BODY_CLASSES,
  DEFAULT_THEME_ID,
  FALLBACK_THEME_ID,
  getThemeById,
  validateThemeId,
  getNextThemeId,
} from './themeRegistry';

export type { ThemeEntry } from './themeRegistry';

export {
  applyThemeToDOM,
  setTheme,
  getStoredThemeId,
  cycleTheme,
  applyWallpaper,
  persistWallpaper,
  restoreWallpaper,
  resetAppearance,
  restoreAppearance,
  applyAccentColor,
  getCurrentAccentColor,
} from './appearance';

export type { WallpaperType } from './appearance';
