import { haversineDistanceKm } from './geo.utils';
import { JobOffer } from './job.model';
import { JobSearchCriteria, JobSortOption } from './search.model';

export const DEFAULT_JOB_SORT: JobSortOption = 'newest';

export const JOB_SORT_OPTIONS: { value: JobSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'salary-desc', label: 'Salary: high to low' },
  { value: 'salary-asc', label: 'Salary: low to high' },
  { value: 'deadline', label: 'Deadline soonest' },
  { value: 'distance', label: 'Nearest first' },
];

export function sortJobs(
  jobs: JobOffer[],
  sort: JobSortOption | undefined,
  criteria: JobSearchCriteria,
): JobOffer[] {
  const option = resolveSortOption(sort, criteria);
  const sorted = [...jobs];

  switch (option) {
    case 'oldest':
      return sorted.sort((a, b) => compareDates(a.createdAt, b.createdAt));
    case 'salary-desc':
      return sorted.sort(compareSalaryDesc);
    case 'salary-asc':
      return sorted.sort(compareSalaryAsc);
    case 'deadline':
      return sorted.sort(compareDeadline);
    case 'distance':
      return sortByDistance(sorted, criteria);
    case 'newest':
    default:
      return sorted.sort((a, b) => compareDates(b.createdAt, a.createdAt));
  }
}

export function availableSortOptions(
  criteria: JobSearchCriteria,
): { value: JobSortOption; label: string }[] {
  if (isDistanceSortAvailable(criteria)) {
    return JOB_SORT_OPTIONS;
  }

  return JOB_SORT_OPTIONS.filter((option) => option.value !== 'distance');
}

export function isDistanceSortAvailable(criteria: JobSearchCriteria): boolean {
  return (
    criteria.locationLat != null &&
    criteria.locationLng != null &&
    criteria.radiusMi != null
  );
}

function resolveSortOption(
  sort: JobSortOption | undefined,
  criteria: JobSearchCriteria,
): JobSortOption {
  const option = sort ?? DEFAULT_JOB_SORT;
  if (option === 'distance' && !isDistanceSortAvailable(criteria)) {
    return DEFAULT_JOB_SORT;
  }
  return option;
}

function compareDates(a: string, b: string): number {
  return new Date(a).getTime() - new Date(b).getTime();
}

function compareSalaryDesc(a: JobOffer, b: JobOffer): number {
  const aMax = a.salary?.max ?? null;
  const bMax = b.salary?.max ?? null;

  if (aMax == null && bMax == null) {
    return compareDates(b.createdAt, a.createdAt);
  }
  if (aMax == null) {
    return 1;
  }
  if (bMax == null) {
    return -1;
  }

  return bMax - aMax || compareDates(b.createdAt, a.createdAt);
}

function compareSalaryAsc(a: JobOffer, b: JobOffer): number {
  const aMin = a.salary?.min ?? null;
  const bMin = b.salary?.min ?? null;

  if (aMin == null && bMin == null) {
    return compareDates(b.createdAt, a.createdAt);
  }
  if (aMin == null) {
    return 1;
  }
  if (bMin == null) {
    return -1;
  }

  return aMin - bMin || compareDates(b.createdAt, a.createdAt);
}

function compareDeadline(a: JobOffer, b: JobOffer): number {
  const aDeadline = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : null;
  const bDeadline = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : null;

  if (aDeadline == null && bDeadline == null) {
    return compareDates(b.createdAt, a.createdAt);
  }
  if (aDeadline == null) {
    return 1;
  }
  if (bDeadline == null) {
    return -1;
  }

  return aDeadline - bDeadline || compareDates(b.createdAt, a.createdAt);
}

function sortByDistance(jobs: JobOffer[], criteria: JobSearchCriteria): JobOffer[] {
  const lat = criteria.locationLat;
  const lng = criteria.locationLng;

  if (lat == null || lng == null) {
    return sortJobs(jobs, DEFAULT_JOB_SORT, criteria);
  }

  return [...jobs].sort((a, b) => {
    const distA = jobDistanceKm(a, lat, lng);
    const distB = jobDistanceKm(b, lat, lng);

    if (distA == null && distB == null) {
      return compareDates(b.createdAt, a.createdAt);
    }
    if (distA == null) {
      return 1;
    }
    if (distB == null) {
      return -1;
    }

    return distA - distB || compareDates(b.createdAt, a.createdAt);
  });
}

function jobDistanceKm(job: JobOffer, lat: number, lng: number): number | null {
  if (!job.location) {
    return null;
  }

  return haversineDistanceKm(lat, lng, job.location.latitude, job.location.longitude);
}
