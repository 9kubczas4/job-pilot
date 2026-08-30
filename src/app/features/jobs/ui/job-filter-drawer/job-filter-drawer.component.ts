import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FilterDrawerComponent } from '@shared/ui/filter-drawer/filter-drawer.component';
import { HeaderUiStore } from '../../state/header-ui.store';

@Component({
  selector: 'app-job-filter-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    filterDrawer: '',
  },
  imports: [FilterDrawerComponent],
  template: `
    <app-filter-drawer
      id="app-filter-drawer"
      [open]="headerUi.filtersEnabled() && headerUi.filtersOpen()"
      (closed)="headerUi.closeFilters()"
    >
      <ng-content select="[filter-panel]" />
    </app-filter-drawer>
  `,
})
export class JobFilterDrawerComponent {
  readonly headerUi = inject(HeaderUiStore);
}
