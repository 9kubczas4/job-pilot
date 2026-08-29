import {
  ContractType,
  SalaryCurrency,
  SeniorityLevel,
  WorkplaceMode,
} from '../../jobs/domain/job.model';

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
