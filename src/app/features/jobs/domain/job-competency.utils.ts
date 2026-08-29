import { JobCompetency } from './job.model';

export const DEFAULT_COMPETENCY_SCALE = 5;

/** Legacy importance labels mapped to a numeric scale — no skill-name lookups. */
export const LEGACY_IMPORTANCE_LEVELS = {
  required: 4,
  'nice-to-have': 2,
} as const;

export type LegacyCompetencyImportance = keyof typeof LEGACY_IMPORTANCE_LEVELS;

export function normalizeCompetencyScale(scale?: number): number {
  return typeof scale === 'number' && scale > 0 ? Math.round(scale) : DEFAULT_COMPETENCY_SCALE;
}

export function clampCompetencyLevel(level: number, scale = DEFAULT_COMPETENCY_SCALE): number {
  return Math.min(Math.max(Math.round(level), 1), scale);
}

/** Resolve any stored level/importance value to a numeric proficiency. */
export function resolveCompetencyLevel(raw: unknown, scale = DEFAULT_COMPETENCY_SCALE): number {
  if (typeof raw === 'number') {
    return clampCompetencyLevel(raw, scale);
  }

  if (raw === 'nice-to-have') {
    return LEGACY_IMPORTANCE_LEVELS['nice-to-have'];
  }

  if (raw === 'required') {
    return LEGACY_IMPORTANCE_LEVELS.required;
  }

  return 3;
}

export function normalizeCompetency(raw: unknown): JobCompetency {
  if (!raw || typeof raw !== 'object') {
    return {
      name: String(raw ?? ''),
      level: 3,
      scale: DEFAULT_COMPETENCY_SCALE,
    };
  }

  const record = raw as Record<string, unknown>;
  const name = String(record['name'] ?? '');
  const scale = normalizeCompetencyScale(
    typeof record['scale'] === 'number' ? record['scale'] : undefined,
  );

  return {
    name,
    level: resolveCompetencyLevel(record['level'], scale),
    scale,
  };
}

export function normalizeCompetencies(raw: unknown): JobCompetency[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => normalizeCompetency(item));
}
