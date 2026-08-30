import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export type SaveJobButtonVariant = 'card' | 'details';

@Component({
  selector: 'app-save-job-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.save-job-button-host--card]': 'variant() === "card"',
    '[class.save-job-button-host--details]': 'variant() === "details"',
    '[class.save-job-button-host--compact]': 'compact()',
  },
  template: `
    <button
      type="button"
      class="save-job-button"
      [class.is-saved]="saved()"
      [class.is-pulsing]="pulsing()"
      [attr.aria-label]="saved() ? 'Remove from saved jobs' : 'Save job'"
      [attr.aria-pressed]="saved()"
      (click)="onClick($event)"
      (mousedown)="$event.preventDefault()"
    >
      <svg class="save-job-button__icon" viewBox="0 0 24 24" [attr.width]="iconSize()" [attr.height]="iconSize()" aria-hidden="true">
        <path
          d="M12 20.5s-6.7-4.35-9-8.05C1.5 9.65 2.6 6.5 5.4 5.4c1.75-.7 3.7-.15 4.95 1.25L12 8.5l1.65-1.85c1.25-1.4 3.2-1.95 4.95-1.25 2.8 1.1 3.9 4.25 2.4 7.05-2.3 3.7-9 8.05-9 8.05Z"
          [attr.fill]="saved() ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  `,
  styleUrl: './save-job-button.component.scss',
})
export class SaveJobButtonComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly saved = input(false);
  readonly variant = input<SaveJobButtonVariant>('card');
  readonly compact = input(false);

  readonly toggleSave = output<void>();

  readonly pulsing = signal(false);

  private savedSnapshot: boolean | undefined;
  private pulseTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const saved = this.saved();

      if (this.savedSnapshot === undefined) {
        this.savedSnapshot = saved;
        return;
      }

      if (saved === this.savedSnapshot) {
        return;
      }

      this.savedSnapshot = saved;
      this.triggerPulse();
    });

    this.destroyRef.onDestroy(() => {
      if (this.pulseTimer) {
        clearTimeout(this.pulseTimer);
      }
    });
  }

  iconSize(): number {
    return this.variant() === 'details' ? 20 : 18;
  }

  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleSave.emit();
  }

  private triggerPulse(): void {
    if (this.pulseTimer) {
      clearTimeout(this.pulseTimer);
    }

    this.pulsing.set(true);
    this.pulseTimer = setTimeout(() => {
      this.pulsing.set(false);
      this.pulseTimer = null;
    }, 420);
  }
}
