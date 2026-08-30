import { JobSearchCriteria } from './search.model';

export function hasActiveSearchOrFilter(criteria: JobSearchCriteria): boolean {
  return Boolean(
    criteria.query?.trim() ||
      criteria.locations?.length ||
      criteria.locationLat != null ||
      criteria.locationLng != null ||
      criteria.roles?.length ||
      criteria.skills?.length ||
      criteria.seniority?.length ||
      criteria.workplace?.length ||
      criteria.contracts?.length ||
      criteria.workSchedules?.length ||
      criteria.salaryMin != null,
  );
}
