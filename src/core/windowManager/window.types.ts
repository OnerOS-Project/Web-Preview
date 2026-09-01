import React from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export type WindowType = 'iframe' | 'embed' | 'internal-component';

export interface WindowData {
  id: string;
  title: string;
  size: WindowSize;
  src?: string;
  type?: WindowType;
  component?: React.ComponentType<any>;
  position?: WindowPosition;
  isMinimized?: boolean;
  isMaximized?: boolean;
  zIndex?: number;
}

export interface WindowProps {
  windowData: WindowData;
  onClose: (id: string) => void;
}

export interface WindowManagerState {
  windows: WindowData[];
  activeWindowId: string | null;
}

export interface WindowManagerActions {
  openWindow: (data: Omit<WindowData, 'id'>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
}
