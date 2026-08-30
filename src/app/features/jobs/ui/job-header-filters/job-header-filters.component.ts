import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-job-header-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    headerActions: '',
  },
  template: `
    @if (enabled()) {
      <button
        type="button"
        class="header-action"
        [class.header-action--active]="open()"
        [attr.aria-expanded]="open()"
        aria-controls="app-filter-drawer"
        (click)="toggleFilters.emit()"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M4 6 H20 M7 12 H17 M10 18 H14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <span>Filters</span>
        @if (activeCount() > 0) {
          <span class="header-action__badge" aria-label="{{ activeCount() }} active filters">
            {{ activeCount() }}
          </span>
        }
      </button>
    }
  `,
  styleUrl: './job-header-filters.component.scss',
})
export class JobHeaderFiltersComponent {
  readonly enabled = input(false);
  readonly open = input(false);
  readonly activeCount = input(0);
  readonly toggleFilters = output<void>();
}
