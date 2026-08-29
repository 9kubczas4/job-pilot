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

export function createEmptyWorkEntry(): WorkExperienceEntry {
  return {
    company: '',
    title: '',
    current: false,
  };
}
