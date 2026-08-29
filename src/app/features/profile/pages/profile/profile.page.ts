import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import {
  CONTRACT_OPTIONS,
  SALARY_CURRENCY_OPTIONS,
  SENIORITY_OPTIONS,
  WORKPLACE_OPTIONS,
} from '../../domain/profile-options';
import { CandidateProfile, createEmptyWorkEntry, WorkExperienceEntry } from '../../domain/profile.model';
import {
  parseDisplayName,
  profileCompleteness,
  profileDisplayName,
  profileInitials,
} from '../../domain/profile.utils';
import { ProfileMonthPickerComponent } from '../../ui/profile-month-picker/profile-month-picker.component';
import { ProfileSkillRowComponent } from '../../ui/profile-skill-row/profile-skill-row.component';
import { ProfileStore } from '../../state/profile.store';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    FormsModule,
    DatePipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ProfileSkillRowComponent,
    ProfileMonthPickerComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePageComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly store = inject(ProfileStore);
  private readonly toast = inject(ToastService);

  readonly seniorityOptions = SENIORITY_OPTIONS;
  readonly workplaceOptions = WORKPLACE_OPTIONS;
  readonly contractOptions = CONTRACT_OPTIONS;
  readonly currencyOptions = SALARY_CURRENCY_OPTIONS;

  readonly saving = signal(false);
  readonly dirty = signal(false);
  readonly newSkillName = signal('');

  draft: CandidateProfile = this.emptyDraft();
  rolesInput = '';
  locationsInput = '';

  private lastSyncedAt: string | null = null;

  readonly completeness = computed(() => profileCompleteness(this.store.profile()));
  readonly displayName = computed(() =>
    profileDisplayName(this.store.profile(), 'Your profile', this.auth.user()?.displayName),
  );
  readonly initials = computed(() =>
    profileInitials(this.store.profile(), this.auth.user()?.displayName, this.auth.user()?.email),
  );
  readonly headlinePreview = computed(() => this.store.profile()?.headline?.trim() || null);

  constructor() {
    effect(() => {
      const profile = this.store.profile();
      if (!profile || this.dirty()) {
        return;
      }

      if (profile.updatedAt === this.lastSyncedAt) {
        return;
      }

      this.applyProfileToDraft(profile);
      this.lastSyncedAt = profile.updatedAt;
    });
  }

  ngOnInit(): void {
    void this.store.loadProfile().then((profile) => {
      if (!profile) {
        return;
      }

      this.applyProfileToDraft(profile);
      this.lastSyncedAt = profile.updatedAt;
    });
  }

  markDirty(): void {
    this.dirty.set(true);
  }

  async save(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    const googleName = parseDisplayName(this.auth.user()?.displayName);

    this.saving.set(true);
    try {
      const profile = await this.store.updateProfile({
        firstName: this.draft.firstName?.trim() || googleName.firstName,
        lastName: this.draft.lastName?.trim() || googleName.lastName,
        headline: this.draft.headline?.trim() || undefined,
        workHistory: this.draft.workHistory
          .filter((entry) => entry.company.trim() || entry.title.trim())
          .map((entry) => ({
            company: entry.company.trim(),
            title: entry.title.trim(),
            startDate: entry.startDate?.trim() || undefined,
            endDate: entry.current ? undefined : entry.endDate?.trim() || undefined,
            current: entry.current ?? false,
            description: entry.description?.trim() || undefined,
          })),
        skills: this.draft.skills
          .filter((skill) => skill.name.trim())
          .map((skill) => ({
            name: skill.name.trim(),
            years: Math.min(5, Math.max(1, Math.round(skill.years ?? 3))),
          })),
        preferredRoles: this.splitCsv(this.rolesInput),
        preferredSeniorities: this.draft.preferredSeniorities,
        preferredLocations: this.splitCsv(this.locationsInput),
        workplacePreferences: this.draft.workplacePreferences,
        contractPreferences: this.draft.contractPreferences,
        salaryExpectation: this.draft.salaryExpectation,
        preferences: this.draft.preferences?.trim() || undefined,
      });

      this.applyProfileToDraft(profile);
      this.lastSyncedAt = profile.updatedAt;
      this.dirty.set(false);
      this.toast.show('Profile saved.');
    } finally {
      this.saving.set(false);
    }
  }

  signIn(): void {
    void this.auth.signInWithGoogle();
  }

  addSkill(): void {
    const name = this.newSkillName().trim();
    if (!name) {
      return;
    }

    this.markDirty();
    this.draft.skills = [...this.draft.skills, { name, years: 3 }];
    this.newSkillName.set('');
  }

  removeSkill(index: number): void {
    this.markDirty();
    this.draft.skills = this.draft.skills.filter((_, itemIndex) => itemIndex !== index);
  }

  setSkillYears(index: number, years: number): void {
    this.markDirty();
    this.draft.skills = this.draft.skills.map((skill, itemIndex) =>
      itemIndex === index ? { ...skill, years } : skill,
    );
  }

  addWorkEntry(): void {
    this.markDirty();
    this.draft.workHistory = [...this.draft.workHistory, createEmptyWorkEntry()];
  }

  removeWorkEntry(index: number): void {
    this.markDirty();
    this.draft.workHistory = this.draft.workHistory.filter((_, itemIndex) => itemIndex !== index);
  }

  toggleWorkCurrent(entry: WorkExperienceEntry, current: boolean): void {
    this.markDirty();
    entry.current = current;
    if (current) {
      entry.endDate = undefined;
    }
  }

  private applyProfileToDraft(profile: CandidateProfile): void {
    const googleName = parseDisplayName(this.auth.user()?.displayName);

    this.draft = {
      ...profile,
      firstName: profile.firstName?.trim() || googleName.firstName,
      lastName: profile.lastName?.trim() || googleName.lastName,
      workHistory: (profile.workHistory ?? []).map((entry) => ({ ...entry })),
      skills: profile.skills.map((skill) => ({ ...skill })),
      preferredSeniorities: [...profile.preferredSeniorities],
      workplacePreferences: [...profile.workplacePreferences],
      contractPreferences: [...profile.contractPreferences],
      salaryExpectation: profile.salaryExpectation
        ? { ...profile.salaryExpectation }
        : { currency: 'PLN' },
    };
    this.rolesInput = profile.preferredRoles.join(', ');
    this.locationsInput = profile.preferredLocations.join(', ');
  }

  private splitCsv(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private emptyDraft(): CandidateProfile {
    return {
      id: '',
      workHistory: [],
      skills: [],
      preferredRoles: [],
      preferredSeniorities: [],
      preferredLocations: [],
      workplacePreferences: [],
      contractPreferences: [],
      salaryExpectation: { currency: 'PLN' },
      updatedAt: new Date().toISOString(),
    };
  }
}
