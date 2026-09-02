export type SearchResultType = 'app' | 'setting';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  icon?: string;
  action: () => void;
}

export interface SearchResultGroup {
  label: string;
  results: SearchResult[];
}
