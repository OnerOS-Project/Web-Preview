export const WINDOW_DEFAULTS = {
  MIN_WIDTH: 152,
  MIN_HEIGHT: 170,
  DEFAULT_WIDTH: 520,
  DEFAULT_HEIGHT: 500,
  BORDER_WIDTH: 6,
  Z_BASE: 100,
  Z_ACTIVE: 100,
  Z_MOVED: 500,
  Z_SWITCHER: 5000,
  INITIAL_X: 50,
  INITIAL_Y: 50,
  VIEWPORT_MARGIN: 20,
} as const;

export const WINDOW_ACTIONS = {
  CLOSE: 'close',
  MINIMIZE: 'minimize',
  MAXIMIZE: 'maximize',
  FOCUS: 'focus',
} as const;

export const RESIZE_EDGES = {
  left: true,
  right: true,
  bottom: true,
} as const;

export const WINDOW_CLASSES = {
  WINDOW: 'window',
  ACTIVE: 'active',
  MAXIMIZED: 'maximized',
  BORDER: 'border-window',
  DRAGGABLE: 'draggable-window',
  ACTIONS: 'actions',
  ACTION_MINIMIZE: 'action-minimize',
  ACTION_MAXIMIZE: 'action-maximize',
  ACTION_CLOSE: 'action-close',
} as const;
