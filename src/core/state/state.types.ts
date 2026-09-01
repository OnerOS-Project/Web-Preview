import React from 'react';

export interface AppState {
  isBooted: boolean;
  isStartMenuOpen: boolean;
  isAppSwitcherOpen: boolean;
  themeMode: number;
  windows: WindowState[];
}

export interface WindowState {
  id: string;
  title: string;
  size: { width: number; height: number };
  src?: string;
  type?: 'iframe' | 'embed' | 'internal-component';
  component?: React.ComponentType<any>;
  position?: { x: number; y: number };
  isMinimized?: boolean;
  isMaximized?: boolean;
  zIndex?: number;
}
