import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ThemePreference, ThemeService } from '@core/infrastructure/theme/theme.service';

interface ThemeOption {
  value: ThemePreference;
  label: string;
}

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    '[class.theme-toggle-host--compact]': 'compact()',
  },
  template: `
    @if (compact()) {
      <button
        type="button"
        class="theme-toggle__button theme-toggle__button--solo"
        [attr.aria-label]="compactLabel()"
        [title]="compactLabel()"
        (click)="cycle()"
      >
        @switch (theme.preference()) {
          @case ('light') {
            <ng-container [ngTemplateOutlet]="lightIcon" />
          }
          @case ('dark') {
            <ng-container [ngTemplateOutlet]="darkIcon" />
          }
          @default {
            <ng-container [ngTemplateOutlet]="systemIcon" />
          }
        }
      </button>
    } @else {
      <div class="theme-toggle" role="radiogroup" aria-label="Color theme">
        @for (option of options; track option.value) {
          <button
            type="button"
            class="theme-toggle__button"
            role="radio"
            [class.is-active]="theme.preference() === option.value"
            [attr.aria-checked]="theme.preference() === option.value"
            [attr.aria-label]="option.label"
            [title]="option.label"
            (click)="select(option.value)"
          >
            @switch (option.value) {
              @case ('light') {
                <ng-container [ngTemplateOutlet]="lightIcon" />
              }
              @case ('dark') {
                <ng-container [ngTemplateOutlet]="darkIcon" />
              }
              @default {
                <ng-container [ngTemplateOutlet]="systemIcon" />
              }
            }
          </button>
        }
      </div>
    }

    <ng-template #lightIcon>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.75" fill="none" />
        <path
          d="M12 2.75 V5.25 M12 18.75 V21.25 M4.75 12 H2.25 M21.75 12 H19.25 M5.8 5.8 L7.7 7.7 M16.3 16.3 L18.2 18.2 M5.8 18.2 L7.7 16.3 M16.3 7.7 L18.2 5.8"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    </ng-template>

    <ng-template #darkIcon>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M20 14.5 A8.5 8.5 0 0 1 9.5 4 A7 7 0 1 0 20 14.5 Z"
          stroke="currentColor"
          stroke-width="1.75"
          fill="none"
          stroke-linejoin="round"
        />
      </svg>
    </ng-template>

    <ng-template #systemIcon>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <rect
          x="3.5"
          y="4.5"
          width="17"
          height="12"
          rx="1.5"
          stroke="currentColor"
          stroke-width="1.75"
          fill="none"
        />
        <path d="M8.5 19.5 H15.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      </svg>
    </ng-template>
  `,
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent {
  readonly compact = input(false);

  readonly theme = inject(ThemeService);

  readonly options: ThemeOption[] = [
    { value: 'light', label: 'Light theme' },
    { value: 'dark', label: 'Dark theme' },
    { value: 'system', label: 'System theme' },
  ];

  readonly compactLabel = computed(() => {
    const preference = this.theme.preference();
    const current = this.options.find((option) => option.value === preference);
    return current ? `${current.label}. Tap to change.` : 'Color theme';
  });

  select(preference: ThemePreference): void {
    this.theme.setPreference(preference);
  }

  cycle(): void {
    const order: ThemePreference[] = ['light', 'dark', 'system'];
    const currentIndex = order.indexOf(this.theme.preference());
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;
    this.theme.setPreference(order[nextIndex]);
  }
}
