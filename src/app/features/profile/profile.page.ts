import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../../core/layout/app-shell.component';
import { AuthService } from '../../core/auth/auth.service';
import { CandidateProfile } from './domain/profile.model';
import { ProfileStore } from './state/profile.store';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, FormsModule],
  template: `
    <app-shell>
      <section class="profile">
        <header>
          <h1>Candidate profile</h1>
          <p>Human-editable profile backed by the same data exposed to Codex tools.</p>
        </header>

        @if (!auth.isAuthenticated()) {
          <p class="notice">Sign in to create and edit your profile.</p>
        } @else {
          <form class="profile-form" (ngSubmit)="save()">
            <label>
              Headline
              <input [(ngModel)]="draft.headline" name="headline" />
            </label>

            <label>
              Years of experience
              <input [(ngModel)]="draft.yearsOfExperience" name="yearsOfExperience" type="number" />
            </label>

            <label>
              Skills (comma separated)
              <input [(ngModel)]="skillsInput" name="skills" />
            </label>

            <label>
              Preferred roles (comma separated)
              <input [(ngModel)]="rolesInput" name="roles" />
            </label>

            <label>
              Preferred locations (comma separated)
              <input [(ngModel)]="locationsInput" name="locations" />
            </label>

            <label>
              Workplace preferences (remote, hybrid, onsite)
              <input [(ngModel)]="workplaceInput" name="workplace" />
            </label>

            <button type="submit" class="btn btn-primary">Save profile</button>
          </form>

          @if (message()) {
            <p class="toast">{{ message() }}</p>
          }
        }
      </section>
    </app-shell>
  `,
  styles: `
    .profile {
      max-width: 720px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    header p,
    .notice {
      color: var(--text-muted);
    }

    .profile-form {
      display: grid;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    label {
      display: grid;
      gap: 0.375rem;
      font-weight: 500;
    }

    input {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.75rem;
      font: inherit;
    }

    .toast {
      margin-top: 1rem;
      color: #047857;
    }
  `,
})
export class ProfilePageComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly profileStore = inject(ProfileStore);

  draft: Partial<CandidateProfile> = {};
  skillsInput = '';
  rolesInput = '';
  locationsInput = '';
  workplaceInput = '';
  readonly message = signal<string | null>(null);

  ngOnInit(): void {
    void this.profileStore.loadProfile().then((profile) => {
      if (!profile) {
        return;
      }
      this.draft = { ...profile };
      this.skillsInput = profile.skills.map((skill) => skill.name).join(', ');
      this.rolesInput = profile.preferredRoles.join(', ');
      this.locationsInput = profile.preferredLocations.join(', ');
      this.workplaceInput = profile.workplacePreferences.join(', ');
    });
  }

  save(): void {
    void this.profileStore
      .updateProfile({
        headline: this.draft.headline,
        yearsOfExperience: this.draft.yearsOfExperience,
        skills: this.skillsInput
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
        preferredRoles: this.splitCsv(this.rolesInput),
        preferredLocations: this.splitCsv(this.locationsInput),
        workplacePreferences: this.splitCsv(this.workplaceInput) as CandidateProfile['workplacePreferences'],
      })
      .then(() => this.message.set('Profile saved.'));
  }

  private splitCsv(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
