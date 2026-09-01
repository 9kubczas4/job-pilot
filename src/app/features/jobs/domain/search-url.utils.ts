import { DEFAULT_SEARCH_RADIUS_MI } from '../domain/header-search.model';
import { normalizeContractType } from './contract-type.utils';
import { JobSearchCriteria } from './search.model';
import { ContractType } from './job.model';

export function criteriaToQueryParams(criteria: JobSearchCriteria): Record<string, string> {
  const params: Record<string, string> = {};

  if (criteria.query) {
    params['q'] = criteria.query;
  }
  if (criteria.locations?.length) {
    params['location'] = criteria.locations.join(',');
  }
  if (criteria.locationLat != null) {
    params['lat'] = String(criteria.locationLat);
  }
  if (criteria.locationLng != null) {
    params['lng'] = String(criteria.locationLng);
  }
  if (criteria.radiusMi != null) {
    params['radius'] = String(criteria.radiusMi);
  }
  if (criteria.workplace?.length) {
    params['workplace'] = criteria.workplace.join(',');
  }
  if (criteria.seniority?.length) {
    params['seniority'] = criteria.seniority.join(',');
  }
  if (criteria.skills?.length) {
    params['skills'] = criteria.skills.join(',');
  }
  if (criteria.contracts?.length) {
    params['contracts'] = criteria.contracts.join(',');
  }
  if (criteria.workSchedules?.length) {
    params['schedules'] = criteria.workSchedules.join(',');
  }
  if (criteria.salaryMin != null) {
    params['salaryMin'] = String(criteria.salaryMin);
  }
  if (criteria.sort && criteria.sort !== 'newest') {
    params['sort'] = criteria.sort;
  }

  return params;
}

export function queryParamsToCriteria(params: Record<string, string | undefined>): JobSearchCriteria {
  const lat = params['lat'] ? Number(params['lat']) : undefined;
  const lng = params['lng'] ? Number(params['lng']) : undefined;
  const radius = params['radius'] ? Number(params['radius']) : undefined;
  const hasLocation = Boolean(params['location']?.trim());

  return {
    query: params['q'] || undefined,
    locations: splitParam(params['location']),
    locationLat: Number.isFinite(lat) ? lat : undefined,
    locationLng: Number.isFinite(lng) ? lng : undefined,
    radiusMi: Number.isFinite(radius)
      ? radius
      : hasLocation
        ? DEFAULT_SEARCH_RADIUS_MI
        : undefined,
    workplace: splitParam(params['workplace']) as JobSearchCriteria['workplace'],
    seniority: splitParam(params['seniority']) as JobSearchCriteria['seniority'],
    skills: splitParam(params['skills']),
    contracts: splitContractParam(params['contracts']),
    workSchedules: splitParam(params['schedules']) as JobSearchCriteria['workSchedules'],
    salaryMin: params['salaryMin'] ? Number(params['salaryMin']) : undefined,
    sort: parseSortParam(params['sort']),
  };
}

export function normalizeLocationCriteria(
  locationQuery: string,
  radiusMi: number,
  lat?: number,
  lng?: number,
): Pick<JobSearchCriteria, 'locations' | 'locationLat' | 'locationLng' | 'radiusMi'> {
  const trimmed = locationQuery.trim();
  if (!trimmed) {
    return {
      locations: undefined,
      locationLat: undefined,
      locationLng: undefined,
      radiusMi: undefined,
    };
  }

  return {
    locations: [trimmed],
    locationLat: lat,
    locationLng: lng,
    radiusMi: lat != null && lng != null ? radiusMi : undefined,
  };
}

function splitParam(value: string | undefined): string[] | undefined {
  if (!value) {
    return undefined;
  }
  const items = value.split(',').map((item) => item.trim()).filter(Boolean);
  return items.length ? items : undefined;
}

function splitContractParam(value: string | undefined): ContractType[] | undefined {
  const items = splitParam(value);
  if (!items) {
    return undefined;
  }

  const normalized = items
    .map((item) => normalizeContractType(item))
    .filter((item): item is ContractType => item !== null);

  return normalized.length ? normalized : undefined;
}

export function queryParamsEqual(
  next: Record<string, string>,
  current: Record<string, string | string[] | undefined | null>,
): boolean {
  return serializeQueryParams(next) === serializeQueryParams(current);
}

export function routeSearchCriteriaEqual(
  current: JobSearchCriteria,
  route: Pick<
    JobSearchCriteria,
    'query' | 'locations' | 'locationLat' | 'locationLng' | 'radiusMi'
  >,
): boolean {
  return (
    (current.query ?? '') === (route.query ?? '') &&
    (current.locations?.[0] ?? '') === (route.locations?.[0] ?? '') &&
    (current.locationLat ?? null) === (route.locationLat ?? null) &&
    (current.locationLng ?? null) === (route.locationLng ?? null) &&
    (current.radiusMi ?? null) === (route.radiusMi ?? null)
  );
}

export function searchCriteriaFieldsEqual(
  a: Pick<
    JobSearchCriteria,
    'query' | 'locations' | 'locationLat' | 'locationLng' | 'radiusMi'
  >,
  b: Pick<
    JobSearchCriteria,
    'query' | 'locations' | 'locationLat' | 'locationLng' | 'radiusMi'
  >,
): boolean {
  return routeSearchCriteriaEqual(a as JobSearchCriteria, b);
}

export function routeCriteriaEqual(a: JobSearchCriteria, b: JobSearchCriteria): boolean {
  return serializeCriteria(a) === serializeCriteria(b);
}

function parseSortParam(value: string | undefined): JobSearchCriteria['sort'] {
  const allowed: NonNullable<JobSearchCriteria['sort']>[] = [
    'newest',
    'oldest',
    'salary-desc',
    'salary-asc',
    'deadline',
    'distance',
  ];

  if (value && allowed.includes(value as NonNullable<JobSearchCriteria['sort']>)) {
    return value as NonNullable<JobSearchCriteria['sort']>;
  }

  return undefined;
}

function serializeCriteria(criteria: JobSearchCriteria): string {
  return JSON.stringify({
    query: criteria.query ?? '',
    locations: criteria.locations ?? [],
    locationLat: criteria.locationLat ?? null,
    locationLng: criteria.locationLng ?? null,
    radiusMi: criteria.radiusMi ?? null,
    workplace: criteria.workplace ?? [],
    seniority: criteria.seniority ?? [],
    skills: criteria.skills ?? [],
    contracts: criteria.contracts ?? [],
    workSchedules: criteria.workSchedules ?? [],
    salaryMin: criteria.salaryMin ?? null,
    sort: criteria.sort ?? 'newest',
  });
}

function serializeQueryParams(
  params: Record<string, string | string[] | undefined | null>,
): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value != null && value !== '')
    .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify(entries);
}
