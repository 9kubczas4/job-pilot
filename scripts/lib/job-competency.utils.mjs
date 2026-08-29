export const DEFAULT_COMPETENCY_SCALE = 5;

export const LEGACY_IMPORTANCE_LEVELS = {
  required: 4,
  'nice-to-have': 2,
};

export function normalizeCompetencyScale(scale) {
  return typeof scale === 'number' && scale > 0 ? Math.round(scale) : DEFAULT_COMPETENCY_SCALE;
}

export function clampCompetencyLevel(level, scale = DEFAULT_COMPETENCY_SCALE) {
  return Math.min(Math.max(Math.round(level), 1), scale);
}

export function resolveCompetencyLevel(raw, scale = DEFAULT_COMPETENCY_SCALE) {
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

export function normalizeCompetency(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      name: String(raw ?? ''),
      level: 3,
      scale: DEFAULT_COMPETENCY_SCALE,
    };
  }

  const scale = normalizeCompetencyScale(typeof raw.scale === 'number' ? raw.scale : undefined);

  return {
    name: String(raw.name ?? ''),
    level: resolveCompetencyLevel(raw.level, scale),
    scale,
  };
}

export function normalizeCompetencies(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => normalizeCompetency(item));
}
