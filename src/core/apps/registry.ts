import type { AppManifest, AppRegistryEntry } from './app.types';

// Application imports - these remain in src/pages/ for now
import Personalization from '../../pages/Personalization/personalization.jsx';
import LinuxMode from '../../pages/LinuxMode/linuxmode.jsx';
import DevZone from '../../pages/DevZone/devzone.jsx';
import WinSync from '../../pages/WinSync/winsync.jsx';
import KDialer from '../../pages/KDialer/kdialer.jsx';
import MPlayer from '../../pages/MPlayer/mplayer.jsx';
import ToolsApp from '../../pages/ToolsApp/toolsapp.jsx';

// Application Registry - single source of truth for all OnerOS applications
const APP_REGISTRY: Record<string, AppManifest> = {
  // System Apps
  settings: {
    id: 'settings',
    name: 'Settings',
    description: 'System settings and configuration',
    category: 'system',
    isSystemApp: true,
    singleInstance: true,
    defaultSize: { width: 400, height: 500 },
    src: window.location.href + 'internal/app/settings',
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

  // Internet Apps
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

  // Media Apps
  mplayer: {
    id: 'mplayer',
    name: 'MPlayer',
    description: 'Music player',
    category: 'media',
    component: MPlayer,
    defaultSize: { width: 700, height: 600 },
  },

  // Tools Apps
  linuxmode: {
    id: 'linuxmode',
    name: 'Linux Mode Terminal',
    description: 'Simulated Linux terminal',
    category: 'tools',
    component: LinuxMode,
    defaultSize: { width: 700, height: 500 },
  },

  devzone: {
    id: 'devzone',
    name: 'DevZone',
    description: 'Developer tools and utilities',
    category: 'tools',
    component: DevZone,
    defaultSize: { width: 800, height: 600 },
  },

  winsync: {
    id: 'winsync',
    name: 'WinSync',
    description: 'Windows synchronization tools',
    category: 'tools',
    component: WinSync,
    defaultSize: { width: 800, height: 600 },
  },

  kdialer: {
    id: 'kdialer',
    name: 'KDialer',
    description: 'Phone dialer application',
    category: 'utilities',
    component: KDialer,
    defaultSize: { width: 450, height: 650 },
  },

  toolsapp: {
    id: 'toolsapp',
    name: 'Tools',
    description: 'System tools collection',
    category: 'tools',
    component: ToolsApp,
    defaultSize: { width: 800, height: 650 },
  },
};

// Registry accessor functions

/**
 * Get a single app manifest by ID
 */
export function getApp(appId: string): AppManifest | undefined {
  return APP_REGISTRY[appId];
}

/**
 * Get all registered apps
 */
export function getAllApps(): AppManifest[] {
  return Object.values(APP_REGISTRY);
}

/**
 * Get apps by category
 */
export function getAppsByCategory(category: AppManifest['category']): AppManifest[] {
  return Object.values(APP_REGISTRY).filter(app => app.category === category);
}

/**
 * Check if an app is registered
 */
export function isAppRegistered(appId: string): boolean {
  return appId in APP_REGISTRY;
}

/**
 * Get all registered app IDs
 */
export function getRegisteredAppIds(): string[] {
  return Object.keys(APP_REGISTRY);
}

/**
 * Get system apps only
 */
export function getSystemApps(): AppManifest[] {
  return Object.values(APP_REGISTRY).filter(app => app.isSystemApp);
}

/**
 * Get user apps (non-system apps)
 */
export function getUserApps(): AppManifest[] {
  return Object.values(APP_REGISTRY).filter(app => !app.isSystemApp);
}

/**
 * Search apps by name or description
 */
export function searchApps(query: string): AppManifest[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(APP_REGISTRY).filter(
    app =>
      app.name.toLowerCase().includes(lowerQuery) ||
      app.description?.toLowerCase().includes(lowerQuery) ||
      app.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get registry entries with metadata
 */
export function getRegistryEntries(): AppRegistryEntry[] {
  return Object.values(APP_REGISTRY).map(app => ({
    ...app,
    isRegistered: true,
  }));
}
