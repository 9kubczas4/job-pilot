import { haversineDistanceKm } from './geo.utils';
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
      ...job.skills.map((skill) => skill.name),
      ...job.seniority,
      ...job.contractTypes,
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
    const jobSkills = job.skills.map((skill) => skill.name.toLowerCase());
    if (!criteria.skills.every((skill) => jobSkills.includes(skill.toLowerCase()))) {
      return false;
    }
  }

  if (criteria.seniority?.length) {
    if (!criteria.seniority.some((level) => job.seniority.includes(level))) {
      return false;
    }
  }

  if (criteria.locationLat != null && criteria.locationLng != null && criteria.radiusKm != null) {
    if (!job.location) {
      return false;
    }

    const distanceKm = haversineDistanceKm(
      criteria.locationLat,
      criteria.locationLng,
      job.location.latitude,
      job.location.longitude,
    );

    if (distanceKm > criteria.radiusKm) {
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

  if (criteria.contracts?.length) {
    if (!criteria.contracts.some((contract) => job.contractTypes.includes(contract))) {
      return false;
    }
  }

  if (criteria.salaryMin != null && job.salary) {
    if (job.salary.max < criteria.salaryMin) {
      return false;
    }
  }

  return true;
}
