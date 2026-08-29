import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { JobOffer } from '../../domain/job.model';
import {
  formatSalary,
  formatWorkplaceMode,
  formatSeniorityLevel,
  formatWorkSchedule,
  formatContractType,
} from '../../domain/job-formatters';

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
  readonly compact = input(false);
  readonly showSaveButton = input(true);

  readonly toggleSave = output<void>();

  readonly formatSalary = formatSalary;
  readonly formatWorkplaceMode = formatWorkplaceMode;
  readonly formatSeniorityLevel = formatSeniorityLevel;
  readonly formatWorkSchedule = formatWorkSchedule;
  readonly formatContractType = formatContractType;

  readonly companyInitials = computed(() => {
    const parts = this.job()
      .company.name.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
  });

  onSaveClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleSave.emit();
  }
}
