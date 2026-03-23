/**
 * Google Authentication
 * - Web: Firebase signInWithRedirect (avoids COOP popup blocking)
 * - Native: expo-auth-session + Firebase signInWithCredential
 */

import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Check for pending Google redirect result on app load (web only).
 * Call this once at app startup to complete any in-progress redirect auth.
 */
export async function handleGoogleRedirectResult(): Promise<User | null> {
  if (Platform.OS !== 'web') return null;
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return auth.currentUser;
  } catch (err) {
    console.error('[GoogleAuth] handleGoogleRedirectResult:error', err);
    return null;
  }
}

/**
 * Sign in with Google.
 *
 * Web: Uses Firebase signInWithRedirect — redirects to Google login page,
 *      then back to the app. Avoids Cross-Origin-Opener-Policy issues.
 *
 * Native: Uses expo-auth-session to get Google ID token,
 *         then exchanges it for a Firebase credential.
 *
 * @returns Promise<{ error: Error | null }>
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  try {
    if (Platform.OS === 'web') {
      return await signInWithGoogleWeb();
    } else {
      return await signInWithGoogleNative();
    }
  } catch (err) {
    console.error('Google auth error:', err);
    return { error: err as Error };
  }
}

/**
 * Web: Firebase signInWithRedirect
 * Redirects browser to Google OAuth, then back to app.
 * Firebase handles the entire flow via authDomain/__/auth/handler.
 * getRedirectResult() picks up the result on page reload.
 */
async function signInWithGoogleWeb(): Promise<{ error: Error | null }> {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  const isLocalhost = typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (isLocalhost) {
    try {
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (err) {
      const popupError = err as Error & { code?: string };
      console.error('[GoogleAuth] signInWithGoogleWeb:popup-error', popupError);
      if (
        popupError.code !== 'auth/popup-blocked'
        && popupError.code !== 'auth/operation-not-supported-in-this-environment'
      ) {
        return { error: popupError };
      }
    }
  }

  await signInWithRedirect(auth, provider);
  // Browser will redirect away — this line won't execute until return
  return { error: null };
}

/**
 * Native: expo-auth-session + Firebase credential
 */
async function signInWithGoogleNative(): Promise<{ error: Error | null }> {
  const AuthSession = await import('expo-auth-session');
  const WebBrowser = await import('expo-web-browser');

  WebBrowser.maybeCompleteAuthSession();

  const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      'Google Web Client ID not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env'
    );
  }

  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  };

  const redirectUri = AuthSession.makeRedirectUri({
    native: 'com.coffee.project://auth',
  });

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    usePKCE: false,
    extraParams: {
      nonce: Math.random().toString(36).substring(2),
    },
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== 'success') {
    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { error: null };
    }
    throw new Error(`Google login failed: ${result.type}`);
  }

  const idToken = result.params?.id_token;
  if (!idToken) {
    throw new Error('Failed to get ID token from Google');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);

  return { error: null };
}
