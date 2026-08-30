import {
  EUROPE_MAP_DEFAULT_VIEW,
  getMapDefaultView,
  isLocationInEurope,
  resolveMapRegionFromCoords,
  US_MAP_DEFAULT_VIEW,
} from './map-default-region';

describe('map-default-region', () => {
  it('defaults to the US map view', () => {
    expect(getMapDefaultView()).toEqual(US_MAP_DEFAULT_VIEW);
  });

  it('returns the Europe map view for the europe region', () => {
    expect(getMapDefaultView('europe')).toEqual(EUROPE_MAP_DEFAULT_VIEW);
  });

  it('detects European coordinates', () => {
    expect(isLocationInEurope(52.2297, 21.0122)).toBe(true);
    expect(resolveMapRegionFromCoords(52.2297, 21.0122)).toBe('europe');
  });

  it('detects non-European coordinates as US region', () => {
    expect(isLocationInEurope(40.7128, -74.006)).toBe(false);
    expect(resolveMapRegionFromCoords(40.7128, -74.006)).toBe('us');
  });
});
