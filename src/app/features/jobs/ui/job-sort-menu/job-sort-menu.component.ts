import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import {
  DEFAULT_JOB_SORT,
  availableSortOptions,
  JOB_SORT_OPTIONS,
} from '../../domain/job-sort.utils';
import { JobSortOption } from '../../domain/search.model';
import { JobSearchStore } from '../../state/job-search.store';

@Component({
  selector: 'app-job-sort-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  templateUrl: './job-sort-menu.component.html',
  styleUrl: './job-sort-menu.component.scss',
})
export class JobSortMenuComponent {
  private readonly store = inject(JobSearchStore);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly panelOpen = signal(false);
  readonly sortOptions = computed(() => availableSortOptions(this.store.criteria()));
  readonly currentSort = computed(() => this.store.criteria().sort ?? DEFAULT_JOB_SORT);
  readonly currentLabel = computed(() => {
    const sort = this.currentSort();
    return JOB_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Newest first';
  });

  togglePanel(event: Event): void {
    event.stopPropagation();
    this.panelOpen.update((open) => !open);
  }

  selectSort(value: JobSortOption): void {
    this.store.patchCriteria({
      sort: value === DEFAULT_JOB_SORT ? undefined : value,
    });
    this.panelOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    if (!this.panelOpen()) {
      return;
    }

    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) {
      return;
    }

    this.panelOpen.set(false);
  }
}
