/**
 * Screen edge positions for system surfaces.
 * Used by Taskbar, future TopBar, and other system UI elements.
 */
export type ScreenEdge = 'top' | 'right' | 'bottom' | 'left';

/**
 * Layout mode for system surfaces.
 * - 'adaptive': System automatically positions elements
 * - 'custom': User has custom positioning preferences
 */
export type LayoutMode = 'adaptive' | 'custom';

/**
 * System layout preferences for future configuration.
 */
export interface SystemLayoutPreferences {
  mode: LayoutMode;
  taskbarPosition: ScreenEdge;
}

/**
 * Default layout preferences matching current v2.2 behavior.
 */
export const DEFAULT_LAYOUT_PREFERENCES: SystemLayoutPreferences = {
  mode: 'adaptive',
  taskbarPosition: 'bottom',
};

/**
 * CSS class names for screen edge positioning.
 * Maps ScreenEdge values to CSS class suffixes.
 */
export const EDGE_CSS_CLASSES: Record<ScreenEdge, string> = {
  top: 'edge-top',
  right: 'edge-right',
  bottom: 'edge-bottom',
  left: 'edge-left',
} as const;
