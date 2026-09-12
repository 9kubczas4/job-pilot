import { z } from 'zod';

export const HIGHLIGHT_JOB_INPUT_SCHEMA = z.strictObject({
  jobId: z.string().trim().min(1).max(128).meta({
    description: 'Job ID from the current /jobs search results (e.g. from search_jobs).',
  }),
});
