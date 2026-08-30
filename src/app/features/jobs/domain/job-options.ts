import { ContractType, SalaryCurrency, SeniorityLevel, WorkplaceMode } from './job.model';

export interface JobOption<T extends string = string> {
  value: T;
  label: string;
  title?: string;
}

export const SENIORITY_OPTIONS: JobOption<SeniorityLevel>[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'regular', label: 'Regular' },
  { value: 'senior', label: 'Senior' },
  { value: 'expert', label: 'Expert' },
];

export const WORKPLACE_OPTIONS: JobOption<WorkplaceMode>[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];

export const CONTRACT_OPTIONS: JobOption<ContractType>[] = [
  { value: 'b2b', label: 'B2B', title: 'Business-to-business contract' },
  { value: 'employment', label: 'Employment', title: 'Employment contract' },
  {
    value: 'service-contract',
    label: 'Service contract',
    title: 'Contract for services (mandate)',
  },
  { value: 'internship', label: 'Internship' },
];

export const SALARY_CURRENCY_OPTIONS: JobOption<SalaryCurrency>[] = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'PLN', label: 'PLN' },
];
