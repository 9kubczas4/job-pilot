import { z } from 'zod';

const shortText = (description: string, maxLength = 200) =>
  z.string().trim().max(maxLength).optional().meta({ description });

const nonEmptyList = (description: string) =>
  z.array(z.string().trim().min(1).max(100)).max(30).optional().meta({ description });

const month = z
  .string()
  .trim()
  .regex(/^$|^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM or an empty string.');

const workExperienceSchema = z.strictObject({
  company: z.string().trim().min(1).max(200).meta({ description: 'Employer name.' }),
  title: z.string().trim().min(1).max(200).meta({ description: 'Job title.' }),
  startDate: month.meta({ description: 'Start month in YYYY-MM format.' }),
  endDate: month.optional().meta({
    description: 'End month in YYYY-MM format. Omit for a current role.',
  }),
  current: z.boolean().optional().meta({
    description: 'Whether this is the current role. Defaults to false.',
  }),
  description: z.string().trim().max(2000).optional().meta({
    description: 'Optional summary of responsibilities or achievements.',
  }),
});

const skillSchema = z.strictObject({
  name: z.string().trim().min(1).max(100).meta({ description: 'Skill name.' }),
  years: z.number().int().min(1).max(50).optional().meta({
    description: 'Whole years of experience, from 1 to 50.',
  }),
});

export const UPDATE_PROFILE_INPUT_SCHEMA = z
  .strictObject({
    firstName: shortText('Candidate first name. Pass an empty string to clear it.', 100),
    lastName: shortText('Candidate last name. Pass an empty string to clear it.', 100),
    headline: shortText('Short professional headline. Pass an empty string to clear it.', 200),
    workHistory: z.array(workExperienceSchema).max(30).optional().meta({
      description:
        'Complete replacement for work history. Pass [] to clear all entries; every entry needs company, title, and startDate.',
    }),
    skills: z.array(skillSchema).max(50).optional().meta({
      description: 'Complete replacement for skills. Pass [] to clear all skills.',
    }),
    preferredRoles: nonEmptyList(
      'Complete replacement for preferred role names. Pass [] to clear them.',
    ),
    preferredSeniorities: z
      .array(z.enum(['junior', 'regular', 'senior', 'expert']))
      .max(4)
      .optional()
      .meta({
        description:
          'Complete replacement for preferred seniority levels. Allowed: junior, regular, senior, expert. Pass [] to clear.',
      }),
    preferredLocations: nonEmptyList(
      'Complete replacement for preferred city names. Pass [] to clear them.',
    ),
    workplacePreferences: z
      .array(z.enum(['remote', 'hybrid', 'onsite']))
      .max(3)
      .optional()
      .meta({
        description:
          'Complete replacement for workplace preferences. Allowed: remote, hybrid, onsite. Pass [] to clear.',
      }),
    contractPreferences: z
      .array(z.enum(['b2b', 'employment', 'service-contract', 'internship']))
      .max(4)
      .optional()
      .meta({
        description:
          'Complete replacement for contract preferences. Allowed: b2b, employment, service-contract, internship. Pass [] to clear.',
      }),
    salaryExpectation: z
      .strictObject({
        min: z.number().finite().nonnegative().optional().meta({
          description: 'Minimum monthly salary. Omit or pass 0 when no minimum is required.',
        }),
        currency: z.enum(['USD', 'EUR', 'PLN']).meta({
          description: 'Salary currency: USD, EUR, or PLN.',
        }),
      })
      .optional()
      .meta({
        description:
          'Salary expectation. Supplying this object replaces the current salary expectation.',
      }),
    preferences: shortText(
      'Additional free-text job preferences. Pass an empty string to clear them.',
      2000,
    ),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: 'Provide at least one profile field to update.',
  });
