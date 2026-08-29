import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JobOffer } from '../../domain/job.model';
import { formatSalary, formatWorkplace, formatSeniority, formatWorkSchedules, formatContractTypes, formatCompetency, formatJobDate, formatApplicationDeadline } from '../../domain/job-formatters';

@Component({
  selector: 'app-job-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss',
})
export class JobCardComponent {
  readonly job = input.required<JobOffer>();
  readonly selected = input(false);
  readonly saved = input(false);
  readonly applied = input(false);

  readonly formatSalary = formatSalary;
  readonly formatWorkplace = formatWorkplace;
  readonly formatSeniority = formatSeniority;
  readonly formatWorkSchedules = formatWorkSchedules;
  readonly formatContractTypes = formatContractTypes;
  readonly formatCompetency = formatCompetency;
  readonly formatJobDate = formatJobDate;
  readonly formatApplicationDeadline = formatApplicationDeadline;

  readonly companyInitials = computed(() => {
    const parts = this.job()
      .company.name.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
  });
}
