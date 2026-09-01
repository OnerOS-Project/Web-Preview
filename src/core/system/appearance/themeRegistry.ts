/**
 * Theme Registry — Single source of truth for all theme data.
 *
 * Every consumer (Personalization, Taskbar, Boot restoration)
 * reads from this registry instead of maintaining duplicate arrays.
 */

export interface ThemeEntry {
  id: number;
  name: string;
  taskbarClass: string;
  bodyClass: string;
  preview: string;
  cursor?: string;
}

const WIN95_CURSOR = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABNSURBVCiRY/j//z8DGYCFgYRQj5q4cePG/4yMjAwUaWRkZPz//z/jgQMHyNaIyyA8NpLiHKLdMFo1DAY1DA41DA41DA41DA41DA41DBU1AADTTR0xqm6CzAAAAABJRU5ErkJggg=="), auto';

/**
 * All available themes, ordered by ID.
 * ID 0 = default (Modern).
 * To change the default for new users, update DEFAULT_THEME_ID.
 */
export const THEMES: readonly ThemeEntry[] = [
  { id: 0, name: 'Modern',     taskbarClass: '',                 bodyClass: '',               preview: 'default' },
  { id: 1, name: 'Centered',   taskbarClass: 'center',           bodyClass: '',               preview: 'centered' },
  { id: 2, name: 'Win95',      taskbarClass: 'win95-theme',      bodyClass: 'win95-mode',     preview: 'win95',      cursor: WIN95_CURSOR },
  { id: 3, name: 'WinXP',      taskbarClass: 'winxp-theme',      bodyClass: 'winxp-mode',     preview: 'winxp' },
  { id: 4, name: 'macOS',      taskbarClass: 'macos-theme',      bodyClass: 'macos-mode',     preview: 'macos' },
  { id: 5, name: 'Ubuntu',     taskbarClass: 'ubuntu-theme',     bodyClass: 'ubuntu-mode',    preview: 'ubuntu' },
  { id: 6, name: 'OnerOS 2026', taskbarClass: 'oneros2026-theme', bodyClass: 'oneros2026-mode', preview: 'oneros2026' },
] as const;

/** All taskbar CSS classes that may be applied */
export const ALL_TASKBAR_CLASSES = THEMES.map(t => t.taskbarClass).filter(Boolean);

/** All body CSS classes that may be applied */
export const ALL_BODY_CLASSES = THEMES.map(t => t.bodyClass).filter(Boolean);

/** Default theme for new users (no stored preference) */
export const DEFAULT_THEME_ID = 0;

/** Fallback theme when stored value is invalid */
export const FALLBACK_THEME_ID = 0;

/**
 * Get a theme by ID. Returns the fallback theme if ID is invalid.
 */
export function getThemeById(id: number): ThemeEntry {
  const theme = THEMES.find(t => t.id === id);
  return theme ?? THEMES[FALLBACK_THEME_ID];
}

/**
 * Validate a stored theme ID. Returns the valid ID or the fallback.
 */
export function validateThemeId(id: number): number {
  if (THEMES.some(t => t.id === id)) return id;
  return FALLBACK_THEME_ID;
}

/**
 * Get the next theme ID for cycling (used by Taskbar).
 */
export function getNextThemeId(current: number): number {
  const idx = THEMES.findIndex(t => t.id === current);
  const next = (idx + 1) % THEMES.length;
  return THEMES[next].id;
}
