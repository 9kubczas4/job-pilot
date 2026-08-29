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
  const normalized = normalizeCityQuery(query.trim());
  if (!normalized || !catalog.length) {
    return null;
  }

  return (
    catalog.find((entry) => {
      const city = normalizeCityQuery(entry.city);
      return city === normalized || city.startsWith(normalized);
    }) ?? null
  );
}

export function buildLocationSuggestions(
  catalog: CityCenter[],
  query: string,
  limit = 6,
): CityCenter[] {
  const normalized = normalizeCityQuery(query.trim());
  const sorted = [...catalog].sort(
    (a, b) => b.jobCount - a.jobCount || a.city.localeCompare(b.city),
  );

  if (!normalized) {
    return sorted.slice(0, limit);
  }

  return sorted
    .filter((entry) => normalizeCityQuery(entry.city).includes(normalized))
    .slice(0, limit);
}
