import { JobSearchCriteria } from '@features/jobs/domain/search.model';

export interface WebMcpToolResultBase {
  success: boolean;
  changed: boolean;
}

export interface JobSearchToolResult extends WebMcpToolResultBase {
  criteria: JobSearchCriteria;
  resultCount: number;
  jobIds: string[];
}

export interface SaveJobToolResult extends WebMcpToolResultBase {
  jobId: string;
  saved: true;
}

export interface ApplyJobToolResult extends WebMcpToolResultBase {
  jobId: string;
  appliedAt: string;
  note?: string;
  status: 'applied';
}
