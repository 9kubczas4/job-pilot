import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CandidateSkill } from '../../domain/profile.model';

@Component({
  selector: 'app-profile-skill-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule],
  template: `
    <li class="profile-skill">
      <span class="profile-skill__name">{{ skill().name }}</span>

      <mat-button-toggle-group
        class="profile-mat-toggle-group profile-skill__level"
        [value]="level()"
        (change)="levelChange.emit($event.value)"
        hideSingleSelectionIndicator
      >
        @for (segment of segments(); track segment) {
          <mat-button-toggle [value]="segment">{{ segment }}</mat-button-toggle>
        }
      </mat-button-toggle-group>

      <button mat-icon-button type="button" aria-label="Remove skill" (click)="remove.emit()">
        <mat-icon fontIcon="close" />
      </button>
    </li>
  `,
  styles: `
    :host {
      display: block;
    }

    .profile-skill {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }

    .profile-skill__name {
      min-width: 0;
      overflow: hidden;
      color: var(--color-text);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-skill__level {
      width: fit-content;
      max-width: 100%;
    }

    .profile-skill .mat-mdc-icon-button {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      padding: 0;
    }
  `,
})
export class ProfileSkillRowComponent {
  readonly skill = input.required<CandidateSkill>();
  readonly levelChange = output<number>();
  readonly remove = output<void>();

  readonly level = computed(() => this.skill().years ?? 3);
  readonly segments = computed(() => Array.from({ length: 5 }, (_, index) => index + 1));
}
