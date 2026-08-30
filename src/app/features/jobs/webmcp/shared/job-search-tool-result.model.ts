import { JobSearchCriteria } from '@features/jobs/domain/search.model';

export interface JobSearchToolResult {
  success: boolean;
  changed: boolean;
  criteria: JobSearchCriteria;
  resultCount: number;
  jobIds: string[];
}
