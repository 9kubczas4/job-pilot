export const SAVED_JOB_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    jobId: {
      type: 'string',
      minLength: 1,
      description:
        'The unique job identifier returned by search_jobs or get_job (for example, job-001).',
    },
  },
  required: ['jobId'],
  additionalProperties: false,
} as const;
