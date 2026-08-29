import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface SortMenuOption {
  value: string;
  label: string;
}

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
  readonly options = input.required<SortMenuOption[]>();
  readonly value = input.required<string>();

  readonly sortChange = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);

  readonly panelOpen = signal(false);
  readonly currentLabel = computed(
    () =>
      this.options().find((option) => option.value === this.value())?.label ??
      this.options()[0]?.label ??
      '',
  );

  togglePanel(event: Event): void {
    event.stopPropagation();
    this.panelOpen.update((open) => !open);
  }

  selectSort(value: string): void {
    this.sortChange.emit(value);
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
