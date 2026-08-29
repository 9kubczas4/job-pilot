import { CandidateProfile, ProfileFormModel } from './profile.model';
import { isFutureMonthValue } from './month-date.utils';

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

export function profileToFormModel(
  profile: CandidateProfile,
  googleName: { firstName?: string; lastName?: string },
): ProfileFormModel {
  return {
    firstName: profile.firstName?.trim() || googleName.firstName || '',
    lastName: profile.lastName?.trim() || googleName.lastName || '',
    headline: profile.headline?.trim() || '',
    workHistory: (profile.workHistory ?? []).map((entry) => ({
      company: entry.company ?? '',
      title: entry.title ?? '',
      startDate: entry.startDate ?? '',
      endDate: entry.endDate ?? '',
      current: entry.current ?? false,
      description: entry.description ?? '',
    })),
    skills: profile.skills.map((skill) => ({ ...skill })),
    preferredRoles: profile.preferredRoles.join(', '),
    preferredLocations: profile.preferredLocations.join(', '),
    preferredSeniorities: [...profile.preferredSeniorities],
    workplacePreferences: [...profile.workplacePreferences],
    contractPreferences: [...profile.contractPreferences],
    salaryExpectation: profile.salaryExpectation
      ? { min: profile.salaryExpectation.min ?? 0, currency: profile.salaryExpectation.currency }
      : { min: 0, currency: 'USD' },
    preferences: profile.preferences?.trim() || '',
  };
}

export function formModelToCandidateProfile(
  formValue: ProfileFormModel,
  googleName: { firstName?: string; lastName?: string },
): CandidateProfile {
  return {
    id: '',
    firstName: formValue.firstName?.trim() || googleName.firstName,
    lastName: formValue.lastName?.trim() || googleName.lastName,
    headline: formValue.headline?.trim() || undefined,
    workHistory: formValue.workHistory
      .filter((entry) => entry.company.trim() || entry.title.trim())
      .map((entry) => ({
        company: entry.company.trim(),
        title: entry.title.trim(),
        startDate: entry.startDate?.trim() || undefined,
        endDate: entry.current ? undefined : entry.endDate?.trim() || undefined,
        current: entry.current ?? false,
        description: entry.description?.trim() || undefined,
      })),
    skills: formValue.skills
      .filter((skill) => skill.name.trim())
      .map((skill) => ({
        name: skill.name.trim(),
        years: Math.min(5, Math.max(1, Math.round(skill.years ?? 3))),
      })),
    preferredRoles: splitCsv(formValue.preferredRoles),
    preferredSeniorities: formValue.preferredSeniorities,
    preferredLocations: splitCsv(formValue.preferredLocations),
    workplacePreferences: formValue.workplacePreferences,
    contractPreferences: formValue.contractPreferences,
    salaryExpectation: {
      min: formValue.salaryExpectation.min || undefined,
      currency: formValue.salaryExpectation.currency,
    },
    preferences: formValue.preferences?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };
}

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
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

    if (isFutureMonthValue(entry.startDate)) {
      errors.push(`Experience entry ${index + 1}: start date cannot be in the future.`);
    }

    if (isFutureMonthValue(entry.endDate)) {
      errors.push(`Experience entry ${index + 1}: end date cannot be in the future.`);
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
