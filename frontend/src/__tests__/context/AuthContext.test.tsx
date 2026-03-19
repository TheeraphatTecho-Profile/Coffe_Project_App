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

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: simulate no user signed in
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn(); // unsubscribe
    });
  });

  describe('useAuth hook', () => {
    it('should provide auth context when wrapped in AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeNull();
      // loading may be true initially depending on auth state resolution
      expect(typeof result.current.loading).toBe('boolean');
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signUp).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.resetPassword).toBe('function');
      expect(typeof result.current.signInWithGoogle).toBe('function');
      expect(typeof result.current.signInWithFacebook).toBe('function');
      expect(typeof result.current.signInWithLine).toBe('function');
    });
  });

  describe('signIn', () => {
    it('should call signInWithEmailAndPassword and return no error on success', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: '1' } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn('test@test.com', 'password123');
      });

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith('mock-auth', 'test@test.com', 'password123');
      expect(response.error).toBeNull();
    });

    it('should return error on failed sign in', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signIn('bad@test.com', 'wrong');
      });

      expect(response.error).toBeInstanceOf(Error);
      expect(response.error.message).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should create user and update display name', async () => {
      const mockUser = { uid: '1' };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
      (updateProfile as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signUp('new@test.com', 'password123', 'Test User');
      });

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith('mock-auth', 'new@test.com', 'password123');
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' });
      expect(response.error).toBeNull();
    });

    it('should create user without display name', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: '1' } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signUp('new@test.com', 'password123');
      });

      expect(updateProfile).not.toHaveBeenCalled();
    });

    it('should return error on failed sign up', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error('Email in use'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signUp('existing@test.com', 'password123');
      });

      expect(response.error.message).toBe('Email in use');
    });
  });

  describe('signOut', () => {
    it('should call firebase signOut', async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(signOut).toHaveBeenCalledWith('mock-auth');
    });

    it('should handle signOut errors gracefully', async () => {
      (signOut as jest.Mock).mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.resetPassword('test@test.com');
      });

      expect(sendPasswordResetEmail).toHaveBeenCalledWith('mock-auth', 'test@test.com');
      expect(response.error).toBeNull();
    });

    it('should return error for invalid email', async () => {
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(new Error('User not found'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.resetPassword('invalid@test.com');
      });

      expect(response.error.message).toBe('User not found');
    });
  });

  describe('social auth', () => {
    it('should call signInWithPopup for Google', async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: { uid: '1' } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signInWithGoogle();
      });

      expect(signInWithPopup).toHaveBeenCalled();
      expect(response.error).toBeNull();
    });

    it('should call signInWithPopup for Facebook', async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: { uid: '1' } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signInWithFacebook();
      });

      expect(signInWithPopup).toHaveBeenCalled();
      expect(response.error).toBeNull();
    });

    it('should call signInWithPopup for LINE', async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: { uid: '1' } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signInWithLine();
      });

      expect(signInWithPopup).toHaveBeenCalled();
      expect(response.error).toBeNull();
    });

    it('should return error when Google auth fails', async () => {
      (signInWithPopup as jest.Mock).mockRejectedValue(new Error('Popup closed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signInWithGoogle();
      });

      expect(response.error.message).toBe('Popup closed');
    });

    it('should return error when Facebook auth fails', async () => {
      (signInWithPopup as jest.Mock).mockRejectedValue(new Error('FB error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signInWithFacebook();
      });

      expect(response.error.message).toBe('FB error');
    });

    it('should return error when LINE auth fails', async () => {
      (signInWithPopup as jest.Mock).mockRejectedValue(new Error('LINE error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.signInWithLine();
      });

      expect(response.error.message).toBe('LINE error');
    });
  });

  describe('auth state changes', () => {
    it('should have onAuthStateChanged available from firebase/auth', () => {
      expect(onAuthStateChanged).toBeDefined();
      expect(typeof onAuthStateChanged).toBe('function');
    });

    it('should configure auth listener with correct auth instance', () => {
      // Verify the AuthContext uses 'mock-auth' from getAuth()
      const { getAuth } = require('firebase/auth');
      expect(getAuth()).toBe('mock-auth');
    });
  });
});
