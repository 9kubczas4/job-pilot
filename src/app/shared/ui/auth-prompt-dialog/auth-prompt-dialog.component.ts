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
  selector: 'app-auth-prompt-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-prompt-dialog.component.html',
  styleUrl: './auth-prompt-dialog.component.scss',
})
export class AuthPromptDialogComponent {
  readonly open = input(false);
  readonly title = input('Sign in required');
  readonly message = input('Sign in to save jobs and access your saved offers.');
  readonly confirmLabel = input('Sign in');
  readonly cancelLabel = input('Cancel');

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>('dialog');
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

  onConfirm(): void {
    this.confirmed.emit();
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
