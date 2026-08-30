import {
  computeGeoBounds,
  resolveMapResultsViewport,
  spansWideGeography,
} from './map-results-viewport';
import { WORLD_MAP_VIEW } from './map-default-region';

describe('map-results-viewport', () => {
  const poland = [
    { lat: 52.2297, lng: 21.0122 },
    { lat: 50.0614, lng: 19.9372 },
    { lat: 54.352, lng: 18.6466 },
    { lat: 51.1079, lng: 17.0385 },
  ];

  const us = [
    { lat: 40.7128, lng: -74.006 },
    { lat: 34.0522, lng: -118.2437 },
    { lat: 41.8781, lng: -87.6298 },
  ];

  it('returns default region when there are no locations', () => {
    expect(resolveMapResultsViewport([])).toEqual({ kind: 'default-region' });
  });

  it('fits bounds for jobs concentrated in one country', () => {
    const viewport = resolveMapResultsViewport(poland);

    expect(viewport.kind).toBe('bounds');
    if (viewport.kind === 'bounds') {
      expect(viewport.bounds.north).toBeCloseTo(54.352, 3);
      expect(viewport.bounds.south).toBeCloseTo(50.0614, 3);
    }
  });

  it('shows the world when results span Europe and the US', () => {
    const viewport = resolveMapResultsViewport([...poland.slice(0, 2), ...us.slice(0, 2)]);

    expect(viewport).toEqual({
      kind: 'world',
      center: WORLD_MAP_VIEW.center,
      zoom: WORLD_MAP_VIEW.zoom,
    });
  });

  it('detects wide geography across continents', () => {
    expect(spansWideGeography([{ lat: 52.2, lng: 21 }, { lat: 40.7, lng: -74 }])).toBe(true);
    expect(spansWideGeography(poland)).toBe(false);
    expect(spansWideGeography(us)).toBe(false);
  });

  it('computes geographic bounds', () => {
    expect(computeGeoBounds(poland)).toEqual({
      north: 54.352,
      south: 50.0614,
      east: 21.0122,
      west: 17.0385,
    });
  });
});
