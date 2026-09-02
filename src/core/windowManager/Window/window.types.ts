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

export type WindowLayoutMode = 'floating' | 'maximized' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface WindowBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

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
  isClosing?: boolean;
  layoutMode?: WindowLayoutMode;
  prevBounds?: WindowBounds;
}

export interface WindowProps {
  windowData: WindowData;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onSnap: (id: string, mode: WindowLayoutMode) => void;
}

export interface WindowHeaderProps {
  title: string;
  onDoubleClick: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export interface WindowContentProps {
  windowData: WindowData;
  onFocus: () => void;
}
