export const SAVE_JOB_SCHEMA = {
  type: 'object',
  properties: {
    jobId: { type: 'string' },
  },
  required: ['jobId'],
  additionalProperties: false,
} as const;
