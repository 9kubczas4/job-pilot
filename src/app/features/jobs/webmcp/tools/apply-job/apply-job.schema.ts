export const APPLY_JOB_SCHEMA = {
  type: 'object',
  properties: {
    jobId: { type: 'string' },
    note: { type: 'string', description: 'Optional note attached to the application.' },
  },
  required: ['jobId'],
  additionalProperties: false,
} as const;
