import type { WindowData } from './Window/window.types';
import { getApp, isAppRegistered, getRegisteredAppIds } from '../apps';

/**
 * Generate a unique window ID
 */
function generateWindowId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create window data from an app ID
 * This is the bridge between the App Registry and WindowManager
 */
export function createWindowData(appId: string): WindowData | null {
  const manifest = getApp(appId);

  if (manifest) {
    return {
      id: generateWindowId(),
      title: manifest.name,
      size: manifest.defaultSize || { width: 400, height: 500 },
      type: manifest.component ? 'internal-component' : undefined,
      component: manifest.component,
      src: manifest.src,
      appId: manifest.id,
      icon: manifest.icon,
      minSize: manifest.minSize,
    };
  }

  // Fallback: create a search window for unknown apps
  return {
    id: generateWindowId(),
    title: appId.charAt(0).toUpperCase() + appId.slice(1).toLowerCase(),
    size: { width: 400, height: 500 },
    src: `https://bing.com?q=${appId}`,
  };
}

/**
 * Get list of all registered app IDs
 */
export function getRegisteredApps(): string[] {
  return getRegisteredAppIds();
}

/**
 * Check if an app ID is registered
 */
export function isAppAvailable(appId: string): boolean {
  return isAppRegistered(appId);
}
