import { getAllApps } from '../../apps';
import { searchSettings } from './searchRegistry';
import type { SearchResult, SearchResultGroup } from './search.types';

export function searchSystem(query: string, openWindow: (id: string) => void): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  const appResults = getAllApps()
    .filter(app =>
      app.name.toLowerCase().includes(q) ||
      app.description?.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q) ||
      app.category?.toLowerCase().includes(q)
    )
    .map(app => ({
      id: app.id,
      type: 'app' as const,
      title: app.name,
      subtitle: app.description,
      icon: app.icon,
      action: () => openWindow(app.id),
    }));

  const settingResults = searchSettings(query).map(s => ({
    id: s.id,
    type: 'setting' as const,
    title: s.title,
    subtitle: s.description,
    icon: s.icon,
    action: () => openWindow(s.appId),
  }));

  return [...appResults, ...settingResults];
}

export function searchSystemGrouped(query: string, openWindow: (id: string) => void): SearchResultGroup[] {
  if (!query.trim()) return [];
  const results = searchSystem(query, openWindow);
  if (results.length === 0) return [];

  const groups: SearchResultGroup[] = [];
  const apps = results.filter(r => r.type === 'app');
  const settings = results.filter(r => r.type === 'setting');

  if (apps.length > 0) groups.push({ label: 'APPLICATIONS', results: apps });
  if (settings.length > 0) groups.push({ label: 'SETTINGS', results: settings });

  return groups;
}
