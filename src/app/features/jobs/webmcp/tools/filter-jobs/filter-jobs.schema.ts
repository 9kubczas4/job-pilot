import { z } from 'zod';

const keywordList = (description: string) =>
  z.array(z.string().trim().min(1).max(100)).max(20).optional().meta({ description });

export const FILTER_JOBS_INPUT_SCHEMA = z.strictObject({
  roles: keywordList(
    'Role-title keywords. A job matches when its title contains any value (OR). Pass [] to clear this filter.',
  ),
  skills: keywordList(
    'Skill names. A job matches when it lists any value (OR). Pass [] to clear this filter.',
  ),
  seniority: z
    .array(z.enum(['junior', 'regular', 'senior', 'expert']))
    .max(4)
    .optional()
    .meta({
      description:
        'Seniority levels matched with OR. Allowed values: junior, regular, senior, expert. Pass [] to clear this filter.',
    }),
  workSchedules: z
    .array(z.enum(['full-time', 'part-time', 'freelance']))
    .max(3)
    .optional()
    .meta({
      description:
        'Work schedules matched with OR. Allowed values: full-time, part-time, freelance. Pass [] to clear this filter.',
    }),
  workplace: z
    .array(z.enum(['remote', 'hybrid', 'onsite']))
    .max(3)
    .optional()
    .meta({
      description:
        'Workplace modes matched with OR. Allowed values: remote, hybrid, onsite. Pass [] to clear this filter.',
    }),
  contracts: z
    .array(z.enum(['b2b', 'employment', 'service-contract', 'internship']))
    .max(4)
    .optional()
    .meta({
      description:
        'Contract types matched with OR. Allowed values: b2b, employment, service-contract, internship. Pass [] to clear this filter.',
    }),
  salaryMin: z.number().finite().nonnegative().optional().meta({
    description:
      'Minimum monthly gross salary in USD. Offers in other currencies are excluded while this filter is active. Omit to preserve the current value; pass 0 to clear it.',
  }),
  sort: z
    .enum(['newest', 'oldest', 'salary-desc', 'salary-asc', 'deadline', 'distance'])
    .optional()
    .meta({
      description:
        'Result ordering. Allowed values: newest, oldest, salary-desc, salary-asc, deadline, distance. distance needs a location from search_jobs; newest restores the default.',
    }),
});
