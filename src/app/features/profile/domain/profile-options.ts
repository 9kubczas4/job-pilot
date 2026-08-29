import { ContractType, SalaryCurrency, SeniorityLevel, WorkplaceMode } from '@features/jobs/domain/job.model';

export interface ProfileOption<T extends string = string> {
  value: T;
  label: string;
  title?: string;
}

export const SENIORITY_OPTIONS: ProfileOption<SeniorityLevel>[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'regular', label: 'Regular' },
  { value: 'senior', label: 'Senior' },
  { value: 'expert', label: 'Expert' },
];

export const WORKPLACE_OPTIONS: ProfileOption<WorkplaceMode>[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];

export const CONTRACT_OPTIONS: ProfileOption<ContractType>[] = [
  { value: 'b2b', label: 'B2B', title: 'Business-to-business contract' },
  { value: 'employment', label: 'Employment', title: 'Employment contract' },
  { value: 'service-contract', label: 'Service contract', title: 'Contract for services (mandate)' },
  { value: 'internship', label: 'Internship' },
];

export const SALARY_CURRENCY_OPTIONS: ProfileOption<SalaryCurrency>[] = [
  { value: 'PLN', label: 'PLN' },
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' },
];
