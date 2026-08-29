import {
  ContractType,
  JobOffer,
  SeniorityLevel,
  WorkSchedule,
  WorkplaceMode,
} from './job.model';
import { normalizeCompetencies } from './job-competency.utils';

const LEGACY_SENIORITY: Record<string, SeniorityLevel> = {
  mid: 'regular',
  lead: 'expert',
  staff: 'expert',
};

export function normalizeJobOffer(raw: Record<string, unknown> & { id: string }): JobOffer {
  const seniority = normalizeSeniority(raw['seniority']);
  const competencies = normalizeCompetencies(raw['competencies'] ?? raw['skills']);
  const workSchedules = normalizeWorkSchedules(raw['workSchedules']);
  const contractTypes = normalizeContractTypes(raw['contractTypes']);
  const createdAt =
    typeof raw['createdAt'] === 'string'
      ? raw['createdAt']
      : typeof raw['publishedAt'] === 'string'
        ? raw['publishedAt']
        : new Date().toISOString();

  return {
    id: raw.id,
    title: String(raw['title'] ?? ''),
    company: raw['company'] as JobOffer['company'],
    description: String(raw['description'] ?? ''),
    seniority,
    competencies,
    salary: raw['salary'] as JobOffer['salary'],
    workSchedules,
    contractTypes,
    workplace: (raw['workplace'] as WorkplaceMode) ?? 'remote',
    location: raw['location'] as JobOffer['location'],
    responsibilities: (raw['responsibilities'] as string[]) ?? [],
    requirements: (raw['requirements'] as string[]) ?? [],
    niceToHave: raw['niceToHave'] as string[] | undefined,
    benefits: raw['benefits'] as string[] | undefined,
    createdAt,
    applicationDeadline:
      typeof raw['applicationDeadline'] === 'string' ? raw['applicationDeadline'] : undefined,
  };
}

function normalizeSeniority(value: unknown): SeniorityLevel[] {
  if (!Array.isArray(value)) {
    return ['regular'];
  }

  return value.map((level) => {
    const key = String(level);
    return (LEGACY_SENIORITY[key] ?? key) as SeniorityLevel;
  });
}

function normalizeWorkSchedules(value: unknown): WorkSchedule[] {
  if (Array.isArray(value) && value.length) {
    return value as WorkSchedule[];
  }

  return ['full-time'];
}

function normalizeContractTypes(value: unknown): ContractType[] {
  if (Array.isArray(value) && value.length) {
    return value as ContractType[];
  }

  return ['b2b'];
}
