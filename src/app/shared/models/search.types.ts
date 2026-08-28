import { ContractType, SeniorityLevel, WorkplaceMode } from './job.types';

export interface JobSearchCriteria {
  query?: string;
  roles?: string[];
  skills?: string[];
  seniority?: SeniorityLevel[];
  locations?: string[];
  workplace?: WorkplaceMode[];
  contracts?: ContractType[];
  salaryMin?: number;
  radiusKm?: number;
}
