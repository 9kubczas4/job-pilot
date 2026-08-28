import { JobSearchCriteria } from '../../shared/models/search.types';

export function criteriaToQueryParams(criteria: JobSearchCriteria): Record<string, string> {
  const params: Record<string, string> = {};

  if (criteria.query) {
    params['q'] = criteria.query;
  }
  if (criteria.locations?.length) {
    params['location'] = criteria.locations.join(',');
  }
  if (criteria.workplace?.length) {
    params['workplace'] = criteria.workplace.join(',');
  }
  if (criteria.seniority?.length) {
    params['seniority'] = criteria.seniority.join(',');
  }
  if (criteria.skills?.length) {
    params['skills'] = criteria.skills.join(',');
  }
  if (criteria.contracts?.length) {
    params['contracts'] = criteria.contracts.join(',');
  }
  if (criteria.salaryMin != null) {
    params['salaryMin'] = String(criteria.salaryMin);
  }

  return params;
}

export function queryParamsToCriteria(params: Record<string, string | undefined>): JobSearchCriteria {
  return {
    query: params['q'] || undefined,
    locations: splitParam(params['location']),
    workplace: splitParam(params['workplace']) as JobSearchCriteria['workplace'],
    seniority: splitParam(params['seniority']) as JobSearchCriteria['seniority'],
    skills: splitParam(params['skills']),
    contracts: splitParam(params['contracts']) as JobSearchCriteria['contracts'],
    salaryMin: params['salaryMin'] ? Number(params['salaryMin']) : undefined,
  };
}

function splitParam(value: string | undefined): string[] | undefined {
  if (!value) {
    return undefined;
  }
  const items = value.split(',').map((item) => item.trim()).filter(Boolean);
  return items.length ? items : undefined;
}
