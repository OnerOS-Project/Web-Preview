import React from 'react';

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
