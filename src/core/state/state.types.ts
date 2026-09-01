import type { WindowData } from '../windowManager/Window/window.types';

export interface AppState {
  isBooted: boolean;
  isStartMenuOpen: boolean;
  isAppSwitcherOpen: boolean;
  themeMode: number;
  windows: WindowData[];
}

export type WindowState = WindowData;
