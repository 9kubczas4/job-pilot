export type JobSuggestionKind = 'title' | 'company' | 'skill' | 'keyword';

export interface JobSearchSuggestion {
  id: string;
  label: string;
  sublabel?: string;
  kind: JobSuggestionKind;
  value: string;
}

export interface LocationSearchSuggestion {
  id: string;
  label: string;
  city: string;
  latitude: number;
  longitude: number;
}

export const SEARCH_RADIUS_OPTIONS_KM = [10, 25, 50, 100, 200] as const;
export const DEFAULT_SEARCH_RADIUS_KM = 25;
