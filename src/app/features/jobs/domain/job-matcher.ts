import { haversineDistanceMi } from './geo.utils';
import { JobOffer } from './job.model';
import { JobSearchCriteria } from './search.model';

export function matchesSearchCriteria(job: JobOffer, criteria: JobSearchCriteria): boolean {
  const query = criteria.query?.trim().toLowerCase();
  if (query) {
    const tokens = query.split(/\s+/).filter(Boolean);
    const haystack = [
      job.title,
      job.company.name,
      job.description,
      ...job.competencies.map((competency) => competency.name),
      ...job.seniority,
      ...job.contractTypes,
      ...job.workSchedules,
      job.workplace,
    ]
      .join(' ')
      .toLowerCase();

    if (!tokens.every((token) => haystack.includes(token))) {
      return false;
    }
  }

  if (criteria.roles?.length) {
    const title = job.title.toLowerCase();
    if (!criteria.roles.some((role) => title.includes(role.toLowerCase()))) {
      return false;
    }
  }

  if (criteria.skills?.length) {
    const jobCompetencies = job.competencies.map((competency) => competency.name.toLowerCase());
    if (!criteria.skills.some((skill) => jobCompetencies.includes(skill.toLowerCase()))) {
      return false;
    }
  }

  if (criteria.seniority?.length) {
    if (!criteria.seniority.some((level) => job.seniority.includes(level))) {
      return false;
    }
  }

  if (criteria.locationLat != null && criteria.locationLng != null && criteria.radiusMi != null) {
    if (!job.location) {
      return false;
    }

    const distanceMi = haversineDistanceMi(
      criteria.locationLat,
      criteria.locationLng,
      job.location.latitude,
      job.location.longitude,
    );

    if (distanceMi > criteria.radiusMi) {
      return false;
    }
  } else if (criteria.locations?.length) {
    const city = job.location?.city.toLowerCase() ?? '';
    if (!criteria.locations.some((location) => city.includes(location.toLowerCase()))) {
      return false;
    }
  }

  if (criteria.workplace?.length) {
    if (!criteria.workplace.includes(job.workplace)) {
      return false;
    }
  }

  if (criteria.workSchedules?.length) {
    if (!criteria.workSchedules.some((schedule) => job.workSchedules.includes(schedule))) {
      return false;
    }
  }

  if (criteria.contracts?.length) {
    if (!criteria.contracts.some((contract) => job.contractTypes.includes(contract))) {
      return false;
    }
  }

  if (criteria.salaryMin != null) {
    if (!job.salary || job.salary.currency !== 'USD') {
      return false;
    }

    if (job.salary.max < criteria.salaryMin) {
      return false;
    }
  }

  return true;
}
