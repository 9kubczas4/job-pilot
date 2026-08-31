import { DEFAULT_JOB_SORT } from '@features/jobs/domain/job-sort.utils';
import { JobSearchCriteria } from '@features/jobs/domain/search.model';
import { searchCriteriaFieldsEqual } from '@features/jobs/domain/search-url.utils';

export type JobSearchInput = Pick<
  JobSearchCriteria,
  | 'query'
  | 'roles'
  | 'skills'
  | 'seniority'
  | 'workSchedules'
  | 'workplace'
  | 'contracts'
  | 'salaryMin'
  | 'radiusKm'
  | 'sort'
> & {
  location?: string;
  limit?: number;
};

export function searchFieldsChanged(before: JobSearchCriteria, after: JobSearchCriteria): boolean {
  return !searchCriteriaFieldsEqual(before, after);
}

export function filterControlFieldsChanged(
  before: JobSearchCriteria,
  after: JobSearchCriteria,
): boolean {
  return !filterControlCriteriaFieldsEqual(before, after);
}

export function sortFieldChanged(before: JobSearchCriteria, after: JobSearchCriteria): boolean {
  return (before.sort ?? DEFAULT_JOB_SORT) !== (after.sort ?? DEFAULT_JOB_SORT);
}

function filterControlCriteriaFieldsEqual(a: JobSearchCriteria, b: JobSearchCriteria): boolean {
  return (
    arraysEqual(a.roles, b.roles) &&
    arraysEqual(a.skills, b.skills) &&
    arraysEqual(a.seniority, b.seniority) &&
    arraysEqual(a.workSchedules, b.workSchedules) &&
    arraysEqual(a.workplace, b.workplace) &&
    arraysEqual(a.contracts, b.contracts) &&
    (a.salaryMin ?? null) === (b.salaryMin ?? null)
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
