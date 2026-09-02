/**
 * Icon Resolver
 *
 * Single source of truth for resolving AppManifest icon strings
 * to FontAwesome IconProp objects. Used by Taskbar, AppSwitcher,
 * StartMenu, and any other surface that displays app icons.
 */

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faGear, faPalette, faGlobe, faMagnifyingGlass,
  faCalculator, faMusic, faTerminal, faCode, faRotate,
  faPhone, faScrewdriverWrench, faWindowRestore,
  faStore, faFilm, faImage, faTv,
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';

const ICON_MAP: Record<string, IconProp> = {
  'fa-gear': faGear,
  'fa-palette': faPalette,
  'fa-globe': faGlobe,
  'fa-facebook': faFacebook,
  'fa-magnifying-glass': faMagnifyingGlass,
  'fa-calculator': faCalculator,
  'fa-music': faMusic,
  'fa-terminal': faTerminal,
  'fa-code': faCode,
  'fa-rotate': faRotate,
  'fa-phone': faPhone,
  'fa-screwdriver-wrench': faScrewdriverWrench,
  'fa-store': faStore,
  'fa-film': faFilm,
  'fa-image': faImage,
  'fa-tv': faTv,
};

const DEFAULT_ICON: IconProp = faWindowRestore;

/**
 * Resolve an icon string from AppManifest to a FontAwesome IconProp.
 * Returns a safe fallback if the icon string is not found.
 */
export function resolveAppIcon(iconString?: string | null): IconProp {
  if (!iconString) return DEFAULT_ICON;
  return ICON_MAP[iconString] || DEFAULT_ICON;
}

/**
 * Resolve an icon with a specific fallback.
 */
export function resolveAppIconWithFallback(
  iconString?: string | null,
  fallback: IconProp = DEFAULT_ICON
): IconProp {
  if (!iconString) return fallback;
  return ICON_MAP[iconString] || fallback;
}
