import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderUiStore } from '../../state/header-ui.store';

@Component({
  selector: 'app-job-header-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    headerActions: '',
  },
  template: `
    @if (headerUi.filtersEnabled()) {
      <button
        type="button"
        class="header-action"
        [class.header-action--active]="headerUi.filtersOpen()"
        [attr.aria-expanded]="headerUi.filtersOpen()"
        aria-controls="app-filter-drawer"
        (click)="headerUi.toggleFilters()"
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
        @if (headerUi.activeFilterCount() > 0) {
          <span class="header-action__badge" aria-label="{{ headerUi.activeFilterCount() }} active filters">
            {{ headerUi.activeFilterCount() }}
          </span>
        }
      </button>
    }
  `,
  styleUrl: './job-header-filters.component.scss',
})
export class JobHeaderFiltersComponent {
  readonly headerUi = inject(HeaderUiStore);
}
