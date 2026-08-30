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
  DEFAULT_SEARCH_RADIUS_KM,
  SEARCH_RADIUS_OPTIONS_KM,
  buildHeaderSearchQueryParams,
} from './header-search-query.utils';
