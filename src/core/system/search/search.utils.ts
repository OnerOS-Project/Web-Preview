import { getAllApps } from '../../apps';
import type { SearchResult } from './search.types';

export function searchSystem(query: string, openWindow: (id: string) => void): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  return getAllApps()
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
}
