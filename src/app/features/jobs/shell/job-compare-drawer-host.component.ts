import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppLinks } from '@core/app-paths';
import { FilterDrawerComponent } from '@shared/ui/filter-drawer/filter-drawer.component';
import { JobCompareStore } from '@features/jobs/state/job-compare.store';
import { JobComparePanelComponent } from '@features/jobs/ui/job-compare-panel/job-compare-panel.component';

@Component({
  selector: 'app-job-compare-drawer-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterDrawerComponent, JobComparePanelComponent],
  template: `
    <app-filter-drawer
      [open]="compareStore.isOpen()"
      [title]="compareStore.presentation()?.title ?? 'Offer comparison'"
      [wide]="true"
      (closed)="onClose()"
    >
      @if (compareStore.presentation(); as presentation) {
        <app-job-compare-panel
          [summary]="presentation.summary"
          [offers]="presentation.offers"
          [loading]="compareStore.loading()"
          (offerSelected)="onOfferSelected($event)"
        />
      }
    </app-filter-drawer>
  `,
})
export class JobCompareDrawerHostComponent {
  readonly compareStore = inject(JobCompareStore);

  private readonly router = inject(Router);

  onClose(): void {
    this.compareStore.dismiss();
  }

  onOfferSelected(jobId: string): void {
    this.compareStore.dismiss();
    void this.router.navigate(AppLinks.job(jobId));
  }
}
