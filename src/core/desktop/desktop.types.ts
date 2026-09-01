import React from 'react';
import type { ScreenEdge } from '../system/layout';

export type DesktopTheme = 'modern' | 'centered' | 'win95' | 'winxp' | 'macos' | 'ubuntu';

export interface DesktopConfig {
  theme: DesktopTheme;
  wallpaperUrl?: string;
  wallpaperType: 'image' | 'color';
  wallpaperColor?: string;
  accentColor?: string;
}

export interface DesktopLayerProps {
  children: React.ReactNode;
  zIndex?: number;
}

export interface DesktopRuntimeProps {
  children?: React.ReactNode;
  config?: Partial<DesktopConfig>;
}

export interface WindowManagerContext {
  windows: any[];
  openWindow: (appId: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: any) => void;
}
