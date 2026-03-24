import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

/**
 * Initialize Firebase app (singleton pattern).
 * Works on both Android and Web platforms.
 */
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Firebase Auth instance — used for all authentication operations.
 */
const auth: Auth = (() => {
  if (Platform.OS !== 'web') {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    return getAuth(app);
  }
})();

/**
 * Firestore instance with offline persistence.
 * - Web: IndexedDB cache via persistentLocalCache
 * - Native: local SQLite cache via persistentLocalCache
 */
const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache(),
    });
  } catch {
    return getFirestore(app);
  }
})();

export { app, auth, db };
export type FirebaseUser = import('firebase/auth').User;
