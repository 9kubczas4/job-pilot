import { describe, expect, it } from 'vitest';
import {
  buildCityCentersFromJobs,
  buildLocationSuggestions,
  parseCitySearchQuery,
  resolveCityCenter,
} from './city-catalog';
import { JobOffer } from './job.model';

const SAMPLE_JOBS: JobOffer[] = [
  {
    id: 'job-001',
    title: 'Frontend Developer',
    company: { id: 'acme', name: 'Acme' },
    description: 'Angular role in New York.',
    seniority: ['senior'],
    competencies: [{ name: 'Angular', level: 5 }],
    workSchedules: ['full-time'],
    contractTypes: ['b2b'],
    workplace: 'remote',
    location: {
      city: 'New York',
      country: 'United States',
      latitude: 40.7128,
      longitude: -74.006,
    },
    responsibilities: [],
    requirements: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'job-002',
    title: 'Backend Developer',
    company: { id: 'acme', name: 'Acme' },
    description: 'Node role in New Orleans.',
    seniority: ['regular'],
    competencies: [{ name: 'Node.js', level: 4 }],
    workSchedules: ['full-time'],
    contractTypes: ['employment'],
    workplace: 'hybrid',
    location: {
      city: 'New Orleans',
      country: 'United States',
      latitude: 29.9511,
      longitude: -90.0715,
    },
    responsibilities: [],
    requirements: [],
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('city-catalog', () => {
  it('parses city names from values that include country or region suffixes', () => {
    expect(parseCitySearchQuery('Boston, United States')).toBe('Boston');
    expect(parseCitySearchQuery('  Austin , TX ')).toBe('Austin');
  });

  it('matches location suggestions only by city name prefix', () => {
    const catalog = buildCityCentersFromJobs(SAMPLE_JOBS);

    expect(buildLocationSuggestions(catalog, 'New').map((entry) => entry.city).sort()).toEqual([
      'New Orleans',
      'New York',
    ]);
    expect(buildLocationSuggestions(catalog, 'York')).toEqual([]);
    expect(buildLocationSuggestions(catalog, 'United States')).toEqual([]);
  });

  it('resolves the best city match by job count when multiple cities share a prefix', () => {
    const catalog = buildCityCentersFromJobs([
      ...SAMPLE_JOBS,
      {
        ...SAMPLE_JOBS[0],
        id: 'job-003',
      },
    ]);

    expect(resolveCityCenter(catalog, 'New York')?.city).toBe('New York');
    expect(resolveCityCenter(catalog, 'New York, United States')?.city).toBe('New York');
    expect(resolveCityCenter(catalog, 'United States')).toBeNull();
  });
});
