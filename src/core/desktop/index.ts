// Core desktop components
export { default as Desktop } from './Desktop';
export { default as DesktopLayer } from './DesktopLayer';
export { default as DesktopRuntime } from './DesktopRuntime';

// Layer components
export {
  BackgroundLayer,
  DesktopContentLayer,
  WindowLayer,
  SystemSurfaceLayer,
  OverlayLayer,
} from './layers';

// Types
export type {
  DesktopTheme,
  DesktopConfig,
  DesktopLayerProps,
  DesktopRuntimeProps,
  WindowManagerContext,
} from './desktop.types';

// Constants
export { DEFAULT_DESKTOP_CONFIG, LAYER_Z_INDEX, DESKTOP_CLASSES } from './desktop.constants';
