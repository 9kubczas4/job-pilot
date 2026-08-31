export const SEARCH_RADIUS_OPTIONS_MI = [25, 50, 100, 150, 250] as const;
export const DEFAULT_SEARCH_RADIUS_MI = 50;

export function buildHeaderSearchQueryParams(state: {
  searchQuery: string;
  locationQuery: string;
  locationLat?: number;
  locationLng?: number;
  radiusMi: number;
}): Record<string, string> {
  const queryParams: Record<string, string> = {};
  const query = state.searchQuery.trim();
  const location = state.locationQuery.trim();
  const radius = state.radiusMi || DEFAULT_SEARCH_RADIUS_MI;

  if (query) {
    queryParams['q'] = query;
  }
  if (location) {
    queryParams['location'] = location;
    queryParams['radius'] = String(radius);
    if (state.locationLat != null && state.locationLng != null) {
      queryParams['lat'] = String(state.locationLat);
      queryParams['lng'] = String(state.locationLng);
    }
  }

  return queryParams;
}
