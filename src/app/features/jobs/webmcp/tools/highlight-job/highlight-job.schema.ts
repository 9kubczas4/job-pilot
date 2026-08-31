import { z } from 'zod';

export const HIGHLIGHT_JOB_INPUT_SCHEMA = z.strictObject({
  jobId: z.string().trim().min(1).max(128).meta({
    description:
      'The exact job identifier from the current search results returned by search_jobs or filter_jobs.',
  }),
});
