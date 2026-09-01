// Desktop
export { Desktop, DesktopLayer, DesktopRuntime } from './desktop';
export {
  BackgroundLayer,
  DesktopContentLayer,
  WindowLayer,
  SystemSurfaceLayer,
  OverlayLayer,
} from './desktop/layers';
export type { DesktopTheme, DesktopConfig, DesktopLayerProps, DesktopRuntimeProps } from './desktop';

// Window Manager
export { Window, WindowHeader, WindowContent } from './windowManager';
export type { WindowData, WindowSize, WindowPosition, WindowType, WindowBounds, WindowProps } from './windowManager';

// System
export * from './system';

// State
export * from './state';
