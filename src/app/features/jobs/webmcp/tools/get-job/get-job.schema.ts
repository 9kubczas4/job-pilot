export const GET_JOB_SCHEMA = {
  type: 'object',
  properties: {
    jobId: { type: 'string', description: 'The job identifier.' },
  },
  required: ['jobId'],
  additionalProperties: false,
} as const;
