import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-filter-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-drawer.component.html',
  styleUrl: './filter-drawer.component.scss',
})
export class FilterDrawerComponent {
  readonly open = input(false);
  readonly title = input('Filters');
  readonly closed = output<void>();

  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.onOpen();
      } else {
        this.onClose();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.requestClose();
    }
  }

  requestClose(): void {
    this.closed.emit();
  }

  private onOpen(): void {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    queueMicrotask(() => this.panelRef()?.nativeElement.focus());
  }

  private onClose(): void {
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
  }
}
