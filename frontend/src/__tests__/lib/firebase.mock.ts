/**
 * Mock for Firebase JS SDK modules used in tests.
 */

// Mock Firestore documents
export const mockDoc = {
  id: 'test-id-1',
  exists: () => true,
  data: () => ({
    name: 'Test Farm',
    area: 10,
    soilType: 'loam',
    waterSource: 'rain',
    province: 'เลย',
    district: 'ภูเรือ',
    altitude: 800,
    variety: 'Arabica',
    treeCount: 500,
    plantingYear: 2020,
    notes: null,
    userId: 'user-1',
    createdAt: { seconds: 1710000000, nanoseconds: 0 },
  }),
};

export const mockHarvestDoc = {
  id: 'harvest-1',
  exists: () => true,
  data: () => ({
    farmId: 'test-id-1',
    harvestDate: '2024-03-15',
    variety: 'Arabica',
    weightKg: 50,
    income: 5000,
    shift: 'morning',
    notes: 'Good harvest',
    userId: 'user-1',
    createdAt: { seconds: 1710000000, nanoseconds: 0 },
  }),
};

export const mockEmptyDoc = {
  id: 'empty-id',
  exists: () => false,
  data: () => null,
};

export const mockQuerySnapshot = (docs: any[]) => ({
  docs,
  size: docs.length,
  empty: docs.length === 0,
});

// Mock Firestore functions
export const mockGetDocs = jest.fn();
export const mockGetDoc = jest.fn();
export const mockAddDoc = jest.fn();
export const mockUpdateDoc = jest.fn();
export const mockDeleteDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'mock-collection'),
  doc: jest.fn(() => 'mock-doc-ref'),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  query: jest.fn((...args: any[]) => args),
  where: jest.fn((...args: any[]) => ({ type: 'where', args })),
  orderBy: jest.fn((...args: any[]) => ({ type: 'orderBy', args })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
  Timestamp: {
    now: jest.fn(),
    fromDate: jest.fn(),
  },
  getFirestore: jest.fn(() => 'mock-db'),
}));

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
  GoogleAuthProvider: jest.fn(),
  FacebookAuthProvider: jest.fn(),
  OAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithCredential: jest.fn(),
  updateProfile: jest.fn(),
}));
