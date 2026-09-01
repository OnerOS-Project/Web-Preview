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
  appId?: string;
  icon?: string;
  minSize?: WindowSize;
  zIndex?: number;
  isFocused?: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  isOpen?: boolean;
}

export interface WindowManagerState {
  windows: WindowData[];
}

export interface WindowManagerActions {
  openWindow: (appName: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowData>) => void;
}

export interface WindowManagerContextValue extends WindowManagerState, WindowManagerActions {}

export interface WindowManagerProps {
  children: (props: {
    windows: WindowData[];
    openWindow: (appName: string) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    updateWindow: (id: string, updates: Partial<WindowData>) => void;
  }) => React.ReactNode;
}
