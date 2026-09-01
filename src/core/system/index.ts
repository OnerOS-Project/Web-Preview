export type { TopBarConfig } from './topbar/topbar.types';
export type { BottomBarConfig } from './bottombar/bottombar.types';
export { TopBar } from './topbar';
export { BottomBar } from './bottombar';

// Layout types
export type { ScreenEdge, LayoutMode, SystemLayoutPreferences } from './layout';
export { DEFAULT_LAYOUT_PREFERENCES, EDGE_CSS_CLASSES } from './layout';

// Appearance system
export {
  THEMES,
  ALL_TASKBAR_CLASSES,
  ALL_BODY_CLASSES,
  DEFAULT_THEME_ID,
  FALLBACK_THEME_ID,
  getThemeById,
  validateThemeId,
  getNextThemeId,
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

export type { ThemeEntry, WallpaperType } from './appearance';

// System surfaces
export {
  Taskbar,
  StartMenu,
  Clock,
  AppSwitcher,
  SystemBar,
  SystemBarLeft,
  SystemBarCenter,
  SystemBarRight,
} from './surfaces';

export type {
  TaskbarProps,
  StartMenuProps,
  ClockProps,
  AppSwitcherProps,
  SystemBarProps,
  SystemBarSlotProps,
} from './surfaces';
