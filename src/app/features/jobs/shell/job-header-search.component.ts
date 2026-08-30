import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HeaderSearchSlotComponent } from '@core/layout/header-search-slot.component';
import { HeaderSearchVariant } from '@core/layout/header-search/header-search.component';

/** Jobs feature alias for the shared app-shell header search slot. */
@Component({
  selector: 'app-job-header-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    headerSearch: '',
  },
  imports: [HeaderSearchSlotComponent],
  template: `
    <app-header-search-slot
      [jobsLink]="jobsLink()"
      [onJobsSearchPage]="onJobsSearchPage()"
      [variant]="variant()"
    />
  `,
})
export class JobHeaderSearchComponent {
  readonly jobsLink = input.required<readonly string[]>();
  readonly onJobsSearchPage = input(false);
  readonly variant = input<HeaderSearchVariant>('full');
}
