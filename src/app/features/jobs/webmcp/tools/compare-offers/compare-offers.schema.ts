import { z } from 'zod';

const COMPARE_OFFERS_ENTRY_SCHEMA = z.strictObject({
  jobId: z.string().trim().min(1).max(128).meta({
    description:
      'The unique job identifier returned by search_jobs, get_jobs, or get_saved_jobs (for example, job-001).',
  }),
  badge: z.string().trim().min(1).max(64).optional().meta({
    description:
      'Optional free-text badge for this offer (for example, najlepsza, interesujaca, rozwojowa). Omit when no badge is needed.',
  }),
  note: z.string().trim().max(500).optional().meta({
    description:
      'Optional short note explaining why this badge or ranking applies to this offer. Maximum 500 characters.',
  }),
  highlighted: z.boolean().optional().meta({
    description:
      'When true, visually emphasize this offer with an animated gradient border and star icon. Use for the single primary recommendation; at most one offer may be highlighted.',
  }),
});

export const COMPARE_OFFERS_INPUT_SCHEMA = z
  .strictObject({
    title: z.string().trim().min(1).max(120).optional().meta({
      description:
        'Optional drawer heading shown above the comparison. Defaults to "Offer comparison" when omitted.',
    }),
    summary: z.string().trim().min(1).max(2000).meta({
      description:
        'Overall agent analysis or recommendation shown at the top of the drawer. Maximum 2,000 characters.',
    }),
    offers: z
      .array(COMPARE_OFFERS_ENTRY_SCHEMA)
      .min(2)
      .max(5)
      .refine((offers) => new Set(offers.map((offer) => offer.jobId)).size === offers.length, {
        message: 'Each jobId may appear only once in offers.',
      })
      .refine((offers) => offers.filter((offer) => offer.highlighted).length <= 1, {
        message: 'At most one offer may be highlighted.',
      })
      .meta({
        description:
          'Two to five offers to compare. Each entry needs a jobId and may include an optional badge and note.',
      }),
  });

export type CompareOffersInput = z.output<typeof COMPARE_OFFERS_INPUT_SCHEMA>;
