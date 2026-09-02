export type SearchResultType = 'app' | 'command';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  icon?: string;
  action: () => void;
}
