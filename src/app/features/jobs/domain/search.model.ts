import { ContractType, SeniorityLevel, WorkSchedule, WorkplaceMode } from './job.model';

export interface JobSearchCriteria {
  query?: string;
  roles?: string[];
  skills?: string[];
  seniority?: SeniorityLevel[];
  locations?: string[];
  locationLat?: number;
  locationLng?: number;
  workplace?: WorkplaceMode[];
  workSchedules?: WorkSchedule[];
  contracts?: ContractType[];
  salaryMin?: number;
  radiusKm?: number;
}
