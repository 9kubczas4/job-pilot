import { JobOffer } from './job.model';

export interface CityCenter {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  jobCount: number;
}

function normalizeCityQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

/** Keep only the city segment when users paste values like "Boston, United States". */
export function parseCitySearchQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return '';
  }

  const [cityPart] = trimmed.split(',');
  return cityPart.trim();
}

function matchesCityName(cityName: string, query: string): boolean {
  const normalizedQuery = normalizeCityQuery(parseCitySearchQuery(query));
  if (!normalizedQuery) {
    return true;
  }

  const normalizedCity = normalizeCityQuery(cityName);
  return normalizedCity === normalizedQuery || normalizedCity.startsWith(normalizedQuery);
}

export function buildCityCentersFromJobs(jobs: JobOffer[]): CityCenter[] {
  const grouped = new Map<string, { country: string; latSum: number; lngSum: number; count: number }>();

  for (const job of jobs) {
    if (!job.location) {
      continue;
    }

    const key = job.location.city;
    const current = grouped.get(key) ?? {
      country: job.location.country,
      latSum: 0,
      lngSum: 0,
      count: 0,
    };

    current.latSum += job.location.latitude;
    current.lngSum += job.location.longitude;
    current.count += 1;
    grouped.set(key, current);
  }

  return [...grouped.entries()]
    .map(([city, data]) => ({
      city,
      country: data.country,
      latitude: data.latSum / data.count,
      longitude: data.lngSum / data.count,
      jobCount: data.count,
    }))
    .sort((a, b) => a.city.localeCompare(b.city));
}

export function resolveCityCenter(catalog: CityCenter[], query: string): CityCenter | null {
  const normalized = normalizeCityQuery(parseCitySearchQuery(query));
  if (!normalized || !catalog.length) {
    return null;
  }

  const matches = catalog.filter((entry) => matchesCityName(entry.city, query));
  if (!matches.length) {
    return null;
  }

  const exact = matches.find((entry) => normalizeCityQuery(entry.city) === normalized);
  if (exact) {
    return exact;
  }

  return [...matches].sort(
    (a, b) => b.jobCount - a.jobCount || a.city.localeCompare(b.city),
  )[0];
}

export function buildLocationSuggestions(
  catalog: CityCenter[],
  query: string,
  limit = 6,
): CityCenter[] {
  const normalized = normalizeCityQuery(parseCitySearchQuery(query));
  const sorted = [...catalog].sort(
    (a, b) => b.jobCount - a.jobCount || a.city.localeCompare(b.city),
  );

  if (!normalized) {
    return sorted.slice(0, limit);
  }

  return sorted.filter((entry) => matchesCityName(entry.city, query)).slice(0, limit);
}
