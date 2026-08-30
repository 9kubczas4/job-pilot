export const SEARCH_RADIUS_OPTIONS_KM = [10, 25, 50, 100, 200] as const;
export const DEFAULT_SEARCH_RADIUS_KM = 25;

export function buildHeaderSearchQueryParams(state: {
  searchQuery: string;
  locationQuery: string;
  locationLat?: number;
  locationLng?: number;
  radiusKm: number;
}): Record<string, string> {
  const queryParams: Record<string, string> = {};
  const query = state.searchQuery.trim();
  const location = state.locationQuery.trim();
  const radius = state.radiusKm || DEFAULT_SEARCH_RADIUS_KM;

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
