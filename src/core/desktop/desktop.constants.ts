import type { DesktopTheme } from './desktop.types';

/**
 * Default desktop configuration matching v2.2 behavior.
 */
export const DEFAULT_DESKTOP_CONFIG = {
  theme: 'modern' as DesktopTheme,
  wallpaperType: 'image' as const,
};

/**
 * Z-index values for desktop layers.
 * Higher values render on top of lower values.
 */
export const LAYER_Z_INDEX = {
  BACKGROUND: 0,
  DESKTOP_CONTENT: 1,
  WINDOW: 10,
  SYSTEM_SURFACE: 100,
  OVERLAY: 1000,
} as const;

/**
 * CSS class names for desktop components.
 */
export const DESKTOP_CLASSES = {
  RUNTIME: 'os-desktop-runtime',
  BACKGROUND: 'os-background',
  DESKTOP_CONTENT: 'os-desktop-content',
  WINDOW_FRAME: 'window-frame',
  SYSTEM_SURFACES: 'os-system-surfaces',
  OVERLAYS: 'os-overlays',
} as const;
