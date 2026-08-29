export const PROFILE_SCHEMA_FIELDS = {
  firstName: { type: 'string', required: false },
  lastName: { type: 'string', required: false },
  headline: { type: 'string', required: false },
  workHistory: {
    type: 'array',
    items: {
      company: 'string',
      title: 'string',
      startDate: 'string',
      endDate: 'string',
      current: 'boolean',
      description: 'string',
    },
    required: false,
  },
  skills: { type: 'array', items: { name: 'string', years: 'number' }, required: false },
  preferredRoles: { type: 'array', items: 'string', required: false },
  preferredSeniorities: {
    type: 'array',
    allowed: ['junior', 'regular', 'senior', 'expert'],
    required: false,
  },
  preferredLocations: { type: 'array', items: 'string', required: false },
  workplacePreferences: {
    type: 'array',
    allowed: ['remote', 'hybrid', 'onsite'],
    required: false,
  },
  contractPreferences: {
    type: 'array',
    allowed: ['b2b', 'employment', 'service-contract', 'internship'],
    required: false,
  },
  salaryExpectation: {
    type: 'object',
    properties: { min: 'number', currency: ['PLN', 'EUR', 'USD'] },
    required: false,
  },
  preferences: { type: 'string', required: false },
} as const;

export function getProfileSchemaPayload() {
  return {
    fields: PROFILE_SCHEMA_FIELDS,
    agentInstructions:
      'Read the user CV externally (file upload in Codex). Call get_profile_schema, map CV content to fields, then call update_profile with a partial payload. Supported mappings: name → firstName/lastName, title → headline, employment history → workHistory[], skills → skills[], target roles → preferredRoles[], seniority → preferredSeniorities[], locations → preferredLocations[], remote preference → workplacePreferences[], contract type → contractPreferences[], salary notes → salaryExpectation, extra notes → preferences.',
  };
}
