import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => 'mock-app'),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => 'mock-app'),
}));
jest.mock('firebase/auth', () => ({ getAuth: jest.fn(() => 'mock-auth') }));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => 'mock-db'),
  collection: jest.fn(),
}));

import { OfflineService } from '../../lib/offlineService';

describe('OfflineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheFarms', () => {
    it('should store farms in AsyncStorage with key offline_farms', async () => {
      const farms = [{ id: '1', name: 'Test' }];

      await OfflineService.cacheFarms(farms as any);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'offline_farms',
        JSON.stringify(farms),
      );
    });

    it('should also update last_sync_timestamp', async () => {
      const farms = [{ id: '1', name: 'Test' }];

      await OfflineService.cacheFarms(farms as any);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'last_sync_timestamp',
        expect.any(String),
      );
    });
  });

  describe('getCachedFarms', () => {
    it('should return cached farms when available', async () => {
      const farms = [{ id: '1', name: 'Cached Farm' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(farms));

      const result = await OfflineService.getCachedFarms();

      expect(result).toHaveLength(1);
      expect(result![0].name).toBe('Cached Farm');
    });

    it('should return null when no cache exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await OfflineService.getCachedFarms();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await OfflineService.getCachedFarms();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('cacheHarvests', () => {
    it('should store harvests in AsyncStorage with key offline_harvests', async () => {
      const harvests = [{ id: '1', weight_kg: 50 }];

      await OfflineService.cacheHarvests(harvests as any);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'offline_harvests',
        JSON.stringify(harvests),
      );
    });

    it('should also update last_sync_timestamp', async () => {
      const harvests = [{ id: '1', weight_kg: 50 }];

      await OfflineService.cacheHarvests(harvests as any);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'last_sync_timestamp',
        expect.any(String),
      );
    });
  });

  describe('getCachedHarvests', () => {
    it('should return cached harvests when available', async () => {
      const harvests = [{ id: '1', weight_kg: 50 }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(harvests));

      const result = await OfflineService.getCachedHarvests();

      expect(result).toHaveLength(1);
    });

    it('should return null when no cache exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await OfflineService.getCachedHarvests();

      expect(result).toBeNull();
    });
  });

  describe('getLastSyncTime', () => {
    it('should return timestamp when available', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1710000000000');

      const result = await OfflineService.getLastSyncTime();

      expect(result).toBe(1710000000000);
    });

    it('should return null when no timestamp', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await OfflineService.getLastSyncTime();

      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should remove all cached keys', async () => {
      await OfflineService.clearCache();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'offline_farms',
        'offline_harvests',
        'last_sync_timestamp',
      ]);
    });
  });

  describe('isCacheStale', () => {
    it('should return true when no sync timestamp', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await OfflineService.isCacheStale();

      expect(result).toBe(true);
    });

    it('should return false for recent cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(Date.now().toString());

      const result = await OfflineService.isCacheStale();

      expect(result).toBe(false);
    });

    it('should return true for old cache', async () => {
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(oldTimestamp.toString());

      const result = await OfflineService.isCacheStale();

      expect(result).toBe(true);
    });

    it('should accept custom maxAge', async () => {
      const recentTimestamp = Date.now() - 30 * 60 * 1000; // 30 min ago
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(recentTimestamp.toString());

      // 1 hour max age - should be fresh
      const fresh = await OfflineService.isCacheStale(60 * 60 * 1000);
      expect(fresh).toBe(false);

      // 10 min max age - should be stale
      const stale = await OfflineService.isCacheStale(10 * 60 * 1000);
      expect(stale).toBe(true);
    });
  });
});
