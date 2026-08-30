import { z } from 'zod';

export const APPLY_JOB_INPUT_SCHEMA = z.strictObject({
  jobId: z.string().trim().min(1).max(128).meta({
    description:
      'The unique job identifier returned by search_jobs or get_job (for example, job-001).',
  }),
  note: z.string().trim().max(2000).optional().meta({
    description:
      'Optional note stored with the application. Maximum 2,000 characters; omit when no note is needed.',
  }),
});
