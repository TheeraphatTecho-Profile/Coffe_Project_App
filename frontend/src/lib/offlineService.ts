import AsyncStorage from '@react-native-async-storage/async-storage';
import { Farm, Harvest } from './firebaseDb';

const FARMS_CACHE_KEY = 'offline_farms';
const HARVESTS_CACHE_KEY = 'offline_harvests';
const LAST_SYNC_KEY = 'last_sync_timestamp';

export const OfflineService = {
  async cacheFarms(farms: Farm[]): Promise<void> {
    try {
      await AsyncStorage.setItem(FARMS_CACHE_KEY, JSON.stringify(farms));
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching farms:', error);
    }
  },

  async getCachedFarms(): Promise<Farm[] | null> {
    try {
      const data = await AsyncStorage.getItem(FARMS_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached farms:', error);
      return null;
    }
  },

  async cacheHarvests(harvests: Harvest[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HARVESTS_CACHE_KEY, JSON.stringify(harvests));
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching harvests:', error);
    }
  },

  async getCachedHarvests(): Promise<Harvest[] | null> {
    try {
      const data = await AsyncStorage.getItem(HARVESTS_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached harvests:', error);
      return null;
    }
  },

  async getLastSyncTime(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return timestamp ? parseInt(timestamp) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  },

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        FARMS_CACHE_KEY,
        HARVESTS_CACHE_KEY,
        LAST_SYNC_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  async isCacheStale(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<boolean> {
    const lastSync = await this.getLastSyncTime();
    if (!lastSync) return true;
    return Date.now() - lastSync > maxAgeMs;
  },
};

export default OfflineService;
