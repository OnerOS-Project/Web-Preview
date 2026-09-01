export { default as WindowManager } from './WindowManager';
export { Window, WindowHeader, WindowContent } from './Window';
export type { WindowData, WindowSize, WindowPosition, WindowType, WindowBounds, WindowProps, WindowHeaderProps, WindowContentProps } from './Window';
export type { WindowManagerState, WindowManagerActions, WindowManagerContextValue, WindowManagerProps } from './windowManager.types';
export { createWindowData, getRegisteredApps, isAppAvailable } from './windowManager.utils';
export * as WINDOW from './Window/window.constants';
