import { z } from 'zod';

export const GET_JOB_INPUT_SCHEMA = z.strictObject({
  jobId: z.string().trim().min(1).max(128).meta({
    description: 'The unique job identifier returned by search_jobs (for example, job-001).',
  }),
});
