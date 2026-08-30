import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppLinks } from '@core/app-paths';
import { HeaderSearchComponent } from '../header-search/header-search.component';

@Component({
  selector: 'app-job-header-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    headerSearch: '',
  },
  imports: [HeaderSearchComponent],
  template: `<app-header-search [jobsLink]="links.jobs" />`,
})
export class JobHeaderSearchComponent {
  readonly links = AppLinks;
}
