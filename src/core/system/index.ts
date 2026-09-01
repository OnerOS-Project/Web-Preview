export type { TopBarConfig } from './topbar/topbar.types';
export type { BottomBarConfig } from './bottombar/bottombar.types';
export { TopBar } from './topbar';
export { BottomBar } from './bottombar';

// Layout types
export type { ScreenEdge, LayoutMode, SystemLayoutPreferences } from './layout';
export { DEFAULT_LAYOUT_PREFERENCES, EDGE_CSS_CLASSES } from './layout';

// System surfaces
export { Taskbar, StartMenu, Clock, AppSwitcher } from './surfaces';
export type { TaskbarProps, StartMenuProps, ClockProps, AppSwitcherProps } from './surfaces';
