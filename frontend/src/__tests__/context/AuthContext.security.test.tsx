import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';

// Mock firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => 'mock-app'),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => 'mock-app'),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => 'mock-auth'),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
  FacebookAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
  OAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
  signInWithCredential: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => 'mock-db'),
  collection: jest.fn(),
}));

import { AuthProvider, useAuth } from '../../context/AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: simulate no user signed in
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn(); // unsubscribe
    });
  });

  describe('Input Validation Security', () => {
    it('should handle empty email gracefully', async () => {
      const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
      mockSignIn.mockRejectedValue(new Error('auth/invalid-email'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn('', 'password123');
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle invalid email format', async () => {
      const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
      mockSignIn.mockRejectedValue(new Error('auth/invalid-email'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn('invalid-email', 'password123');
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle empty password gracefully', async () => {
      const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
      mockSignIn.mockRejectedValue(new Error('auth/weak-password'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn('test@example.com', '');
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle weak password during registration', async () => {
      const mockCreateUser = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
      mockCreateUser.mockRejectedValue(new Error('auth/weak-password'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signUp('test@example.com', '123');
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(300) + '@example.com';
      const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
      mockSignIn.mockRejectedValue(new Error('auth/invalid-email'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn(longEmail, 'password123');
      });
      expect(response.error).toBeInstanceOf(Error);
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle user-not-found error', async () => {
      const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
      mockSignIn.mockRejectedValue(new Error('auth/user-not-found'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn('nonexistent@example.com', 'password123');
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle wrong-password error', async () => {
      const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
      mockSignIn.mockRejectedValue(new Error('auth/wrong-password'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn('test@example.com', 'wrongpassword');
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle email-already-in-use error', async () => {
      const mockCreateUser = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
      mockCreateUser.mockRejectedValue(new Error('auth/email-already-in-use'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signUp('existing@example.com', 'password123');
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle too-many-requests error', async () => {
      const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
      mockSignIn.mockRejectedValue(new Error('auth/too-many-requests'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn('test@example.com', 'password123');
      });
      expect(response.error).toBeInstanceOf(Error);
    });
  });

  describe('Social Authentication Security', () => {
    it('should handle Google auth failure gracefully', async () => {
      const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>;
      mockSignInWithPopup.mockRejectedValue(new Error('auth/popup-closed-by-user'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signInWithGoogle();
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle Facebook auth failure gracefully', async () => {
      const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>;
      mockSignInWithPopup.mockRejectedValue(new Error('auth/popup-closed-by-user'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signInWithFacebook();
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle LINE auth failure gracefully', async () => {
      const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>;
      mockSignInWithPopup.mockRejectedValue(new Error('auth/cancelled-popup-request'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signInWithLine();
      });
      expect(response.error).toBeInstanceOf(Error);
    });
  });

  describe('Password Reset Security', () => {
    it('should handle password reset for non-existent email', async () => {
      const mockResetPassword = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;
      mockResetPassword.mockRejectedValue(new Error('auth/user-not-found'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.resetPassword('nonexistent@example.com');
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle invalid email in password reset', async () => {
      const mockResetPassword = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;
      mockResetPassword.mockRejectedValue(new Error('auth/invalid-email'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.resetPassword('invalid-email');
      });
      expect(response.error).toBeInstanceOf(Error);
    });
  });

  describe('Session Management Security', () => {
    it('should handle sign out errors gracefully', async () => {
      const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
      mockSignOut.mockRejectedValue(new Error('auth/network-request-failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // signOut returns void, so we just check it doesn't throw
      await act(async () => {
        await expect(result.current.signOut()).resolves.toBeUndefined();
      });
    });

    it('should clear user state on sign out', async () => {
      const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // First set a user
      await act(async () => {
        // Simulate successful sign in
        (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: 'test-uid', email: 'test@example.com' } });
        await result.current.signIn('test@example.com', 'password123');
      });

      // Then sign out
      await act(async () => {
        await result.current.signOut();
      });

      // User should be cleared after successful sign out
      expect(result.current.user).toBeNull();
    });
  });

  describe('Data Sanitization', () => {
    it('should handle XSS attempts in email', async () => {
      const xssEmail = '<script>alert("xss")</script>@example.com';
      const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
      mockSignIn.mockRejectedValue(new Error('auth/invalid-email'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn(xssEmail, 'password123');
      });
      expect(response.error).toBeInstanceOf(Error);
    });

    it('should handle SQL injection attempts in email', async () => {
      const sqlEmail = "'; DROP TABLE users; --@example.com";
      const mockSignIn = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
      mockSignIn.mockRejectedValue(new Error('auth/invalid-email'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn(sqlEmail, 'password123');
      });
      expect(response.error).toBeInstanceOf(Error);
    });
  });
});
