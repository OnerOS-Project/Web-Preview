import React from 'react';
import type { WindowData, WindowSize } from './windowManager.types';

import Personalization from '../../pages/Personalization/personalization.jsx';
import LinuxMode from '../../pages/LinuxMode/linuxmode.jsx';
import DevZone from '../../pages/DevZone/devzone.jsx';
import WinSync from '../../pages/WinSync/winsync.jsx';
import KDialer from '../../pages/KDialer/kdialer.jsx';
import MPlayer from '../../pages/MPlayer/mplayer.jsx';
import ToolsApp from '../../pages/ToolsApp/toolsapp.jsx';

interface AppConfig {
  title: string;
  size: WindowSize;
  type?: 'iframe' | 'embed' | 'internal-component';
  component?: React.ComponentType<any>;
  src?: string;
}

const APP_REGISTRY: Record<string, AppConfig> = {
  settings: {
    title: 'Settings',
    size: { width: 400, height: 500 },
    src: window.location.href + 'internal/app/settings',
  },
  personalization: {
    title: 'Personalization',
    size: { width: 650, height: 600 },
    type: 'internal-component',
    component: Personalization,
  },
  linuxmode: {
    title: 'Linux Mode Terminal',
    size: { width: 700, height: 500 },
    type: 'internal-component',
    component: LinuxMode,
  },
  devzone: {
    title: 'DevZone',
    size: { width: 800, height: 600 },
    type: 'internal-component',
    component: DevZone,
  },
  winsync: {
    title: 'WinSync',
    size: { width: 800, height: 600 },
    type: 'internal-component',
    component: WinSync,
  },
  kdialer: {
    title: 'KDialer',
    size: { width: 450, height: 650 },
    type: 'internal-component',
    component: KDialer,
  },
  mplayer: {
    title: 'MPlayer',
    size: { width: 700, height: 600 },
    type: 'internal-component',
    component: MPlayer,
  },
  toolsapp: {
    title: 'Tools',
    size: { width: 800, height: 650 },
    type: 'internal-component',
    component: ToolsApp,
  },
  calculator: {
    title: 'Calculator',
    size: { width: 400, height: 500 },
    src: 'https://www.calculator.net',
  },
  google: {
    title: 'Google',
    size: { width: 400, height: 500 },
    src: 'https://next-gooogle.vercel.app/',
  },
  facebook: {
    title: 'Facebook',
    size: { width: 400, height: 500 },
    src: 'https://clonedbook.vercel.app/',
  },
  bing: {
    title: 'Bing',
    size: { width: 400, height: 500 },
    src: 'https://www.bing.com/?q=something',
  },
};

export function createWindowData(appName: string): WindowData | null {
  const config = APP_REGISTRY[appName];

  if (config) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: config.title,
      size: config.size,
      type: config.type,
      component: config.component,
      src: config.src,
    };
  }

  // Default: search for the app name
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: appName.charAt(0).toUpperCase() + appName.slice(1).toLowerCase(),
    size: { width: 400, height: 500 },
    src: `https://bing.com?q=${appName}`,
  };
}

export function getRegisteredApps(): string[] {
  return Object.keys(APP_REGISTRY);
}
