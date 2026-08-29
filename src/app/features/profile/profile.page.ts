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
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
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
