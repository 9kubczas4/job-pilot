import {
  ContractType,
  JobCompetency,
  JobOffer,
  SeniorityLevel,
  WorkSchedule,
} from './job.model';

const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  junior: 'Junior',
  regular: 'Regular',
  senior: 'Senior',
  expert: 'Expert',
};

const WORK_SCHEDULE_LABELS: Record<WorkSchedule, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  freelance: 'Freelance',
};

const CONTRACT_LABELS: Record<ContractType, string> = {
  uop: 'Employment (UoP)',
  b2b: 'B2B',
  uz: 'Contract of mandate',
  internship: 'Internship',
};

export function formatSalary(job: JobOffer): string | null {
  if (!job.salary) {
    return null;
  }
  const { min, max, currency, period } = job.salary;
  const suffix = period === 'month' ? '/mo' : '/yr';
  return `${formatAmount(min)}–${formatAmount(max)} ${currency}${suffix}`;
}

export function formatWorkplace(job: JobOffer): string {
  const city = job.location?.city;
  const workplace = job.workplace.charAt(0).toUpperCase() + job.workplace.slice(1);
  return city ? `${city} · ${workplace}` : workplace;
}

export function formatSeniority(levels: SeniorityLevel[]): string {
  return levels.map((level) => SENIORITY_LABELS[level] ?? level).join(' · ');
}

export function formatWorkSchedules(schedules: WorkSchedule[]): string {
  return schedules.map((schedule) => WORK_SCHEDULE_LABELS[schedule] ?? schedule).join(' · ');
}

export function formatContractTypes(contracts: ContractType[]): string {
  return contracts.map((type) => CONTRACT_LABELS[type] ?? type.toUpperCase()).join(' · ');
}

export function formatCompetency(competency: JobCompetency): string {
  const scale = competency.scale ?? 5;
  return `${competency.name} ${competency.level}/${scale}`;
}

export function formatJobDate(isoDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export function formatApplicationDeadline(isoDate: string): string {
  const deadline = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Recruitment closed';
  }
  if (diffDays === 0) {
    return 'Apply today';
  }
  if (diffDays === 1) {
    return 'Apply by tomorrow';
  }
  if (diffDays <= 7) {
    return `Apply within ${diffDays} days`;
  }

  return `Apply by ${formatJobDate(isoDate)}`;
}

function formatAmount(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }
  return String(value);
}
