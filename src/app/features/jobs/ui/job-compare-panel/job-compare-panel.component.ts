import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppLinks } from '@core/app-paths';
import { JobCompareOfferView } from '@features/jobs/domain/job-compare.model';
import {
  formatContractType,
  formatSalary,
  formatSeniorityLevel,
  formatWorkplaceMode,
} from '@features/jobs/domain/job-formatters';

@Component({
  selector: 'app-job-compare-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './job-compare-panel.component.html',
  styleUrl: './job-compare-panel.component.scss',
})
export class JobComparePanelComponent {
  readonly summary = input.required<string>();
  readonly offers = input.required<JobCompareOfferView[]>();
  readonly loading = input(false);

  readonly offerSelected = output<string>();

  readonly jobLink = AppLinks.job;
  readonly formatSalary = formatSalary;
  readonly formatWorkplaceMode = formatWorkplaceMode;
  readonly formatSeniorityLevel = formatSeniorityLevel;
  readonly formatContractType = formatContractType;

  companyInitials(name: string): string {
    const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
  }

  onOfferClick(jobId: string): void {
    this.offerSelected.emit(jobId);
  }
}
