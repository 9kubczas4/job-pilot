import { z } from 'zod';

export const APPLY_JOB_INPUT_SCHEMA = z.strictObject({
  jobId: z.string().trim().min(1).max(128).meta({
    description: 'Job ID from search_jobs or get_jobs.',
  }),
  note: z.string().trim().min(1).max(2000).meta({
    description: 'Application message prefilled in the dialog (1–2000 chars). User reviews and submits.',
  }),
});
