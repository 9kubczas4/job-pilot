import { describe, expect, it } from 'vitest';
import { JobOffer } from '@features/jobs/domain/job.model';
import { buildJobMapPopupHtml } from './job-map-popup';

const JOB: JobOffer = {
  id: 'job-001',
  title: 'Frontend Developer',
  company: { id: 'acme', name: 'Acme' },
  description: 'Angular role.',
  seniority: ['senior'],
  competencies: [{ name: 'Angular', level: 5 }],
  workSchedules: ['full-time'],
  contractTypes: ['b2b'],
  workplace: 'hybrid',
  location: {
    city: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
  },
  responsibilities: [],
  requirements: [],
  createdAt: '2026-08-28T00:00:00.000Z',
};

describe('buildJobMapPopupHtml', () => {
  it('adds the AI highlight animation hook only when explicitly requested', () => {
    const regularPopup = buildJobMapPopupHtml(JOB);
    const highlightedPopup = buildJobMapPopupHtml(JOB, { aiHighlighted: true });

    expect(regularPopup).not.toContain('job-map-popup--ai-highlighted');
    expect(highlightedPopup).toContain(
      'class="job-map-popup job-map-popup--ai-highlighted"',
    );
  });
});
