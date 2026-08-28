import { ContractType, SalaryCurrency, SeniorityLevel, WorkplaceMode } from './job.types';

export interface CandidateSkill {
  name: string;
  years?: number;
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
  yearsOfExperience?: number;
  skills: CandidateSkill[];
  preferredRoles: string[];
  preferredSeniorities: SeniorityLevel[];
  preferredLocations: string[];
  workplacePreferences: WorkplaceMode[];
  contractPreferences: ContractType[];
  salaryExpectation?: SalaryExpectation;
  preferences?: string;
  cvFileUrl?: string;
  updatedAt: string;
}

export interface JobApplication {
  jobId: string;
  appliedAt: string;
  note?: string;
}
