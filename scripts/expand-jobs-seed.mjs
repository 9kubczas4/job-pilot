import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeCompetencies } from './lib/job-competency.utils.mjs';

const TARGET_COUNT = 200;
const PLN_TO_USD = 0.25;

const LOCATIONS = [
  { city: 'Warsaw', country: 'Poland', latitude: 52.2297, longitude: 21.0122 },
  { city: 'Krakow', country: 'Poland', latitude: 50.0614, longitude: 19.9372 },
  { city: 'Wroclaw', country: 'Poland', latitude: 51.1079, longitude: 17.0385 },
  { city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405 },
  { city: 'Munich', country: 'Germany', latitude: 48.1351, longitude: 11.582 },
  { city: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
  { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { city: 'Dublin', country: 'Ireland', latitude: 53.3498, longitude: -6.2603 },
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { city: 'Barcelona', country: 'Spain', latitude: 41.3874, longitude: 2.1686 },
  { city: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.19 },
  { city: 'Prague', country: 'Czech Republic', latitude: 50.0755, longitude: 14.4378 },
  { city: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738 },
  { city: 'Stockholm', country: 'Sweden', latitude: 59.3293, longitude: 18.0686 },
  { city: 'Copenhagen', country: 'Denmark', latitude: 55.6761, longitude: 12.5683 },
  { city: 'Lisbon', country: 'Portugal', latitude: 38.7223, longitude: -9.1393 },
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { city: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
  { city: 'Austin', country: 'United States', latitude: 30.2672, longitude: -97.7431 },
  { city: 'Seattle', country: 'United States', latitude: 47.6062, longitude: -122.3321 },
  { city: 'Boston', country: 'United States', latitude: 42.3601, longitude: -71.0589 },
  { city: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
  { city: 'Denver', country: 'United States', latitude: 39.7392, longitude: -104.9903 },
  { city: 'Atlanta', country: 'United States', latitude: 33.749, longitude: -84.388 },
  { city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
];

const COMPANIES = [
  { id: 'acme', name: 'Acme' },
  { id: 'novatech', name: 'NovaTech' },
  { id: 'cloudscale', name: 'CloudScale' },
  { id: 'dataforge', name: 'DataForge' },
  { id: 'pixelworks', name: 'PixelWorks' },
  { id: 'stackline', name: 'Stackline' },
  { id: 'orbitsoft', name: 'OrbitSoft' },
  { id: 'nimbus', name: 'Nimbus Labs' },
  { id: 'retailplus', name: 'RetailPlus' },
  { id: 'brandwave', name: 'BrandWave' },
  { id: 'northbridge', name: 'Northbridge' },
  { id: 'bluepeak', name: 'BluePeak' },
  { id: 'vertex', name: 'Vertex Systems' },
  { id: 'helix', name: 'Helix AI' },
  { id: 'quantumleaf', name: 'QuantumLeaf' },
  { id: 'riverstone', name: 'Riverstone' },
  { id: 'brightpath', name: 'BrightPath' },
  { id: 'corelane', name: 'CoreLane' },
  { id: 'skyforge', name: 'SkyForge' },
  { id: 'opengrid', name: 'OpenGrid' },
];

const ROLE_TEMPLATES = [
  {
    title: 'Frontend Developer',
    stack: ['Angular', 'TypeScript', 'RxJS'],
    seniority: ['regular', 'senior'],
    salary: [5500, 9500],
  },
  {
    title: 'Frontend Tech Lead',
    stack: ['React', 'TypeScript', 'Next.js'],
    seniority: ['senior', 'expert'],
    salary: [9000, 13000],
  },
  {
    title: 'Staff Frontend Engineer',
    stack: ['React', 'TypeScript', 'GraphQL'],
    seniority: ['expert'],
    salary: [11000, 16000],
  },
  {
    title: 'Senior Frontend Engineer',
    stack: ['Vue', 'TypeScript', 'Pinia'],
    seniority: ['senior'],
    salary: [8000, 12000],
  },
  {
    title: 'Backend Developer',
    stack: ['Node.js', 'TypeScript', 'PostgreSQL'],
    seniority: ['regular', 'senior'],
    salary: [6000, 10000],
  },
  {
    title: 'Full Stack Engineer',
    stack: ['TypeScript', 'React', 'Node.js'],
    seniority: ['regular', 'senior'],
    salary: [7000, 11500],
  },
  {
    title: 'Cloud Engineer',
    stack: ['AWS', 'Terraform', 'Kubernetes'],
    seniority: ['senior', 'expert'],
    salary: [9500, 14000],
  },
  {
    title: 'ML Engineer',
    stack: ['Python', 'PyTorch', 'MLOps'],
    seniority: ['senior', 'expert'],
    salary: [10000, 15000],
  },
  {
    title: 'Platform Engineer',
    stack: ['Go', 'Kubernetes', 'Docker'],
    seniority: ['senior'],
    salary: [9000, 13500],
  },
  {
    title: 'DevOps Engineer',
    stack: ['CI/CD', 'AWS', 'Observability'],
    seniority: ['regular', 'senior'],
    salary: [7500, 12000],
  },
  {
    title: 'Product Designer',
    stack: ['Figma', 'Design systems', 'UX research'],
    seniority: ['regular', 'senior'],
    salary: [5500, 9000],
  },
  {
    title: 'Data Engineer',
    stack: ['Python', 'Spark', 'dbt'],
    seniority: ['regular', 'senior'],
    salary: [7000, 12500],
  },
  {
    title: 'Security Engineer',
    stack: ['AppSec', 'Cloud security', 'IAM'],
    seniority: ['senior'],
    salary: [9500, 14000],
  },
  {
    title: 'Mobile Developer',
    stack: ['React Native', 'TypeScript', 'iOS'],
    seniority: ['regular', 'senior'],
    salary: [6500, 11000],
  },
  {
    title: 'Engineering Manager',
    stack: ['Team leadership', 'Agile', 'Hiring'],
    seniority: ['senior', 'expert'],
    salary: [10000, 15500],
  },
  {
    title: 'Regional Sales Manager',
    stack: ['Sales', 'CRM', 'Negotiation'],
    seniority: ['senior'],
    salary: [5000, 8500],
  },
  {
    title: 'Marketing Specialist',
    stack: ['Content marketing', 'Google Analytics', 'Social media'],
    seniority: ['junior', 'regular'],
    salary: [3500, 6000],
  },
  {
    title: 'QA Engineer',
    stack: ['Playwright', 'TypeScript', 'Test automation'],
    seniority: ['regular', 'senior'],
    salary: [5000, 8500],
  },
  {
    title: 'Site Reliability Engineer',
    stack: ['SRE', 'Prometheus', 'Kubernetes'],
    seniority: ['senior', 'expert'],
    salary: [9500, 14500],
  },
  {
    title: 'Solutions Architect',
    stack: ['AWS', 'System design', 'Integration'],
    seniority: ['expert'],
    salary: [12000, 17000],
  },
];

const WORKPLACES = ['remote', 'hybrid', 'onsite'];
const WORK_SCHEDULES = ['full-time', 'part-time', 'freelance'];
const CONTRACT_TYPES = ['b2b', 'employment', 'service-contract', 'internship'];

function roundSalary(value) {
  return Math.round(value / 100) * 100;
}

function plnToUsd(value) {
  return roundSalary(value * PLN_TO_USD);
}

function pick(array, index) {
  return array[index % array.length];
}

function salarySpread([min, max], index) {
  const span = max - min;
  const offset = (index % 5) * Math.round(span / 8);
  return [roundSalary(min + offset), roundSalary(max + offset)];
}

function buildCompetencies(stack) {
  return stack.map((name, index) => ({
    name,
    level: 3 + (index % 3),
    scale: 5,
  }));
}

function buildJob(id, template, index) {
  const company = pick(COMPANIES, index);
  const workplace = pick(WORKPLACES, index);
  const location = pick(LOCATIONS, index + Math.floor(index / LOCATIONS.length));
  const [salaryMin, salaryMax] = salarySpread(template.salary, index);
  const createdAt = new Date('2026-07-01T08:00:00.000Z');
  createdAt.setDate(createdAt.getDate() + (index % 45));
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + 14 + (index % 21));

  const stackLabel = template.stack.slice(0, 3).join(', ');

  return {
    id,
    title: template.title,
    company,
    description: `${template.title} opportunity working with ${stackLabel} on modern product teams.`,
    seniority: template.seniority,
    salary: {
      min: salaryMin,
      max: salaryMax,
      currency: 'USD',
      period: 'month',
    },
    contractTypes: [pick(CONTRACT_TYPES, index), ...(index % 5 === 0 ? [pick(CONTRACT_TYPES, index + 1)] : [])].filter(
      (value, position, array) => array.indexOf(value) === position,
    ),
    workplace,
    location,
    responsibilities: [
      'Build product features',
      'Collaborate with design and backend',
      'Improve delivery quality',
    ],
    requirements: template.stack.map((skill) => `Strong ${skill} experience`),
    niceToHave: ['Accessibility', 'Performance tuning'],
    benefits: ['Flexible hours', 'Learning budget', workplace === 'remote' ? 'Remote stipend' : 'Office perks'],
    competencies: buildCompetencies(template.stack),
    workSchedules: [pick(WORK_SCHEDULES, index)],
    createdAt: createdAt.toISOString(),
    applicationDeadline: deadline.toISOString(),
  };
}

function migrateExistingJob(job, index) {
  const location = job.location ?? pick(LOCATIONS, index);
  const salary = job.salary
    ? {
        ...job.salary,
        currency: 'USD',
        min: job.salary.currency === 'PLN' ? plnToUsd(job.salary.min) : roundSalary(job.salary.min),
        max: job.salary.currency === 'PLN' ? plnToUsd(job.salary.max) : roundSalary(job.salary.max),
      }
    : undefined;

  return {
    ...job,
    location,
    salary,
    competencies: normalizeCompetencies(job.competencies ?? job.skills),
  };
}

const path = new URL('../src/assets/seed/jobs.json', import.meta.url);
const existing = JSON.parse(readFileSync(path, 'utf8'));
const migrated = existing.map((job, index) => migrateExistingJob(job, index));

const jobs = [...migrated];
let nextIndex = jobs.length;

while (jobs.length < TARGET_COUNT) {
  const template = pick(ROLE_TEMPLATES, nextIndex);
  const id = `job-${String(nextIndex + 1).padStart(3, '0')}`;
  jobs.push(buildJob(id, template, nextIndex));
  nextIndex += 1;
}

writeFileSync(path, `${JSON.stringify(jobs, null, 2)}\n`, 'utf8');

const remoteMissingLocation = jobs.filter((job) => job.workplace === 'remote' && !job.location).length;
console.log(`Wrote ${jobs.length} jobs. Remote without location: ${remoteMissingLocation}.`);
