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

export {
  DEFAULT_SEARCH_RADIUS_MI,
  SEARCH_RADIUS_OPTIONS_MI,
  buildHeaderSearchQueryParams,
} from './header-search-query.utils';
