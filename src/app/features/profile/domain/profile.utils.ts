import { CandidateProfile } from './profile.model';

const COMPLETENESS_FIELDS: Array<(profile: CandidateProfile) => boolean> = [
  (profile) => Boolean(profile.firstName?.trim()),
  (profile) => Boolean(profile.lastName?.trim()),
  (profile) => Boolean(profile.headline?.trim()),
  (profile) => profile.workHistory.some((entry) => entry.company.trim() && entry.title.trim()),
  (profile) => profile.skills.length > 0,
  (profile) => profile.preferredRoles.length > 0,
  (profile) => profile.preferredSeniorities.length > 0,
  (profile) => profile.preferredLocations.length > 0,
  (profile) => profile.workplacePreferences.length > 0,
  (profile) => profile.contractPreferences.length > 0,
];

export function profileCompleteness(profile: CandidateProfile | null): number {
  if (!profile) {
    return 0;
  }

  const filled = COMPLETENESS_FIELDS.filter((check) => check(profile)).length;
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
}

export function initialsFromText(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '';
  }

  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function parseDisplayName(displayName: string | null | undefined): {
  firstName?: string;
  lastName?: string;
} {
  if (!displayName?.trim()) {
    return {};
  }

  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return {};
  }

  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export function profileDisplayName(
  profile: CandidateProfile | null,
  fallback = 'Your profile',
  authDisplayName?: string | null,
): string {
  if (profile) {
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    if (name) {
      return name;
    }
  }

  const authName = authDisplayName?.trim();
  return authName || fallback;
}

export function profileInitials(
  profile: CandidateProfile | null,
  authDisplayName?: string | null,
  authEmail?: string | null,
): string {
  if (profile) {
    const fromName = initialsFromText([profile.firstName, profile.lastName].filter(Boolean).join(' '));
    if (fromName) {
      return fromName;
    }

    const fromHeadline = initialsFromText(profile.headline);
    if (fromHeadline) {
      return fromHeadline.slice(0, 2);
    }
  }

  const fromAuth = initialsFromText(authDisplayName);
  if (fromAuth) {
    return fromAuth;
  }

  const emailLocal = authEmail?.split('@')[0] ?? '';
  const fromEmail = initialsFromText(emailLocal.replace(/[._-]+/g, ' '));
  if (fromEmail) {
    return fromEmail.slice(0, 2);
  }

  return 'U';
}

export function formatWorkPeriod(entry: CandidateProfile['workHistory'][number]): string {
  const start = formatMonthLabel(entry.startDate);
  const end = entry.current ? 'Present' : formatMonthLabel(entry.endDate);

  if (start && end) {
    return `${start} – ${end}`;
  }

  return start || end || '';
}

function formatMonthLabel(value?: string): string {
  if (!value?.trim()) {
    return '';
  }

  const [year, month] = value.split('-');
  if (!year || !month) {
    return value;
  }

  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(date);
}

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, stripUndefinedDeep(entry)]),
    ) as T;
  }

  return value;
}

export function validateProfileDraft(draft: CandidateProfile): string[] {
  const errors: string[] = [];

  draft.workHistory.forEach((entry, index) => {
    const hasCompany = Boolean(entry.company.trim());
    const hasTitle = Boolean(entry.title.trim());

    if (hasCompany !== hasTitle) {
      errors.push(`Experience entry ${index + 1}: add both job title and company.`);
    }

    if ((hasCompany || hasTitle) && !entry.startDate?.trim()) {
      errors.push(`Experience entry ${index + 1}: add a start date.`);
    }

    if (!entry.current && entry.endDate?.trim() && entry.startDate?.trim()) {
      if (entry.endDate < entry.startDate) {
        errors.push(`Experience entry ${index + 1}: end date must be after start date.`);
      }
    }
  });

  draft.skills.forEach((skill, index) => {
    if (!skill.name.trim()) {
      errors.push(`Skill ${index + 1}: name cannot be empty.`);
    }
  });

  const salaryMin = draft.salaryExpectation?.min;
  if (salaryMin != null && salaryMin < 0) {
    errors.push('Minimum salary cannot be negative.');
  }

  return errors;
}
