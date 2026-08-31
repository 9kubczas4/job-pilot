import { JobSearchCriteria } from '@features/jobs/domain/search.model';
import type {
  JobSalary,
  SeniorityLevel,
  WorkplaceMode,
} from '@features/jobs/domain/job.model';

export interface JobSearchResultSummary {
  id: string;
  title: string;
  company: string;
  location?: string;
  distanceKm?: number;
  workplace: WorkplaceMode;
  salary?: JobSalary;
  seniority: SeniorityLevel[];
  skills: string[];
}

export interface JobSearchToolResult {
  success: boolean;
  changed: boolean;
  criteria: JobSearchCriteria;
  resultCount: number;
  jobIds: string[];
  results: JobSearchResultSummary[];
}
