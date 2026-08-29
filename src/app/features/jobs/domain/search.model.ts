import { ContractType, SeniorityLevel, WorkSchedule, WorkplaceMode } from './job.model';

export type JobSortOption =
  | 'newest'
  | 'oldest'
  | 'salary-desc'
  | 'salary-asc'
  | 'deadline'
  | 'distance';

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
  sort?: JobSortOption;
}
