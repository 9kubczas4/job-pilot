import { computed, inject, Injectable, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { FIREBASE } from '@core/infrastructure/firebase/firebase.providers';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebase = inject(FIREBASE);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly userId = computed(() => this.user()?.uid ?? null);

  constructor() {
    onAuthStateChanged(this.firebase.auth, (user) => {
      this.user.set(user);
      this.loading.set(false);
    });
  }

  async signIn(): Promise<void> {
    if (environment.useFirebaseEmulators) {
      await signInAnonymously(this.firebase.auth);
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
}
