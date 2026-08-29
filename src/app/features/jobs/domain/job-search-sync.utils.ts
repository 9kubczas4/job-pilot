import { DEFAULT_SEARCH_RADIUS_KM } from '@shared/models/header-search.model';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { buildCityCentersFromJobs, resolveCityCenter } from './city-catalog';
import { JobOffer } from './job.model';
import { JobSearchCriteria } from './search.model';

export function syncHeaderFromCriteria(
  headerUi: HeaderUiStore,
  criteria: JobSearchCriteria,
): void {
  headerUi.searchQuery.set(criteria.query ?? '');
  headerUi.locationQuery.set(criteria.locations?.[0] ?? '');
  headerUi.locationLat.set(criteria.locationLat);
  headerUi.locationLng.set(criteria.locationLng);
  headerUi.radiusKm.set(criteria.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM);
}

export function enrichLocationCriteria(
  criteria: JobSearchCriteria,
  jobs: JobOffer[],
): JobSearchCriteria {
  if (criteria.locationLat != null || !criteria.locations?.[0]) {
    return criteria;
  }

  const city = resolveCityCenter(buildCityCentersFromJobs(jobs), criteria.locations[0]);
  if (!city) {
    return criteria;
  }

  return {
    ...criteria,
    locationLat: city.latitude,
    locationLng: city.longitude,
    radiusKm: criteria.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
  };
}

export function searchLocationEqual(a: JobSearchCriteria, b: JobSearchCriteria): boolean {
  return (
    (a.locations?.[0] ?? '') === (b.locations?.[0] ?? '') &&
    (a.locationLat ?? null) === (b.locationLat ?? null) &&
    (a.locationLng ?? null) === (b.locationLng ?? null) &&
    (a.radiusKm ?? null) === (b.radiusKm ?? null)
  );
}
