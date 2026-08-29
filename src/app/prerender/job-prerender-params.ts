import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface SeedJob {
  id: string;
}

export function getJobPrerenderParams(): { id: string }[] {
  const seedPath = join(process.cwd(), 'src/assets/seed/jobs.json');
  const jobs = JSON.parse(readFileSync(seedPath, 'utf-8')) as SeedJob[];
  return jobs.map((job) => ({ id: job.id }));
}
