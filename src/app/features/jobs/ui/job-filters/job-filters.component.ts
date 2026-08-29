import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import {
  CONTRACT_OPTIONS,
  SENIORITY_OPTIONS,
} from '@features/profile/domain/profile-options';
import {
  extractTopSkills,
  isArrayCriteriaActive,
  toggleArrayCriteria,
} from '../../domain/job-filter.utils';
import {
  formatContractType,
  formatSeniorityLevel,
  formatTagLabel,
  formatWorkplaceMode,
  formatWorkSchedule,
} from '../../domain/job-formatters';
import { ContractType, SeniorityLevel, WorkSchedule, WorkplaceMode } from '../../domain/job.model';
import { JobSearchStore } from '../../state/job-search.store';

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
  readonly store = inject(JobSearchStore);
  private readonly headerUi = inject(HeaderUiStore);

  readonly workplaceOptions = ['remote', 'hybrid', 'onsite'] as const;
  readonly seniorityOptions = SENIORITY_OPTIONS;
  readonly contractOptions = CONTRACT_OPTIONS;
  readonly scheduleOptions = WORK_SCHEDULE_OPTIONS;
  readonly salaryMinOptions = SALARY_MIN_OPTIONS;

  readonly topSkills = computed(() => extractTopSkills(this.store.allJobs()));

  readonly formatWorkplaceMode = formatWorkplaceMode;
  readonly formatSeniorityLevel = formatSeniorityLevel;
  readonly formatContractType = formatContractType;
  readonly formatWorkSchedule = formatWorkSchedule;
  readonly formatTagLabel = formatTagLabel;

  isWorkplaceActive(option: WorkplaceMode): boolean {
    return isArrayCriteriaActive(this.store.criteria().workplace, option);
  }

  toggleWorkplace(option: WorkplaceMode): void {
    const criteria = this.store.criteria();
    this.store.patchCriteria({
      workplace: toggleArrayCriteria(criteria.workplace, option),
    });
  }

  isSeniorityActive(option: SeniorityLevel): boolean {
    return isArrayCriteriaActive(this.store.criteria().seniority, option);
  }

  toggleSeniority(option: SeniorityLevel): void {
    const criteria = this.store.criteria();
    this.store.patchCriteria({
      seniority: toggleArrayCriteria(criteria.seniority, option),
    });
  }

  isContractActive(option: ContractType): boolean {
    return isArrayCriteriaActive(this.store.criteria().contracts, option);
  }

  toggleContract(option: ContractType): void {
    const criteria = this.store.criteria();
    this.store.patchCriteria({
      contracts: toggleArrayCriteria(criteria.contracts, option),
    });
  }

  isScheduleActive(option: WorkSchedule): boolean {
    return isArrayCriteriaActive(this.store.criteria().workSchedules, option);
  }

  toggleSchedule(option: WorkSchedule): void {
    const criteria = this.store.criteria();
    this.store.patchCriteria({
      workSchedules: toggleArrayCriteria(criteria.workSchedules, option),
    });
  }

  isSkillActive(skill: string): boolean {
    return isArrayCriteriaActive(this.store.criteria().skills, skill);
  }

  toggleSkill(skill: string): void {
    const criteria = this.store.criteria();
    this.store.patchCriteria({
      skills: toggleArrayCriteria(criteria.skills, skill),
    });
  }

  isSalaryMinActive(value: number): boolean {
    return this.store.criteria().salaryMin === value;
  }

  toggleSalaryMin(value: number): void {
    const current = this.store.criteria().salaryMin;
    this.store.patchCriteria({
      salaryMin: current === value ? undefined : value,
    });
  }

  activeChips(): { key: string; label: string }[] {
    const criteria = this.store.criteria();
    const chips: { key: string; label: string }[] = [];

    if (criteria.query) {
      chips.push({ key: 'query', label: criteria.query });
    }
    if (criteria.locations?.length) {
      const radius = criteria.radiusKm;
      const label =
        radius != null && criteria.locationLat != null
          ? `${criteria.locations[0]} · ${radius} km`
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
    if (key === 'query') {
      this.store.patchCriteria({ query: undefined });
      this.headerUi.searchQuery.set('');
      return;
    }

    if (key === 'location') {
      this.store.patchCriteria({
        locations: undefined,
        locationLat: undefined,
        locationLng: undefined,
        radiusKm: undefined,
      });
      this.headerUi.locationQuery.set('');
      this.headerUi.locationLat.set(undefined);
      this.headerUi.locationLng.set(undefined);
      return;
    }

    if (key === 'salaryMin') {
      this.store.patchCriteria({ salaryMin: undefined });
      return;
    }

    const [type, value] = key.split(':');
    const criteria = this.store.criteria();

    if (type === 'workplace') {
      this.store.patchCriteria({
        workplace: criteria.workplace?.filter((item) => item !== value) as typeof criteria.workplace,
      });
    }
    if (type === 'seniority') {
      this.store.patchCriteria({
        seniority: criteria.seniority?.filter((item) => item !== value) as typeof criteria.seniority,
      });
    }
    if (type === 'contract') {
      this.store.patchCriteria({
        contracts: criteria.contracts?.filter((item) => item !== value) as typeof criteria.contracts,
      });
    }
    if (type === 'schedule') {
      this.store.patchCriteria({
        workSchedules: criteria.workSchedules?.filter(
          (item) => item !== value,
        ) as typeof criteria.workSchedules,
      });
    }
    if (type === 'skill') {
      this.store.patchCriteria({
        skills: criteria.skills?.filter((item) => item !== value),
      });
    }
  }
}
