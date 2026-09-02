export interface SettingEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  appId: string;
}

export const SETTINGS_REGISTRY: SettingEntry[] = [
  { id: 'theme', title: 'Change Theme', description: 'Switch between desktop themes', icon: 'fa-palette', keywords: ['theme', 'dark mode', 'light mode', 'appearance', 'look'], appId: 'personalization' },
  { id: 'accent', title: 'Accent Color', description: 'Customize the system accent color', icon: 'fa-palette', keywords: ['accent', 'color', 'highlight', 'brand'], appId: 'personalization' },
  { id: 'wallpaper', title: 'Change Wallpaper', description: 'Set your desktop wallpaper', icon: 'fa-image', keywords: ['wallpaper', 'background', 'desktop', 'wall paper'], appId: 'personalization' },
  { id: 'personalization', title: 'Personalization', description: 'Customize wallpaper and accent colors', icon: 'fa-palette', keywords: ['personalization', 'customize', 'appearance', 'settings'], appId: 'personalization' },
  { id: 'system-settings', title: 'System Settings', description: 'System configuration and preferences', icon: 'fa-gear', keywords: ['settings', 'system', 'configuration', 'preferences'], appId: 'settings' },
  { id: 'about', title: 'About OnerOS', description: 'View system information', icon: 'fa-info-circle', keywords: ['about', 'version', 'info', 'system info'], appId: 'settings' },
];

export function searchSettings(query: string): SettingEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return SETTINGS_REGISTRY.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.keywords.some(k => k.includes(q))
  );
}
