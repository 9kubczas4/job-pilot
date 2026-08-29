import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CandidateSkill } from '../../domain/profile.model';

@Component({
  selector: 'app-profile-skill-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li class="profile-skill">
      <span class="profile-skill__name">{{ skill().name }}</span>
      <span class="profile-skill__level" role="group" [attr.aria-label]="skill().name + ' proficiency'">
        @for (segment of segments(); track segment) {
          <button
            type="button"
            class="profile-skill__level-btn"
            [class.is-filled]="segment <= level()"
            [class.is-active]="segment === level()"
            [attr.aria-label]="'Set ' + skill().name + ' to level ' + segment"
            [attr.aria-pressed]="segment === level()"
            (click)="levelChange.emit(segment)"
          >
            {{ segment }}
          </button>
        }
      </span>
      <button type="button" class="profile-skill__remove" aria-label="Remove skill" (click)="remove.emit()">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M8 8 L16 16 M16 8 L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </li>
  `,
  styles: `
    :host {
      display: block;
    }

    .profile-skill {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }

    .profile-skill__name {
      min-width: 5rem;
      color: var(--color-text);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }

    .profile-skill__level {
      display: inline-flex;
      flex: 1;
      flex-wrap: wrap;
      gap: var(--space-1);
    }

    .profile-skill__level-btn {
      display: grid;
      place-items: center;
      min-width: 2rem;
      height: 2rem;
      padding: 0;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface-elevated);
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
    }

    .profile-skill__level-btn.is-filled {
      border-color: rgb(37 99 235 / 0.25);
      background: var(--color-primary-subtle);
      color: var(--color-primary);
    }

    .profile-skill__level-btn.is-active {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: #fff;
    }

    .profile-skill__remove {
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      margin-left: auto;
      border: 0;
      border-radius: var(--radius-full);
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
    }

    .profile-skill__remove:hover {
      background: var(--color-surface-elevated);
      color: var(--color-text);
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
