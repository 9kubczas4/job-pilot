import { z } from 'zod';

export const APPLY_JOB_INPUT_SCHEMA = z.strictObject({
  jobId: z.string().trim().min(1).max(128).meta({
    description:
      'The unique job identifier returned by search_jobs or get_jobs (for example, job-001).',
  }),
  note: z.string().trim().min(1).max(2000).meta({
    description:
      'Message pre-filled in the apply dialog for the user to review before submitting. Required; maximum 2,000 characters.',
  }),
});
