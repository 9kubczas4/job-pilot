import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HeaderUiStore {
  readonly filtersOpen = signal(false);
  readonly searchQuery = signal('');
  readonly activeFilterCount = signal(0);

  openFilters(): void {
    this.filtersOpen.set(true);
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }
}
