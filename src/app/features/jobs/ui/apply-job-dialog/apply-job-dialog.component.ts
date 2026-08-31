import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  readonly initialNote = input('');
  readonly submitting = input(false);

  readonly closed = output<void>();
  readonly confirmed = output<string>();

  readonly note = signal('');
  readonly canSubmit = computed(() => this.note().trim().length > 0);

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>('dialog');
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.note.set(this.initialNote());
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
    if (this.submitting() || !this.canSubmit()) {
      return;
    }

    this.confirmed.emit(this.note().trim());
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
