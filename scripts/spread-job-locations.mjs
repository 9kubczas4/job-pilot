import { readFileSync, writeFileSync } from 'node:fs';
import { spreadJobLocations } from './lib/city-locations.mjs';

const jobsPath = new URL('../src/assets/seed/jobs.json', import.meta.url);
const jobs = JSON.parse(readFileSync(jobsPath, 'utf8'));
const updated = spreadJobLocations(jobs);

writeFileSync(jobsPath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');

const withLocation = updated.filter((job) => job.location);
const cities = [...new Set(withLocation.map((job) => job.location.city))];
console.log(`Updated ${withLocation.length} job locations across ${cities.join(', ')}.`);
