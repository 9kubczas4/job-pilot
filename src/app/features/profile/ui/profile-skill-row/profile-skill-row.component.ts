import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CandidateSkill } from '@features/profile/domain/profile.model';

@Component({
  selector: 'app-profile-skill-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li class="profile-skill">
      <span class="profile-skill__name">{{ skill().name }}</span>

      <span
        class="profile-skill__level"
        role="group"
        [attr.aria-label]="'Proficiency for ' + skill().name"
      >
        @for (segment of segments(); track segment) {
          <button
            type="button"
            class="profile-skill__dot"
            [class.is-filled]="segment <= level()"
            [attr.aria-label]="'Level ' + segment"
            [attr.aria-pressed]="segment === level()"
            (click)="levelChange.emit(segment)"
          ></button>
        }
      </span>

      <button
        type="button"
        class="profile-skill__remove"
        [attr.aria-label]="'Remove ' + skill().name"
        (click)="remove.emit()"
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .profile-skill {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      max-width: 100%;
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-full);
      padding: var(--space-1) var(--space-2) var(--space-1) var(--space-3);
      background: var(--glass-surface-light);
      backdrop-filter: blur(var(--blur-glass-sm));
    }

    .profile-skill__name {
      min-width: 0;
      overflow: hidden;
      color: var(--color-text);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-skill__level {
      display: inline-flex;
      align-items: center;
      gap: 0.125rem;
      flex-shrink: 0;
    }

    .profile-skill__dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      padding: 0;
      border: 0;
      border-radius: var(--radius-full);
      background: transparent;
      cursor: pointer;
      transition: background-color var(--transition-fast);

      &::before {
        content: '';
        width: 0.5625rem;
        height: 0.5625rem;
        border-radius: var(--radius-full);
        background: var(--color-border);
        transition:
          background-color var(--transition-fast),
          transform var(--transition-fast);
      }

      &.is-filled::before {
        background: var(--color-primary);
      }

      &:hover {
        background: var(--color-primary-surface);
      }

      &:hover::before {
        transform: scale(1.15);
      }
    }

    .profile-skill__remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      margin-inline-start: calc(var(--space-1) * -1);
      border: 0;
      border-radius: var(--radius-full);
      background: transparent;
      color: var(--color-text-muted);
      font-size: var(--font-size-md);
      line-height: 1;
      cursor: pointer;
      transition:
        color var(--transition-fast),
        background-color var(--transition-fast);

      &:hover {
        background: var(--color-primary-surface);
        color: var(--color-primary);
      }
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
