import { InjectionToken } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { environment } from '../../../environments/environment';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

export const FIREBASE = new InjectionToken<FirebaseServices>('FIREBASE');

export function createFirebaseServices(): FirebaseServices {
  const app = initializeApp(environment.firebase);
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
  };
}

export function provideFirebase() {
  return { provide: FIREBASE, useFactory: createFirebaseServices };
}
