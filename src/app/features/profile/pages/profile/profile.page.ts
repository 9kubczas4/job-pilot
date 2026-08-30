import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { disabled, form, FormField, submit, applyEach } from '@angular/forms/signals';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { enableAppShellPageScroll } from '@core/layout/enable-app-shell-page-scroll';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import {
  CONTRACT_OPTIONS,
  SALARY_CURRENCY_OPTIONS,
  SENIORITY_OPTIONS,
  WORKPLACE_OPTIONS,
} from '@core/domains/jobs/job-taxonomy.options';
import {
  createEmptyProfileFormModel,
  createEmptyWorkEntry,
  ProfileFormModel,
} from '@features/profile/domain/profile.model';
import {
  formModelToCandidateProfile,
  parseDisplayName,
  profileCompleteness,
  profileDisplayName,
  profileInitials,
  profileToFormModel,
  stripUndefinedDeep,
  validateProfileDraft,
} from '@features/profile/domain/profile.utils';
import { ProfileMonthPickerComponent } from '@features/profile/ui/profile-month-picker/profile-month-picker.component';
import { ProfileSkillRowComponent } from '@features/profile/ui/profile-skill-row/profile-skill-row.component';
import { ProfileStore } from '@features/profile/state/profile.store';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    DatePipe,
    FormField,
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
export class ProfilePageComponent {
  readonly auth = inject(AuthService);
  readonly store = inject(ProfileStore);
  private readonly toast = inject(ToastService);

  readonly seniorityOptions = SENIORITY_OPTIONS;
  readonly workplaceOptions = WORKPLACE_OPTIONS;
  readonly contractOptions = CONTRACT_OPTIONS;
  readonly currencyOptions = SALARY_CURRENCY_OPTIONS;

  readonly saving = signal(false);
  readonly newSkillName = signal('');

  readonly profileModel = signal<ProfileFormModel>(createEmptyProfileFormModel());

  readonly profileForm = form(
    this.profileModel,
    (field) => {
      applyEach(field.workHistory, (entry) => {
        disabled(entry.endDate, { when: ({ valueOf }) => valueOf(entry.current) });
      });
    },
    {
      experimentalWebMcpTool: {
        name: 'update_profile',
        description:
          'Update the signed-in candidate profile. Validates input, persists changes, and refreshes the profile UI. Available on /profile only.',
      },
      submission: {
        action: async () => {
          await this.submitProfile(this.profileModel());
        },
      },
    },
  );

  private lastSyncedAt: string | null = null;

  readonly completeness = computed(() =>
    profileCompleteness(formModelToCandidateProfile(this.profileModel(), this.googleName())),
  );
  readonly displayName = computed(() =>
    profileDisplayName(
      formModelToCandidateProfile(this.profileModel(), this.googleName()),
      'Your profile',
      this.auth.user()?.displayName,
    ),
  );
  readonly initials = computed(() =>
    profileInitials(
      formModelToCandidateProfile(this.profileModel(), this.googleName()),
      this.auth.user()?.displayName,
      this.auth.user()?.email,
    ),
  );
  readonly headlinePreview = computed(() => this.profileModel().headline.trim() || null);

  constructor() {
    enableAppShellPageScroll();

    effect(() => {
      if (this.auth.loading() || !this.auth.isAuthenticated()) {
        return;
      }

      this.store.loadProfile().then((profile) => {
        if (!profile) {
          return;
        }

        this.applyProfileToForm(profile);
        this.lastSyncedAt = profile.updatedAt;
      });
    });

    effect(() => {
      const profile = this.store.profile();
      if (!profile || this.profileForm().dirty()) {
        return;
      }

      if (profile.updatedAt === this.lastSyncedAt) {
        return;
      }

      this.applyProfileToForm(profile);
      this.lastSyncedAt = profile.updatedAt;
    });
  }

  async save(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    this.saving.set(true);
    try {
      await submit(this.profileForm, async () => {
        await this.submitProfile(this.profileModel());
      });
      this.profileForm().reset();
      this.toast.show('Profile saved.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save profile. Please try again.';
      this.toast.show(message, 5000);
    } finally {
      this.saving.set(false);
    }
  }

  signIn(): void {
    this.auth.signInWithGoogle();
  }

  addSkill(): void {
    const name = this.newSkillName().trim();
    if (!name) {
      return;
    }

    this.profileModel.update((model) => ({
      ...model,
      skills: [...model.skills, { name, years: 3 }],
    }));
    this.newSkillName.set('');
  }

  removeSkill(index: number): void {
    this.profileModel.update((model) => ({
      ...model,
      skills: model.skills.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  setSkillYears(index: number, years: number): void {
    this.profileModel.update((model) => ({
      ...model,
      skills: model.skills.map((skill, itemIndex) =>
        itemIndex === index ? { ...skill, years } : skill,
      ),
    }));
  }

  addWorkEntry(): void {
    this.profileModel.update((model) => ({
      ...model,
      workHistory: [...model.workHistory, createEmptyWorkEntry()],
    }));
  }

  removeWorkEntry(index: number): void {
    this.profileModel.update((model) => ({
      ...model,
      workHistory: model.workHistory.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  private async submitProfile(formValue: ProfileFormModel): Promise<void> {
    const draft = formModelToCandidateProfile(formValue, this.googleName());
    const validationErrors = validateProfileDraft(draft);
    if (validationErrors.length) {
      throw new Error(validationErrors[0]);
    }

    const profile = await this.store.updateProfile(
      stripUndefinedDeep({
        firstName: draft.firstName,
        lastName: draft.lastName,
        headline: draft.headline,
        workHistory: draft.workHistory,
        skills: draft.skills,
        preferredRoles: draft.preferredRoles,
        preferredSeniorities: draft.preferredSeniorities,
        preferredLocations: draft.preferredLocations,
        workplacePreferences: draft.workplacePreferences,
        contractPreferences: draft.contractPreferences,
        salaryExpectation: draft.salaryExpectation,
        preferences: draft.preferences,
      }),
    );

    this.applyProfileToForm(profile);
    this.lastSyncedAt = profile.updatedAt;
  }

  private applyProfileToForm(profile: Parameters<typeof profileToFormModel>[0]): void {
    this.profileModel.set(profileToFormModel(profile, this.googleName()));
    this.profileForm().reset();
  }

  private googleName() {
    return parseDisplayName(this.auth.user()?.displayName);
  }
}
