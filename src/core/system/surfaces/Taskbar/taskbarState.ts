/**
 * Taskbar State Derivation
 *
 * Derives application-level state from WindowManager's window data.
 * No duplicate state — purely computed from windows[] + focusedWindowId.
 */

import { getApp, getRegisteredAppIds } from '../../../apps';
import type { WindowData } from '../../../windowManager/Window/window.types';

export interface TaskbarAppState {
  appId: string;
  name: string;
  icon: string;
  isOpen: boolean;
  isFocused: boolean;
  isMinimized: boolean;
  windowCount: number;
  windowId?: string;
}

/**
 * Derive taskbar application states from WindowManager data.
 *
 * Groups windows by appId, computes per-app visual state,
 * and includes pinned apps (registered but not open).
 */
export function deriveTaskbarStates(
  windows: WindowData[],
  focusedWindowId: string | null | undefined
): TaskbarAppState[] {
  const result: TaskbarAppState[] = [];

  // Group windows by appId
  const appWindows = new Map<string, WindowData[]>();
  for (const win of windows) {
    const appId = win.appId || win.id;
    if (!appWindows.has(appId)) {
      appWindows.set(appId, []);
    }
    appWindows.get(appId)!.push(win);
  }

  // Build state for each registered app
  const registeredIds = getRegisteredAppIds();

  for (const appId of registeredIds) {
    const app = getApp(appId);
    if (!app) continue;

    const wins = appWindows.get(appId) || [];
    const isOpen = wins.length > 0;
    const isFocused = wins.some(w => w.id === focusedWindowId);
    const isMinimized = isOpen && wins.every(w => w.isMinimized);
    const windowCount = wins.length;

    // Find the best window ID for focus/restore actions
    // Prefer focused > most recent > first
    const focusedWin = wins.find(w => w.id === focusedWindowId);
    const nonMinimized = wins.find(w => !w.isMinimized);
    const bestWin = focusedWin || nonMinimized || wins[0];

    result.push({
      appId,
      name: app.name,
      icon: app.icon,
      isOpen,
      isFocused,
      isMinimized,
      windowCount,
      windowId: bestWin?.id,
    });
  }

  return result;
}

/**
 * Get the best window to focus for a given app.
 * Priority: focused window > most recent non-minimized > most recent minimized.
 */
export function getBestWindowForApp(
  appId: string,
  windows: WindowData[],
  focusedWindowId: string | null | undefined
): WindowData | null {
  const appWins = windows.filter(w => (w.appId || w.id) === appId);
  if (appWins.length === 0) return null;

  const focused = appWins.find(w => w.id === focusedWindowId);
  if (focused) return focused;

  const nonMinimized = appWins.find(w => !w.isMinimized);
  if (nonMinimized) return nonMinimized;

  return appWins[appWins.length - 1];
}
