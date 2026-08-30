import { isLocationInEurope, WORLD_MAP_VIEW, type MapLatLng } from './map-default-region';

export interface MapGeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type MapResultsViewport =
  | { kind: 'world'; center: MapLatLng; zoom: number }
  | { kind: 'bounds'; bounds: MapGeoBounds }
  | { kind: 'default-region' };

const MIN_POINTS_FOR_BOUNDS = 1;
const WIDE_LAT_SPAN_DEG = 35;
const WIDE_LNG_SPAN_DEG = 60;

export function resolveMapResultsViewport(locations: MapLatLng[]): MapResultsViewport {
  if (locations.length < MIN_POINTS_FOR_BOUNDS) {
    return { kind: 'default-region' };
  }

  if (spansWideGeography(locations)) {
    return {
      kind: 'world',
      center: WORLD_MAP_VIEW.center,
      zoom: WORLD_MAP_VIEW.zoom,
    };
  }

  return {
    kind: 'bounds',
    bounds: computeGeoBounds(locations),
  };
}

export function spansWideGeography(locations: MapLatLng[]): boolean {
  if (locations.length < 2) {
    return false;
  }

  const bounds = computeGeoBounds(locations);
  const latSpan = bounds.north - bounds.south;
  const lngSpan = normalizeLongitudeSpan(bounds.west, bounds.east);

  if (latSpan >= WIDE_LAT_SPAN_DEG || lngSpan >= WIDE_LNG_SPAN_DEG) {
    return true;
  }

  let hasEurope = false;
  let hasNonEurope = false;

  for (const location of locations) {
    if (isLocationInEurope(location.lat, location.lng)) {
      hasEurope = true;
    } else {
      hasNonEurope = true;
    }

    if (hasEurope && hasNonEurope) {
      return true;
    }
  }

  return false;
}

export function computeGeoBounds(locations: MapLatLng[]): MapGeoBounds {
  let north = -90;
  let south = 90;
  let west = 180;
  let east = -180;

  for (const location of locations) {
    north = Math.max(north, location.lat);
    south = Math.min(south, location.lat);
    west = Math.min(west, location.lng);
    east = Math.max(east, location.lng);
  }

  return { north, south, east, west };
}

function normalizeLongitudeSpan(west: number, east: number): number {
  const span = east - west;
  return span < 0 ? span + 360 : span;
}
