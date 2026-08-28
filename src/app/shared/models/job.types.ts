export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'staff';
export type ContractType = 'b2b' | 'uop' | 'uz' | 'internship';
export type WorkplaceMode = 'remote' | 'hybrid' | 'onsite';
export type SalaryCurrency = 'PLN' | 'EUR' | 'USD';
export type SalaryPeriod = 'month' | 'year';
export type SkillLevel = 'required' | 'nice-to-have';

export interface CompanySummary {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface JobSkill {
  name: string;
  level: SkillLevel;
}

export interface JobLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface JobSalary {
  min: number;
  max: number;
  currency: SalaryCurrency;
  period: SalaryPeriod;
}

export interface JobOffer {
  id: string;
  title: string;
  company: CompanySummary;
  description: string;
  seniority: SeniorityLevel[];
  skills: JobSkill[];
  salary?: JobSalary;
  contractTypes: ContractType[];
  workplace: WorkplaceMode;
  location?: JobLocation;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  benefits?: string[];
  publishedAt: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
