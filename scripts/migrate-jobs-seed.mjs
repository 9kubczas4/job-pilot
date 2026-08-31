import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeCompetencies } from './lib/job-competency.utils.mjs';

const SENIORITY_MAP = {
  mid: 'regular',
  lead: 'expert',
  staff: 'expert',
};

const WORK_SCHEDULES = ['full-time', 'part-time', 'freelance'];

const path = new URL('../src/assets/seed/jobs.json', import.meta.url);
const jobs = JSON.parse(readFileSync(path, 'utf8'));

const migrated = jobs.map((job, index) => {
  const seniority = (job.seniority ?? []).map((level) => SENIORITY_MAP[level] ?? level);
  const competencies = normalizeCompetencies(job.competencies ?? job.skills);

  const createdAt = job.createdAt ?? job.publishedAt;
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + 21 + (index % 14));

  const {
    skills: _skills,
    publishedAt: _publishedAt,
    ...rest
  } = job;

  return {
    ...rest,
    seniority,
    competencies,
    workSchedules: job.workSchedules ?? [WORK_SCHEDULES[index % WORK_SCHEDULES.length]],
    contractTypes:
      job.contractTypes ??
      (index % 4 === 0
        ? ['employment']
        : index % 4 === 1
          ? ['b2b']
          : index % 4 === 2
            ? ['b2b', 'employment']
            : ['service-contract']),
    createdAt,
    applicationDeadline: job.applicationDeadline ?? deadline.toISOString(),
  };
});

const existingIds = new Set(migrated.map((job) => job.id));

if (!existingIds.has('job-041')) {
  migrated.push({
    id: 'job-041',
    title: 'Regional Sales Manager',
    company: { id: 'retailplus', name: 'RetailPlus' },
    description:
      'Lead regional sales teams, grow key accounts, and coordinate go-to-market plans across retail partners.',
    seniority: ['senior'],
    competencies: [
      { name: 'Sales', level: 5, scale: 5 },
      { name: 'CRM', level: 4, scale: 5 },
      { name: 'Negotiation', level: 5, scale: 5 },
      { name: 'Team leadership', level: 4, scale: 5 },
    ],
    salary: { min: 12000, max: 18000, currency: 'USD', period: 'month' },
    workSchedules: ['full-time'],
    contractTypes: ['employment'],
    workplace: 'hybrid',
    location: {
      city: 'New York',
      country: 'United States',
      latitude: 40.7128,
      longitude: -74.006,
    },
    responsibilities: [
      'Own regional revenue targets',
      'Coach account executives',
      'Report pipeline health to leadership',
    ],
    requirements: [
      '5+ years in B2B sales',
      'Experience with CRM tooling',
      'Strong stakeholder management',
    ],
    benefits: ['Company car', 'Medical package'],
    createdAt: '2026-08-25T10:00:00.000Z',
    applicationDeadline: '2026-09-20T23:59:59.000Z',
  });
}

if (!existingIds.has('job-042')) {
  migrated.push({
    id: 'job-042',
    title: 'Marketing Specialist',
    company: { id: 'brandwave', name: 'BrandWave' },
    description:
      'Plan and execute multi-channel campaigns, analyze performance, and support brand growth initiatives.',
    seniority: ['regular'],
    competencies: [
      { name: 'Content marketing', level: 4, scale: 5 },
      { name: 'Google Analytics', level: 3, scale: 5 },
      { name: 'Social media', level: 4, scale: 5 },
      { name: 'Copywriting', level: 4, scale: 5 },
    ],
    salary: { min: 7000, max: 10000, currency: 'PLN', period: 'month' },
    workSchedules: ['part-time', 'freelance'],
    contractTypes: ['b2b', 'service-contract'],
    workplace: 'remote',
    responsibilities: [
      'Prepare campaign briefs',
      'Coordinate with design and sales',
      'Track KPIs and optimize channels',
    ],
    requirements: [
      '2+ years in digital marketing',
      'Portfolio of campaign work',
      'Strong written communication',
    ],
    benefits: ['Remote-first', 'Training budget'],
    createdAt: '2026-08-20T10:00:00.000Z',
    applicationDeadline: '2026-09-10T23:59:59.000Z',
  });
}

writeFileSync(path, `${JSON.stringify(migrated, null, 2)}\n`, 'utf8');
console.log(`Migrated ${migrated.length} jobs.`);
