import React from 'react';
import type { AppManifest, AppRegistryEntry } from './app.types';

// Eagerly loaded for critical system apps
import Personalization from '../../apps/personalization/personalization';
import Settings from '../../apps/settings/settings';

// Lazy-loaded components for non-critical apps (code splitting)
const LazyDevZone = React.lazy(() => import('../../apps/devzone/devzone'));
const LazyLinuxMode = React.lazy(() => import('../../apps/linux-mode/linuxmode'));
const LazyMPlayer = React.lazy(() => import('../../apps/mplayer/mplayer'));
const LazyWinSync = React.lazy(() => import('../../apps/winsync/winsync'));
const LazyKDialer = React.lazy(() => import('../../apps/kdialer/kdialer'));
const LazyToolsApp = React.lazy(() => import('../../apps/tools/toolsapp'));

const APP_REGISTRY: Record<string, AppManifest> = {
  settings: {
    id: 'settings',
    name: 'Settings',
    description: 'System settings and configuration',
    category: 'system',
    isSystemApp: true,
    singleInstance: true,
    component: Settings,
    defaultSize: { width: 400, height: 500 },
  },

  personalization: {
    id: 'personalization',
    name: 'Personalization',
    description: 'Customize wallpaper and accent colors',
    category: 'system',
    isSystemApp: true,
    component: Personalization,
    defaultSize: { width: 650, height: 600 },
  },

  google: {
    id: 'google',
    name: 'Google',
    description: 'Google search and services',
    category: 'internet',
    defaultSize: { width: 400, height: 500 },
    src: 'https://next-gooogle.vercel.app/',
  },

  facebook: {
    id: 'facebook',
    name: 'Facebook',
    description: 'Social media platform',
    category: 'internet',
    defaultSize: { width: 400, height: 500 },
    src: 'https://clonedbook.vercel.app/',
  },

  bing: {
    id: 'bing',
    name: 'Bing',
    description: 'Microsoft Bing search',
    category: 'internet',
    defaultSize: { width: 400, height: 500 },
    src: 'https://www.bing.com/?q=something',
  },

  calculator: {
    id: 'calculator',
    name: 'Calculator',
    description: 'Online calculator',
    category: 'utilities',
    defaultSize: { width: 400, height: 500 },
    src: 'https://www.calculator.net',
  },

  mplayer: {
    id: 'mplayer',
    name: 'MPlayer',
    description: 'Music player',
    category: 'media',
    component: LazyMPlayer,
    defaultSize: { width: 700, height: 600 },
  },

  linuxmode: {
    id: 'linuxmode',
    name: 'Linux Mode Terminal',
    description: 'Simulated Linux terminal',
    category: 'tools',
    component: LazyLinuxMode,
    defaultSize: { width: 700, height: 500 },
  },

  devzone: {
    id: 'devzone',
    name: 'DevZone',
    description: 'Developer tools and utilities',
    category: 'tools',
    component: LazyDevZone,
    defaultSize: { width: 800, height: 600 },
  },

  winsync: {
    id: 'winsync',
    name: 'WinSync',
    description: 'Windows synchronization tools',
    category: 'tools',
    component: LazyWinSync,
    defaultSize: { width: 800, height: 600 },
  },

  kdialer: {
    id: 'kdialer',
    name: 'KDialer',
    description: 'Phone dialer application',
    category: 'utilities',
    component: LazyKDialer,
    defaultSize: { width: 450, height: 650 },
  },

  toolsapp: {
    id: 'toolsapp',
    name: 'Tools',
    description: 'System tools collection',
    category: 'tools',
    component: LazyToolsApp,
    defaultSize: { width: 800, height: 650 },
  },
};

export function getApp(appId: string): AppManifest | undefined {
  return APP_REGISTRY[appId];
}

export function getAllApps(): AppManifest[] {
  return Object.values(APP_REGISTRY);
}

export function getAppsByCategory(category: AppManifest['category']): AppManifest[] {
  return Object.values(APP_REGISTRY).filter(app => app.category === category);
}

export function isAppRegistered(appId: string): boolean {
  return appId in APP_REGISTRY;
}

export function getRegisteredAppIds(): string[] {
  return Object.keys(APP_REGISTRY);
}

export function getSystemApps(): AppManifest[] {
  return Object.values(APP_REGISTRY).filter(app => app.isSystemApp);
}

export function getUserApps(): AppManifest[] {
  return Object.values(APP_REGISTRY).filter(app => !app.isSystemApp);
}

export function searchApps(query: string): AppManifest[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(APP_REGISTRY).filter(
    app =>
      app.name.toLowerCase().includes(lowerQuery) ||
      app.description?.toLowerCase().includes(lowerQuery) ||
      app.id.toLowerCase().includes(lowerQuery)
  );
}

export function getRegistryEntries(): AppRegistryEntry[] {
  return Object.values(APP_REGISTRY).map(app => ({
    ...app,
    isRegistered: true,
  }));
}
