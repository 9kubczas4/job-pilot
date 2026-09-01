import { z } from 'zod';

export const HIGHLIGHT_JOB_INPUT_SCHEMA = z.strictObject({
  jobId: z.string().trim().min(1).max(128).meta({
    description:
      'The exact job identifier from the current /jobs search results (for example from search_jobs). Use when focusing, presenting, or answering questions about one visible offer.',
  }),
});
