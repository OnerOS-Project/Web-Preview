/**
 * Appearance Service
 *
 * Single entry point for all appearance operations:
 * - Theme selection and application
 * - Accent color management
 * - Wallpaper management
 * - Persistence (localStorage)
 * - Boot restoration
 *
 * This replaces the scattered theme logic in Personalization,
 * Taskbar, and Linux Mode.
 */

import { STORAGE_KEYS } from '../../../constants';
import {
  ALL_TASKBAR_CLASSES,
  ALL_BODY_CLASSES,
  DEFAULT_THEME_ID,
  getThemeById,
  validateThemeId,
  getNextThemeId,
} from './themeRegistry';
import {
  applyAccentColor as setAccentCSS,
  clearInlineAccentStyles,
  resetAccentColor,
  restoreAccentColor,
  removeInjectedAccentStyle,
} from './accent';

// ===== Theme Application =====

/**
 * Apply a theme to the DOM.
 * Handles body classes, taskbar classes, and cursor.
 * Does NOT persist — caller is responsible for persistence.
 */
export function applyThemeToDOM(themeId: number): void {
  const taskbar = document.getElementById('os-taskbar');
  const body = document.body;
  if (!taskbar || !body) return;

  const theme = getThemeById(themeId);

  // Remove all known theme classes
  ALL_TASKBAR_CLASSES.forEach(cls => taskbar.classList.remove(cls));
  ALL_BODY_CLASSES.forEach(cls => body.classList.remove(cls));

  // Apply new theme classes
  if (theme.taskbarClass) taskbar.classList.add(theme.taskbarClass);
  if (theme.bodyClass) body.classList.add(theme.bodyClass);

  // Apply cursor
  body.style.cursor = theme.cursor ?? 'default';
}

/**
 * Set the active theme. Applies to DOM, persists, and sets accent color.
 */
export function setTheme(themeId: number): number {
  const validId = validateThemeId(themeId);
  
  // Apply DOM changes synchronously
  applyThemeToDOM(validId);
  
  // Auto-set accent color to theme default (if theme supports it)
  const theme = getThemeById(validId);
  if (theme.supportsAccentColors) {
    setAccentCSS(theme.accentColor);
  } else {
    // Clear inline accent overrides so theme CSS variables take effect
    clearInlineAccentStyles();
  }

  localStorage.setItem(STORAGE_KEYS.THEME, String(validId));

  // Notify listeners (e.g., DesktopRuntime) of theme change
  window.dispatchEvent(new CustomEvent('fv:theme-changed', { detail: { themeId: validId } }));

  return validId;
}

/**
 * Get the currently stored theme ID (from localStorage).
 */
export function getStoredThemeId(): number {
  const raw = localStorage.getItem(STORAGE_KEYS.THEME);
  if (raw === null) return DEFAULT_THEME_ID;
  return validateThemeId(parseInt(raw, 10));
}

/**
 * Get the next theme ID for cycling.
 */
export function cycleTheme(current: number): number {
  return getNextThemeId(current);
}

// ===== Wallpaper =====

/**
 * Wallpaper types supported.
 */
export type WallpaperType = 'default' | 'color';

/**
 * Apply wallpaper to the desktop background element.
 */
export function applyWallpaper(type: WallpaperType, color?: string): void {
  const background = document.getElementById('os-background');
  if (!background) return;

  if (type === 'default') {
    background.style.backgroundImage = 'url("/public/img/Wallpaper.webp")';
    background.style.backgroundColor = '';
  } else if (type === 'color' && color) {
    background.style.backgroundImage = 'none';
    background.style.backgroundColor = color;
  }
}

/**
 * Persist wallpaper settings.
 */
export function persistWallpaper(type: WallpaperType, color?: string): void {
  if (type === 'default') {
    localStorage.setItem(STORAGE_KEYS.WALLPAPER_TYPE, 'default');
  } else {
    localStorage.setItem(STORAGE_KEYS.WALLPAPER_TYPE, 'color');
    if (color) localStorage.setItem(STORAGE_KEYS.WALLPAPER_COLOR, color);
  }
}

/**
 * Restore wallpaper from localStorage.
 */
export function restoreWallpaper(): { type: WallpaperType; color: string | null } {
  const type = (localStorage.getItem(STORAGE_KEYS.WALLPAPER_TYPE) as WallpaperType) || 'default';
  const color = localStorage.getItem(STORAGE_KEYS.WALLPAPER_COLOR);
  applyWallpaper(type, color || undefined);
  return { type, color };
}

// ===== Full Reset =====

/**
 * Reset all appearance to defaults.
 */
export function resetAppearance(): void {
  // Reset theme
  setTheme(DEFAULT_THEME_ID);

  // Reset accent
  resetAccentColor();

  // Reset wallpaper
  localStorage.removeItem(STORAGE_KEYS.WALLPAPER_TYPE);
  localStorage.removeItem(STORAGE_KEYS.WALLPAPER_COLOR);
  applyWallpaper('default');

  // Clean up any injected style elements
  removeInjectedAccentStyle();

  // Reset menu squares (legacy compatibility)
  const menuSquares = document.querySelectorAll('.menu-square');
  menuSquares.forEach(sq => {
    (sq as HTMLElement).style.removeProperty('background-color');
  });
}

// ===== Boot Restoration =====

/**
 * Restore all appearance settings from localStorage.
 * Called once during boot (Taskbar mount).
 *
 * Returns the restored theme ID.
 */
export function restoreAppearance(): number {
  // Restore theme
  const themeId = getStoredThemeId();
  applyThemeToDOM(themeId);

  // Restore accent color only if theme supports it
  const theme = getThemeById(themeId);
  if (theme.supportsAccentColors) {
    restoreAccentColor();
  } else {
    clearInlineAccentStyles();
    removeInjectedAccentStyle();
  }

  // Restore wallpaper
  restoreWallpaper();

  return themeId;
}

// ===== Re-exports for convenience =====
export { applyAccentColor, getCurrentAccentColor } from './accent';
export { getThemeById, THEMES } from './themeRegistry';
