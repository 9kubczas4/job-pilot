import {
  ContractType,
  SalaryCurrency,
  SeniorityLevel,
  WorkplaceMode,
} from '@features/jobs/domain/job.model';

export interface CandidateSkill {
  name: string;
  years?: number;
}

export interface WorkExperienceEntry {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface WorkExperienceFormEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface SalaryExpectation {
  min?: number;
  currency: SalaryCurrency;
}

export interface CandidateProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  workHistory: WorkExperienceEntry[];
  skills: CandidateSkill[];
  preferredRoles: string[];
  preferredSeniorities: SeniorityLevel[];
  preferredLocations: string[];
  workplacePreferences: WorkplaceMode[];
  contractPreferences: ContractType[];
  salaryExpectation?: SalaryExpectation;
  preferences?: string;
  updatedAt: string;
}

export function createEmptyWorkEntry(): WorkExperienceFormEntry {
  return {
    company: '',
    title: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  };
}

/** Editable profile fields bound to the profile Signal Form. */
export interface ProfileFormModel {
  firstName: string;
  lastName: string;
  headline: string;
  workHistory: WorkExperienceFormEntry[];
  skills: CandidateSkill[];
  preferredRoles: string;
  preferredLocations: string;
  preferredSeniorities: SeniorityLevel[];
  workplacePreferences: WorkplaceMode[];
  contractPreferences: ContractType[];
  salaryExpectation: { min: number; currency: SalaryCurrency };
  preferences: string;
}

export function createEmptyProfileFormModel(): ProfileFormModel {
  return {
    firstName: '',
    lastName: '',
    headline: '',
    workHistory: [createEmptyWorkEntry()],
    skills: [{ name: '', years: 3 }],
    preferredRoles: '',
    preferredLocations: '',
    preferredSeniorities: ['junior'],
    workplacePreferences: ['remote'],
    contractPreferences: ['b2b'],
    salaryExpectation: { min: 0, currency: 'USD' },
    preferences: '',
  };
}
