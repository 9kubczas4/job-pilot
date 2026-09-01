import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CONTRACT_OPTIONS, SENIORITY_OPTIONS } from '@features/jobs/domain/job-options';
import {
  isArrayCriteriaActive,
  toggleArrayCriteria,
} from '@features/jobs/domain/job-filter.utils';
import {
  formatContractType,
  formatSeniorityLevel,
  formatTagLabel,
  formatWorkplaceMode,
  formatWorkSchedule,
} from '@features/jobs/domain/job-formatters';
import { ContractType, SeniorityLevel, WorkSchedule, WorkplaceMode } from '@features/jobs/domain/job.model';
import { JobSearchCriteria } from '@features/jobs/domain/search.model';

const WORK_SCHEDULE_OPTIONS = [
  { value: 'full-time' as const, label: 'Full-time' },
  { value: 'part-time' as const, label: 'Part-time' },
  { value: 'freelance' as const, label: 'Freelance' },
];

const SALARY_MIN_OPTIONS = [
  { value: 4000, label: '4k+' },
  { value: 6000, label: '6k+' },
  { value: 8000, label: '8k+' },
  { value: 10000, label: '10k+' },
  { value: 12000, label: '12k+' },
];

@Component({
  selector: 'app-job-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './job-filters.component.html',
  styleUrl: './job-filters.component.scss',
})
export class JobFiltersComponent {
  readonly criteria = input.required<JobSearchCriteria>();
  readonly topSkills = input<string[]>([]);

  readonly criteriaChange = output<Partial<JobSearchCriteria>>();
  readonly chipRemoved = output<string>();
  readonly clearAll = output<void>();

  readonly workplaceOptions = ['remote', 'hybrid', 'onsite'] as const;
  readonly seniorityOptions = SENIORITY_OPTIONS;
  readonly contractOptions = CONTRACT_OPTIONS;
  readonly scheduleOptions = WORK_SCHEDULE_OPTIONS;
  readonly salaryMinOptions = SALARY_MIN_OPTIONS;

  readonly formatWorkplaceMode = formatWorkplaceMode;
  readonly formatSeniorityLevel = formatSeniorityLevel;
  readonly formatContractType = formatContractType;
  readonly formatWorkSchedule = formatWorkSchedule;
  readonly formatTagLabel = formatTagLabel;

  isWorkplaceActive(option: WorkplaceMode): boolean {
    return isArrayCriteriaActive(this.criteria().workplace, option);
  }

  toggleWorkplace(option: WorkplaceMode): void {
    const criteria = this.criteria();
    this.criteriaChange.emit({
      workplace: toggleArrayCriteria(criteria.workplace, option),
    });
  }

  isSeniorityActive(option: SeniorityLevel): boolean {
    return isArrayCriteriaActive(this.criteria().seniority, option);
  }

  toggleSeniority(option: SeniorityLevel): void {
    const criteria = this.criteria();
    this.criteriaChange.emit({
      seniority: toggleArrayCriteria(criteria.seniority, option),
    });
  }

  isContractActive(option: ContractType): boolean {
    return isArrayCriteriaActive(this.criteria().contracts, option);
  }

  toggleContract(option: ContractType): void {
    const criteria = this.criteria();
    this.criteriaChange.emit({
      contracts: toggleArrayCriteria(criteria.contracts, option),
    });
  }

  isScheduleActive(option: WorkSchedule): boolean {
    return isArrayCriteriaActive(this.criteria().workSchedules, option);
  }

  toggleSchedule(option: WorkSchedule): void {
    const criteria = this.criteria();
    this.criteriaChange.emit({
      workSchedules: toggleArrayCriteria(criteria.workSchedules, option),
    });
  }

  isSkillActive(skill: string): boolean {
    return isArrayCriteriaActive(this.criteria().skills, skill);
  }

  toggleSkill(skill: string): void {
    const criteria = this.criteria();
    this.criteriaChange.emit({
      skills: toggleArrayCriteria(criteria.skills, skill),
    });
  }

  isSalaryMinActive(value: number): boolean {
    return this.criteria().salaryMin === value;
  }

  toggleSalaryMin(value: number): void {
    const current = this.criteria().salaryMin;
    this.criteriaChange.emit({
      salaryMin: current === value ? undefined : value,
    });
  }

  activeChips(): { key: string; label: string }[] {
    const criteria = this.criteria();
    const chips: { key: string; label: string }[] = [];

    if (criteria.query) {
      chips.push({ key: 'query', label: criteria.query });
    }
    if (criteria.locations?.length) {
      const radius = criteria.radiusMi;
      const label =
        radius != null && criteria.locationLat != null
          ? `${criteria.locations[0]} · ${radius} mi`
          : criteria.locations[0];
      chips.push({ key: 'location', label });
    }
    criteria.workplace?.forEach((mode) =>
      chips.push({ key: `workplace:${mode}`, label: formatWorkplaceMode(mode) }),
    );
    criteria.seniority?.forEach((level) =>
      chips.push({ key: `seniority:${level}`, label: formatSeniorityLevel(level) }),
    );
    criteria.contracts?.forEach((contract) =>
      chips.push({ key: `contract:${contract}`, label: formatContractType(contract) }),
    );
    criteria.workSchedules?.forEach((schedule) =>
      chips.push({ key: `schedule:${schedule}`, label: formatWorkSchedule(schedule) }),
    );
    criteria.skills?.forEach((skill) =>
      chips.push({ key: `skill:${skill}`, label: formatTagLabel(skill) }),
    );
    if (criteria.salaryMin != null) {
      chips.push({
        key: 'salaryMin',
        label: `From ${Math.round(criteria.salaryMin / 1000)}k USD`,
      });
    }

    return chips;
  }

  removeChip(key: string): void {
    this.chipRemoved.emit(key);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }
}
