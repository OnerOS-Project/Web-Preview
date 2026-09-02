import React from 'react';
import type { WindowData, WindowLayoutMode } from './Window/window.types';

export interface WindowManagerState {
  windows: WindowData[];
  focusedWindowId: string | null;
}

export interface WindowManagerActions {
  openWindow: (appName: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowData>) => void;
  snapWindow: (id: string, mode: WindowLayoutMode) => void;
  toggleMaximize: (id: string) => void;
}

export interface WindowManagerContextValue extends WindowManagerState, WindowManagerActions {}

export interface WindowManagerProps {
  children: (props: {
    windows: WindowData[];
    focusedWindowId: string | null;
    openWindow: (appName: string) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    updateWindow: (id: string, updates: Partial<WindowData>) => void;
    snapWindow: (id: string, mode: WindowLayoutMode) => void;
    toggleMaximize: (id: string) => void;
  }) => React.ReactNode;
}
