import { ContractType, SeniorityLevel, WorkplaceMode } from './job.model';

export interface JobSearchCriteria {
  query?: string;
  roles?: string[];
  skills?: string[];
  seniority?: SeniorityLevel[];
  locations?: string[];
  locationLat?: number;
  locationLng?: number;
  workplace?: WorkplaceMode[];
  contracts?: ContractType[];
  salaryMin?: number;
  radiusKm?: number;
}
