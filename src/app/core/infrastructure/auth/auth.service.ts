import { computed, inject, Injectable, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { DEMO_ACCOUNTS, DemoAccountId } from '@shared/models/demo-accounts';
import { FIREBASE } from '@core/infrastructure/firebase/firebase.providers';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebase = inject(FIREBASE);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly userId = computed(() => this.user()?.uid ?? null);
  readonly demoAccounts = environment.useFirebaseEmulators ? DEMO_ACCOUNTS : [];
  readonly displayName = computed(() => {
    const user = this.user();
    if (!user) return null;
    return user.displayName ?? this.demoAccounts.find((account) => account.email === user.email)?.name ?? null;
  });

  constructor() {
    onAuthStateChanged(this.firebase.auth, (user) => {
      this.user.set(user);
      this.loading.set(false);
    });
  }

  async signIn(accountId: DemoAccountId = DEMO_ACCOUNTS[0].id): Promise<void> {
    if (environment.useFirebaseEmulators) {
      const account = DEMO_ACCOUNTS.find((entry) => entry.id === accountId);
      if (!account) throw new Error('Unknown demo account.');

      // These credentials only exist in the local Auth emulator. A named account
      // keeps the same Firebase UID when opened in another browser.
      const password = `job-pilot-local-${account.id}`;
      const anonymousUser = this.firebase.auth.currentUser;
      if (anonymousUser?.isAnonymous) {
        try {
          await linkWithCredential(anonymousUser, EmailAuthProvider.credential(account.email, password));
          return;
        } catch (error) {
          if (!this.isFirebaseError(error, 'auth/email-already-in-use', 'auth/credential-already-in-use')) throw error;
        }
      }
      try {
        await signInWithEmailAndPassword(this.firebase.auth, account.email, password);
      } catch (error) {
        if (!this.isFirebaseError(error, 'auth/invalid-credential', 'auth/user-not-found')) throw error;
        try {
          await createUserWithEmailAndPassword(this.firebase.auth, account.email, password);
        } catch (createError) {
          if (!this.isFirebaseError(createError, 'auth/email-already-in-use')) throw createError;
          await signInWithEmailAndPassword(this.firebase.auth, account.email, password);
        }
      }
      return;
    }

    await signInWithPopup(this.firebase.auth, new GoogleAuthProvider());
  }

  async signOut(): Promise<void> {
    await signOut(this.firebase.auth);
  }

  requireUserId(): string {
    const id = this.userId();
    if (!id) {
      throw new Error('Authentication required.');
    }
    return id;
  }

  private isFirebaseError(error: unknown, ...codes: string[]): boolean {
    return typeof error === 'object' && error !== null && 'code' in error &&
      typeof error.code === 'string' && codes.includes(error.code);
  }
}
