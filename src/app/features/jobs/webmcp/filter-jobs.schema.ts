export const FILTER_JOBS_SCHEMA = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      items: { type: 'string' },
      description: 'Preferred role titles.',
    },
    skills: {
      type: 'array',
      items: { type: 'string' },
      description: 'Required skills.',
    },
    seniority: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['junior', 'regular', 'senior', 'expert'],
      },
    },
    workSchedules: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['full-time', 'part-time', 'freelance'],
      },
    },
    workplace: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['remote', 'hybrid', 'onsite'],
      },
    },
    contracts: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['b2b', 'employment', 'service-contract', 'internship'],
      },
    },
    salaryMin: { type: 'number', description: 'Minimum salary in the job currency.' },
    sort: {
      type: 'string',
      enum: ['newest', 'oldest', 'salary-desc', 'salary-asc', 'deadline', 'distance'],
      description: 'Result ordering. distance requires a location in search_jobs.',
    },
  },
  additionalProperties: false,
} as const;
