import { JobOffer } from '../../shared/models/job.types';
import { JobSearchCriteria } from '../../shared/models/search.types';

export function matchesSearchCriteria(job: JobOffer, criteria: JobSearchCriteria): boolean {
  const query = criteria.query?.trim().toLowerCase();
  if (query) {
    const haystack = [
      job.title,
      job.company.name,
      job.description,
      ...job.skills.map((s) => s.name),
    ]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(query)) {
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
    const jobSkills = job.skills.map((s) => s.name.toLowerCase());
    if (!criteria.skills.every((skill) => jobSkills.includes(skill.toLowerCase()))) {
      return false;
    }
  }

  if (criteria.seniority?.length) {
    if (!criteria.seniority.some((level) => job.seniority.includes(level))) {
      return false;
    }
  }

  if (criteria.locations?.length) {
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

export function formatSalary(job: JobOffer): string | null {
  if (!job.salary) {
    return null;
  }
  const { min, max, currency, period } = job.salary;
  const suffix = period === 'month' ? '/mo' : '/yr';
  return `${formatAmount(min)}–${formatAmount(max)} ${currency}${suffix}`;
}

function formatAmount(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }
  return String(value);
}

export function formatWorkplace(job: JobOffer): string {
  const city = job.location?.city;
  const workplace = job.workplace.charAt(0).toUpperCase() + job.workplace.slice(1);
  return city ? `${city} · ${workplace}` : workplace;
}
