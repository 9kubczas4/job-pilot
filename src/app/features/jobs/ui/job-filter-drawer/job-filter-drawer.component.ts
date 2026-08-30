import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterDrawerComponent } from '@shared/ui/filter-drawer/filter-drawer.component';

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
      [open]="open()"
      (closed)="closed.emit()"
    >
      <ng-content select="[filter-panel]" />
    </app-filter-drawer>
  `,
})
export class JobFilterDrawerComponent {
  readonly open = input(false);
  readonly closed = output<void>();
}
