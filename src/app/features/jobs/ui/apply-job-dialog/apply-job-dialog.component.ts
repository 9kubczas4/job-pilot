import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-apply-job-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  templateUrl: './apply-job-dialog.component.html',
  styleUrl: './apply-job-dialog.component.scss',
})
export class ApplyJobDialogComponent {
  readonly open = input(false);
  readonly jobTitle = input('');
  readonly companyName = input('');
  readonly submitting = input(false);

  readonly closed = output<void>();
  readonly confirmed = output<string | undefined>();

  readonly note = signal('');

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>('dialog');
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.onOpen();
        return;
      }

      this.onClose();
      this.note.set('');
    });
  }

  onEscape(): void {
    if (this.open() && !this.submitting()) {
      this.requestClose();
    }
  }

  onNoteInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement) {
      this.note.set(target.value);
    }
  }

  requestClose(): void {
    if (this.submitting()) {
      return;
    }

    this.closed.emit();
  }

  onConfirm(): void {
    if (this.submitting()) {
      return;
    }

    const value = this.note().trim();
    this.confirmed.emit(value || undefined);
  }

  private onOpen(): void {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    queueMicrotask(() => this.dialogRef()?.nativeElement.focus());
  }

  private onClose(): void {
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
  }
}
