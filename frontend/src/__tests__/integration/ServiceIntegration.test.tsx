import React from 'react';
import { render, fireEvent, waitFor, renderHook } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import { LanguageProvider, useLanguage } from '../../context/LanguageContext';

// Mock Firebase
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
  collection: jest.fn(() => 'mock-collection'),
  doc: jest.fn(() => 'mock-doc-ref'),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn((...args) => args),
  where: jest.fn((...args) => ({ type: 'where', args })),
  orderBy: jest.fn((...args) => ({ type: 'orderBy', args })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  Timestamp: { now: jest.fn(), fromDate: jest.fn() },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <LanguageProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </LanguageProvider>
  </AuthProvider>
);

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Integration', () => {
    it('should handle signup through AuthContext', async () => {
      const mockCreateUser = require('firebase/auth').createUserWithEmailAndPassword;
      mockCreateUser.mockResolvedValue({
        user: { uid: 'test-uid', email: 'test@example.com' }
      });

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      // Test signup
      const response = await result.current.signUp('test@example.com', 'password123');
      expect(response.error).toBeNull();
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        'test@example.com',
        'password123'
      );
    });

    it('should handle authentication errors across context', async () => {
      const mockCreateUser = require('firebase/auth').createUserWithEmailAndPassword;
      mockCreateUser.mockRejectedValue(new Error('auth/email-already-in-use'));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      const response = await result.current.signUp('existing@example.com', 'password123');
      expect(response.error).toBeInstanceOf(Error);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Service Integration', () => {
    it('should integrate FarmService with user authentication', async () => {
      // Mock authenticated user
      const mockOnAuthStateChanged = require('firebase/auth').onAuthStateChanged;
      mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
        callback({ uid: 'test-uid', email: 'test@example.com' });
        return jest.fn();
      });

      // Mock Firestore operations
      const mockAddDoc = require('firebase/firestore').addDoc;
      const mockGetDoc = require('firebase/firestore').getDoc;
      
      mockAddDoc.mockResolvedValue({ id: 'new-farm-id' });
      mockGetDoc.mockResolvedValue({
        id: 'new-farm-id',
        exists: () => true,
        data: () => ({
          name: 'Test Farm',
          area: 10,
          soilType: 'loam',
          waterSource: 'river',
          province: 'เลย',
          district: 'ภูเรือ',
          altitude: 600,
          variety: 'Arabica',
          treeCount: 1000,
          plantingYear: 2020,
          notes: 'Test farm',
          userId: 'test-uid',
          createdAt: 'SERVER_TIMESTAMP',
        }),
      });

      const { FarmService } = require('../../lib/firebaseDb');
      const farmData = {
        name: 'Test Farm',
        area: 10,
        soilType: 'loam',
        waterSource: 'river',
        province: 'เลย',
        district: 'ภูเรือ',
        altitude: 600,
        variety: 'Arabica',
        treeCount: 1000,
        plantingYear: 2020,
        notes: 'Test farm',
      };

      const result = await FarmService.create('test-uid', farmData);
      
      expect(result.id).toBe('new-farm-id');
      expect(result.userId).toBe('test-uid');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...farmData,
          userId: 'test-uid',
          createdAt: 'SERVER_TIMESTAMP',
        })
      );
    });

    it('should integrate HarvestService with FarmService data', async () => {
      // Mock farm data for harvest association
      const mockGetDoc = require('firebase/firestore').getDoc;
      const mockAddDoc = require('firebase/firestore').addDoc;
      
      // Mock farm lookup
      mockGetDoc.mockImplementation((docRef: any) => {
        if (docRef.path?.includes('farms')) {
          return Promise.resolve({
            id: 'test-farm-id',
            exists: () => true,
            data: () => ({
              name: 'Test Farm',
              userId: 'test-uid',
            }),
          });
        }
        // Mock harvest creation response
        return Promise.resolve({
          id: 'new-harvest-id',
          exists: () => true,
          data: () => ({
            farmId: 'test-farm-id',
            harvestDate: '2024-03-15',
            variety: 'Arabica',
            weightKg: 50,
            income: 5000,
            shift: 'morning',
            notes: 'Good harvest',
            userId: 'test-uid',
            createdAt: 'SERVER_TIMESTAMP',
          }),
        });
      });

      mockAddDoc.mockResolvedValue({ id: 'new-harvest-id' });

      const { HarvestService } = require('../../lib/firebaseDb');
      const harvestData = {
        farmId: 'test-farm-id',
        harvestDate: '2024-03-15',
        variety: 'Arabica',
        weightKg: 50,
        income: 5000,
        shift: 'morning',
        notes: 'Good harvest',
      };

      const result = await HarvestService.create('test-uid', harvestData);
      
      expect(result.id).toBe('new-harvest-id');
      expect(result.farmId).toBe('test-farm-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...harvestData,
          userId: 'test-uid',
          createdAt: 'SERVER_TIMESTAMP',
        })
      );
    });
  });

  describe('Context Integration', () => {
    it('should provide theme context with correct structure', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: TestWrapper });

      // Test theme context provides expected properties
      expect(result.current.isDark).toBeDefined();
      expect(result.current.colors).toBeDefined();
      expect(result.current.toggleTheme).toBeDefined();
      expect(typeof result.current.toggleTheme).toBe('function');
    });

    it('should provide language context with correct structure', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper: TestWrapper });

      // Test language context provides expected properties
      expect(result.current.language).toBeDefined();
      expect(result.current.setLanguage).toBeDefined();
      expect(result.current.t).toBeDefined();
      expect(typeof result.current.setLanguage).toBe('function');
      expect(typeof result.current.t).toBe('function');
    });

    it('should provide auth context with correct structure', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      // Test auth context provides expected properties
      expect(result.current.user).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.signIn).toBeDefined();
      expect(result.current.signUp).toBeDefined();
      expect(result.current.signOut).toBeDefined();
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signUp).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
    });
  });

  describe('Error Propagation Integration', () => {
    it('should propagate Firestore errors through services to UI', async () => {
      // Mock network error
      const mockGetDocs = require('firebase/firestore').getDocs;
      mockGetDocs.mockRejectedValue(new Error('Network request failed'));

      const { FarmService } = require('../../lib/firebaseDb');

      // Error should propagate correctly
      await expect(FarmService.getAll('test-uid')).rejects.toThrow('Network request failed');
    });

    it('should handle service errors gracefully', async () => {
      // Mock service error
      const mockAddDoc = require('firebase/firestore').addDoc;
      mockAddDoc.mockRejectedValue(new Error('Permission denied'));

      const { FarmService } = require('../../lib/firebaseDb');

      // Should handle error without crashing
      const farmData = {
        name: 'Test Farm',
        area: 10,
        soil_type: 'loam',
        water_source: 'river',
        province: 'เลย',
        district: 'ภูเรือ',
        altitude: 600,
        variety: 'Arabica',
        tree_count: 1000,
        planting_year: 2020,
        notes: 'Test farm',
      };

      await expect(FarmService.create('test-uid', farmData)).rejects.toThrow('Permission denied');
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency across service operations', async () => {
      // Mock successful operations
      const mockAddDoc = require('firebase/firestore').addDoc;
      const mockGetDoc = require('firebase/firestore').getDoc;
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      
      mockAddDoc.mockResolvedValue({ id: 'test-farm-id' });
      mockGetDoc.mockResolvedValue({
        id: 'test-farm-id',
        exists: () => true,
        data: () => ({
          name: 'Test Farm',
          area: 10,
          user_id: 'test-uid',
          created_at: 'SERVER_TIMESTAMP',
        }),
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      const { FarmService } = require('../../lib/firebaseDb');

      // Create farm
      const farm = await FarmService.create('test-uid', {
        name: 'Test Farm',
        area: 10,
        soil_type: 'loam',
        water_source: 'river',
        province: 'เลย',
        district: 'ภูเรือ',
        altitude: 600,
        variety: 'Arabica',
        tree_count: 1000,
        planting_year: 2020,
        notes: 'Test farm',
      });

      // Update farm
      await FarmService.update(farm.id, { area: 15 });

      // Verify operations were called correctly
      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { area: 15 }
      );
    });
  });
});
