import { InjectionToken } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { environment } from '@environments/environment';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export const FIREBASE = new InjectionToken<FirebaseServices>('FIREBASE');

export function createFirebaseServices(): FirebaseServices {
  const app = initializeApp(environment.firebase);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (environment.useFirebaseEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  }

  return { app, auth, firestore };
}

export function provideFirebase() {
  return { provide: FIREBASE, useFactory: createFirebaseServices };
}
