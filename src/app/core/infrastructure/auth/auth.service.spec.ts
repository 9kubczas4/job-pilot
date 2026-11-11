import { TestBed } from '@angular/core/testing';
import { FIREBASE } from '@core/infrastructure/firebase/firebase.providers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

const firebaseAuth = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  linkWithCredential: vi.fn(),
}));

vi.mock('firebase/auth', async (importOriginal) =>
  Object.assign({}, await importOriginal<typeof import('firebase/auth')>(), firebaseAuth),
);

describe('AuthService local demo accounts', () => {
  const emulatorAuth = { currentUser: null as null | { isAnonymous: boolean } };

  beforeEach(() => {
    vi.clearAllMocks();
    emulatorAuth.currentUser = null;
    firebaseAuth.onAuthStateChanged.mockReturnValue(() => undefined);
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue({});
    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({});
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: FIREBASE, useValue: { auth: emulatorAuth } }],
    });
  });

  it('uses the same named emulator account on every sign-in', async () => {
    const auth = TestBed.inject(AuthService);

    await auth.signIn('sam');
    await auth.signIn('sam');

    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(2);
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(), 'sam@job-pilot.local', 'job-pilot-local-sam',
    );
  });

  it('creates a named account when it does not exist yet', async () => {
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    const auth = TestBed.inject(AuthService);

    await auth.signIn('alex');

    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(), 'alex@job-pilot.local', 'job-pilot-local-alex',
    );
  });

  it('signs in after another browser creates the account concurrently', async () => {
    firebaseAuth.signInWithEmailAndPassword
      .mockRejectedValueOnce({ code: 'auth/invalid-credential' })
      .mockResolvedValueOnce({});
    firebaseAuth.createUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    const auth = TestBed.inject(AuthService);

    await auth.signIn('taylor');

    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(2);
  });

  it('links an existing anonymous session so its UID and data are preserved', async () => {
    emulatorAuth.currentUser = { isAnonymous: true };
    firebaseAuth.linkWithCredential.mockResolvedValueOnce({});
    const auth = TestBed.inject(AuthService);

    await auth.signIn('alex');

    expect(firebaseAuth.linkWithCredential).toHaveBeenCalledOnce();
    expect(firebaseAuth.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });
});
