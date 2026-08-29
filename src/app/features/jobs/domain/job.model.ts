export type SeniorityLevel = 'junior' | 'regular' | 'senior' | 'expert';
export type ContractType = 'uop' | 'b2b' | 'uz' | 'internship';
export type WorkSchedule = 'full-time' | 'part-time' | 'freelance';
export type WorkplaceMode = 'remote' | 'hybrid' | 'onsite';
export type SalaryCurrency = 'PLN' | 'EUR' | 'USD';
export type SalaryPeriod = 'month' | 'year';

export interface CompanySummary {
  id: string;
  name: string;
  logoUrl?: string;
}

/** Generic domain proficiency — works for IT skills, tools, languages, etc. */
export interface JobCompetency {
  name: string;
  /** Required level on a 1–5 scale (or up to `scale`). */
  level: number;
  /** Maximum level on the scale; defaults to 5. */
  scale?: number;
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
  competencies: JobCompetency[];
  salary?: JobSalary;
  workSchedules: WorkSchedule[];
  contractTypes: ContractType[];
  workplace: WorkplaceMode;
  location?: JobLocation;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  benefits?: string[];
  createdAt: string;
  applicationDeadline?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
