/**
 * Taskbar Preferences
 *
 * Manages pinned application IDs for the Taskbar.
 * Stores only app IDs — all metadata comes from App Registry.
 */

import { isAppRegistered } from '../../apps';

const STORAGE_KEY = 'os_pinned_apps';

export const DEFAULT_PINNED_APPS: readonly string[] = [
  'google',
  'facebook',
  'bing',
];

/**
 * Load pinned app IDs from localStorage.
 * Falls back to defaults if missing or invalid.
 */
export function loadPinnedApps(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_PINNED_APPS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_PINNED_APPS];
    return validatePinnedApps(parsed);
  } catch {
    return [...DEFAULT_PINNED_APPS];
  }
}

/**
 * Save pinned app IDs to localStorage.
 */
export function savePinnedApps(appIds: string[]): void {
  const validated = validatePinnedApps(appIds);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
}

/**
 * Validate pinned app IDs:
 * - Remove unknown app IDs
 * - Remove duplicates (keep first occurrence)
 * - Preserve ordering
 * - Fall back to defaults if result is empty
 */
export function validatePinnedApps(appIds: string[]): string[] {
  const seen = new Set<string>();
  const valid: string[] = [];

  for (const id of appIds) {
    if (isAppRegistered(id) && !seen.has(id)) {
      seen.add(id);
      valid.push(id);
    }
  }

  return valid.length > 0 ? valid : [...DEFAULT_PINNED_APPS];
}

/**
 * Pin an app to the taskbar.
 */
export function pinApp(appId: string): string[] {
  if (!isAppRegistered(appId)) return loadPinnedApps();
  const current = loadPinnedApps();
  if (current.includes(appId)) return current;
  const updated = [...current, appId];
  savePinnedApps(updated);
  return updated;
}

/**
 * Unpin an app from the taskbar.
 */
export function unpinApp(appId: string): string[] {
  const current = loadPinnedApps();
  const updated = current.filter(id => id !== appId);
  savePinnedApps(updated);
  return updated;
}

/**
 * Check if an app is pinned.
 */
export function isPinned(appId: string): boolean {
  return loadPinnedApps().includes(appId);
}
