export interface Lead {
  id: string;
  name: string;
  url: string;
  rating?: string;
  issue: string;
  action: string;
  description: string;
}

export interface SearchState {
  isSearching: boolean;
  leads: Lead[];
  rawText: string;
  groundingSources: Array<{
    title: string;
    url: string;
  }>;
  error: string | null;
}

export type SearchParams = {
  location: string;
  niche: string;
};