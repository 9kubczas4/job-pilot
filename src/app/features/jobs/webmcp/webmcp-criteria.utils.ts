import { DEFAULT_JOB_SORT } from '../domain/job-sort.utils';
import { JobFilterCriteria, JobSearchCriteria } from '../domain/search.model';
import { searchCriteriaFieldsEqual } from '../domain/search-url.utils';

export type JobSearchInput = Pick<
  JobSearchCriteria,
  'query' | 'locations' | 'locationLat' | 'locationLng' | 'radiusKm'
>;

export function searchFieldsChanged(before: JobSearchCriteria, after: JobSearchCriteria): boolean {
  return !searchCriteriaFieldsEqual(before, after);
}

export function filterFieldsChanged(before: JobSearchCriteria, after: JobSearchCriteria): boolean {
  return !filterCriteriaFieldsEqual(before, after);
}

export function filterCriteriaFieldsEqual(a: JobSearchCriteria, b: JobSearchCriteria): boolean {
  return (
    arraysEqual(a.roles, b.roles) &&
    arraysEqual(a.skills, b.skills) &&
    arraysEqual(a.seniority, b.seniority) &&
    arraysEqual(a.workSchedules, b.workSchedules) &&
    arraysEqual(a.workplace, b.workplace) &&
    arraysEqual(a.contracts, b.contracts) &&
    (a.salaryMin ?? null) === (b.salaryMin ?? null) &&
    (a.sort ?? DEFAULT_JOB_SORT) === (b.sort ?? DEFAULT_JOB_SORT)
  );
}

function arraysEqual<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  const left = a ?? [];
  const right = b ?? [];
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function normalizeArrayField<T>(value: T[] | undefined): T[] | undefined {
  return value?.length ? value : undefined;
}

export function normalizeFilterPatch(input: JobFilterCriteria): Partial<JobSearchCriteria> {
  const patch: Partial<JobSearchCriteria> = {};

  if ('roles' in input) {
    patch.roles = normalizeArrayField(input.roles);
  }
  if ('skills' in input) {
    patch.skills = normalizeArrayField(input.skills);
  }
  if ('seniority' in input) {
    patch.seniority = normalizeArrayField(input.seniority);
  }
  if ('workSchedules' in input) {
    patch.workSchedules = normalizeArrayField(input.workSchedules);
  }
  if ('workplace' in input) {
    patch.workplace = normalizeArrayField(input.workplace);
  }
  if ('contracts' in input) {
    patch.contracts = normalizeArrayField(input.contracts);
  }
  if ('salaryMin' in input) {
    patch.salaryMin = input.salaryMin ?? undefined;
  }
  if ('sort' in input) {
    patch.sort =
      input.sort == null || input.sort === DEFAULT_JOB_SORT ? undefined : input.sort;
  }

  return patch;
}
