/**
 * Accent Color System
 *
 * Manages accent color CSS custom properties.
 * Derives semantic variants from a single base color.
 * No runtime style injection — all rendering via CSS variables.
 */

import { STORAGE_KEYS } from '../../../constants';

/** Default accent color */
const DEFAULT_ACCENT = '#47b895';

/**
 * Parse a hex color to RGB components.
 * Returns null if invalid.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

/**
 * Clamp a value between 0 and 255.
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Lighten or darken a hex color by a percentage.
 * Positive percentage = lighten, negative = darken.
 */
function shiftLightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = percent / 100;
  const r = clamp(rgb.r + (255 - rgb.r) * factor);
  const g = clamp(rgb.g + (255 - rgb.g) * factor);
  const b = clamp(rgb.b + (255 - rgb.b) * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Darken a hex color by a percentage.
 */
function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = 1 - percent / 100;
  const r = clamp(rgb.r * factor);
  const g = clamp(rgb.g * factor);
  const b = clamp(rgb.b * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Create an rgba string from a hex color and alpha.
 */
function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Apply accent color as CSS custom properties on :root.
 * Derives hover, active, subtle, and contrast variants.
 * No style element injection.
 */
export function applyAccentColor(color: string): void {
  const body = document.body;

  body.style.setProperty('--color-accent', color);
  body.style.setProperty('--color-accent-dark', darken(color, 15));
  body.style.setProperty('--color-accent-light', shiftLightness(color, 20));
  body.style.setProperty('--color-accent-hover', darken(color, 10));
  body.style.setProperty('--color-accent-active', darken(color, 20));
  body.style.setProperty('--color-accent-subtle', rgba(color, 0.12));
  body.style.setProperty('--color-accent-contrast', '#ffffff');

  body.style.setProperty('--fv-accent', color);
  body.style.setProperty('--fv-accent-hover', darken(color, 10));
  body.style.setProperty('--fv-accent-active', darken(color, 20));
  body.style.setProperty('--fv-accent-subtle', rgba(color, 0.12));
  body.style.setProperty('--fv-accent-contrast', '#ffffff');

  localStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, color);
}

/**
 * Remove any injected accent style elements (legacy cleanup).
 */
export function removeInjectedAccentStyle(): void {
  const existing = document.getElementById('custom-accent-style');
  if (existing) existing.remove();
}

/**
 * Reset accent color to the CSS default and clear localStorage.
 */
export function resetAccentColor(): void {
  const body = document.body;
  body.style.removeProperty('--color-accent');
  body.style.removeProperty('--color-accent-dark');
  body.style.removeProperty('--color-accent-light');
  body.style.removeProperty('--color-accent-hover');
  body.style.removeProperty('--color-accent-active');
  body.style.removeProperty('--color-accent-subtle');
  body.style.removeProperty('--color-accent-contrast');
  body.style.removeProperty('--fv-accent');
  body.style.removeProperty('--fv-accent-hover');
  body.style.removeProperty('--fv-accent-active');
  body.style.removeProperty('--fv-accent-subtle');
  body.style.removeProperty('--fv-accent-contrast');
  localStorage.removeItem(STORAGE_KEYS.ACCENT_COLOR);
  removeInjectedAccentStyle();
}

/**
 * Load saved accent color from localStorage and apply it.
 * Returns the applied color (or null if none was saved).
 */
export function restoreAccentColor(): string | null {
  const saved = localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR);
  if (saved) {
    applyAccentColor(saved);
    removeInjectedAccentStyle();
    return saved;
  }
  return null;
}

/**
 * Get the current accent color from CSS or localStorage.
 */
export function getCurrentAccentColor(): string {
  const stored = localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR);
  if (stored) return stored;
  const computed = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  return computed || DEFAULT_ACCENT;
}
