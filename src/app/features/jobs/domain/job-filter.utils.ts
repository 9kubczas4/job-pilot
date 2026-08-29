import { JobOffer } from './job.model';

export function extractTopSkills(jobs: JobOffer[], limit = 12): string[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const job of jobs) {
    for (const competency of job.competencies) {
      const key = competency.name.trim().toLowerCase();
      if (!key) {
        continue;
      }

      const current = counts.get(key);
      if (current) {
        current.count += 1;
      } else {
        counts.set(key, { label: competency.name.trim(), count: 1 });
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map((entry) => entry.label);
}

export function toggleArrayCriteria<T>(current: T[] | undefined, value: T): T[] | undefined {
  const next = new Set(current ?? []);

  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return next.size ? [...next] : undefined;
}

export function isArrayCriteriaActive<T>(current: T[] | undefined, value: T): boolean {
  return current?.includes(value) ?? false;
}
