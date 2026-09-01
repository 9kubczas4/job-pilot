import { z } from 'zod';

export const GET_JOBS_INPUT_SCHEMA = z.strictObject({
  jobIds: z
    .array(z.string().trim().min(1).max(128))
    .min(1)
    .max(20)
    .refine((jobIds) => new Set(jobIds).size === jobIds.length, {
      message: 'Each jobId may appear only once.',
    })
    .meta({
      description: 'One to twenty unique job identifiers returned by search_jobs.',
      uniqueItems: true,
    }),
});
