export type MapDefaultRegion = 'europe' | 'us';

export interface MapLatLng {
  lat: number;
  lng: number;
}

export interface MapDefaultView {
  center: MapLatLng;
  zoom: number;
}

export const US_MAP_DEFAULT_VIEW: MapDefaultView = {
  center: { lat: 39.8283, lng: -98.5795 },
  zoom: 4,
};

export const EUROPE_MAP_DEFAULT_VIEW: MapDefaultView = {
  center: { lat: 54.526, lng: 15.2551 },
  zoom: 4,
};

const EUROPE_BOUNDS = {
  north: 71,
  south: 35,
  west: -25,
  east: 45,
} as const;

export function isLocationInEurope(lat: number, lng: number): boolean {
  return (
    lat >= EUROPE_BOUNDS.south &&
    lat <= EUROPE_BOUNDS.north &&
    lng >= EUROPE_BOUNDS.west &&
    lng <= EUROPE_BOUNDS.east
  );
}

export function resolveMapRegionFromCoords(lat: number, lng: number): MapDefaultRegion {
  return isLocationInEurope(lat, lng) ? 'europe' : 'us';
}

export function getMapDefaultView(region: MapDefaultRegion = 'us'): MapDefaultView {
  return region === 'europe' ? EUROPE_MAP_DEFAULT_VIEW : US_MAP_DEFAULT_VIEW;
}
