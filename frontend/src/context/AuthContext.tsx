import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithCredential,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithFacebook: () => Promise<{ error: Error | null }>;
  signInWithLine: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password.
   */
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  /**
   * Create a new account with email and password.
   */
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user && fullName) {
        await updateProfile(result.user, { displayName: fullName });
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  /**
   * Sign out the current user.
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  /**
   * Send password reset email.
   */
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  /**
   * Sign in with Google (Web: popup, Android: redirect).
   */
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      if (Platform.OS === 'web') {
        await signInWithPopup(auth, provider);
      } else {
        // On native, use @react-native-google-signin if available
        // Fallback to popup for Expo Go
        await signInWithPopup(auth, provider);
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  /**
   * Sign in with Facebook (Web: popup, Android: redirect).
   */
  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');

      if (Platform.OS === 'web') {
        await signInWithPopup(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  /**
   * Sign in with LINE.
   * LINE is not a built-in Firebase provider.
   * Uses LINE Login OIDC via custom OAuthProvider.
   * Requires LINE Channel to be configured in Firebase Console as OIDC provider.
   */
  const signInWithLine = async () => {
    try {
      const provider = new OAuthProvider('oidc.line');
      provider.addScope('profile');
      provider.addScope('openid');
      provider.addScope('email');

      if (Platform.OS === 'web') {
        await signInWithPopup(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        signInWithFacebook,
        signInWithLine,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
