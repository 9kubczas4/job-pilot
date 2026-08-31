import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { ProfileRepository } from '@features/profile/data-access/profile.repository';
import { CandidateProfile } from '@features/profile/domain/profile.model';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileStore } from './profile.store';

describe('ProfileStore', () => {
  const userId = signal<string | null>('user-1');
  const profileFor = (id: string): CandidateProfile => ({
    id,
    workHistory: [],
    skills: [],
    preferredRoles: [],
    preferredSeniorities: [],
    preferredLocations: [],
    workplacePreferences: [],
    contractPreferences: [],
    updatedAt: '2026-08-31T00:00:00.000Z',
  });

  const auth = {
    userId,
    isAuthenticated: () => userId() !== null,
    requireUserId: () => {
      const id = userId();
      if (!id) throw new Error('Authentication required.');
      return id;
    },
  };
  const repository = {
    getProfile: vi.fn(),
    saveProfile: vi.fn(),
    emptyProfile: vi.fn((id: string) => profileFor(id)),
  };

  beforeEach(() => {
    userId.set('user-1');
    vi.clearAllMocks();
    repository.getProfile.mockResolvedValue(profileFor('user-1'));
    repository.saveProfile.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        ProfileStore,
        { provide: AuthService, useValue: auth },
        { provide: ProfileRepository, useValue: repository },
      ],
    });
  });

  it('reuses the loaded profile for the same authenticated user', async () => {
    const store = TestBed.inject(ProfileStore);

    const first = await store.loadProfile();
    const second = await store.loadProfile();

    expect(first).toEqual(profileFor('user-1'));
    expect(second).toBe(first);
    expect(repository.getProfile).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent loads for the same user', async () => {
    let resolveProfile!: (profile: CandidateProfile) => void;
    repository.getProfile.mockReturnValue(
      new Promise<CandidateProfile>((resolve) => {
        resolveProfile = resolve;
      }),
    );
    const store = TestBed.inject(ProfileStore);

    const first = store.loadProfile();
    const second = store.loadProfile();
    resolveProfile(profileFor('user-1'));

    await expect(Promise.all([first, second])).resolves.toEqual([
      profileFor('user-1'),
      profileFor('user-1'),
    ]);
    expect(repository.getProfile).toHaveBeenCalledTimes(1);
  });

  it('does not expose a cached profile after the authenticated user changes', async () => {
    repository.getProfile
      .mockResolvedValueOnce(profileFor('user-1'))
      .mockResolvedValueOnce(profileFor('user-2'));
    const store = TestBed.inject(ProfileStore);
    await store.loadProfile();

    userId.set('user-2');
    const secondProfile = await store.loadProfile();

    expect(secondProfile).toEqual(profileFor('user-2'));
    expect(store.profile()).toEqual(profileFor('user-2'));
    expect(repository.getProfile).toHaveBeenCalledTimes(2);
  });

  it('clears cached profile state after sign-out', async () => {
    const store = TestBed.inject(ProfileStore);
    await store.loadProfile();

    userId.set(null);

    await expect(store.loadProfile()).resolves.toBeNull();
    expect(store.profile()).toBeNull();
  });

  it('does not let an older load overwrite a profile update', async () => {
    let resolveProfile!: (profile: CandidateProfile) => void;
    repository.getProfile.mockReturnValue(
      new Promise<CandidateProfile>((resolve) => {
        resolveProfile = resolve;
      }),
    );
    const store = TestBed.inject(ProfileStore);
    const staleLoad = store.loadProfile();

    const updated = await store.updateProfile({ preferredRoles: ['Backend Developer'] });
    resolveProfile(profileFor('user-1'));

    await expect(staleLoad).resolves.toBeNull();
    expect(store.profile()).toBe(updated);
    expect(store.profile()?.preferredRoles).toEqual(['Backend Developer']);
  });
});
