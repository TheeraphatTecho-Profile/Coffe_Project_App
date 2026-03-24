/**
 * Unit tests for locationService.
 * Mock expo-location to test permission handling and coordinate fetching logic.
 */
import {
  requestLocationPermission,
  hasLocationPermission,
  getCurrentLocation,
  formatCoordinate,
} from '../../lib/locationService';

// Mock expo-location
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: any[]) =>
    mockRequestForegroundPermissionsAsync(...args),
  getForegroundPermissionsAsync: (...args: any[]) =>
    mockGetForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (...args: any[]) =>
    mockGetCurrentPositionAsync(...args),
  Accuracy: {
    Balanced: 3,
    High: 4,
  },
}));

describe('locationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestLocationPermission', () => {
    it('returns true when permission is granted', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      const result = await requestLocationPermission();
      expect(result).toBe(true);
    });

    it('returns false when permission is denied', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      const result = await requestLocationPermission();
      expect(result).toBe(false);
    });

    it('returns false when request throws', async () => {
      mockRequestForegroundPermissionsAsync.mockRejectedValue(new Error('fail'));
      const result = await requestLocationPermission();
      expect(result).toBe(false);
    });
  });

  describe('hasLocationPermission', () => {
    it('returns true when already granted', async () => {
      mockGetForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      const result = await hasLocationPermission();
      expect(result).toBe(true);
    });

    it('returns false when not granted', async () => {
      mockGetForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      const result = await hasLocationPermission();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    it('returns coordinate on success', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 17.487,
          longitude: 101.722,
          altitude: 850,
          accuracy: 10,
        },
      });

      const result = await getCurrentLocation();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.coordinate.latitude).toBe(17.487);
        expect(result.coordinate.longitude).toBe(101.722);
        expect(result.coordinate.altitude).toBe(850);
        expect(result.coordinate.accuracy).toBe(10);
      }
    });

    it('returns error when permission denied', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await getCurrentLocation();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ไม่ได้รับอนุญาต');
      }
    });

    it('returns error when GPS fetch throws', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetCurrentPositionAsync.mockRejectedValue(new Error('GPS unavailable'));

      const result = await getCurrentLocation();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ไม่สามารถดึงตำแหน่ง');
      }
    });

    it('uses balanced accuracy when highAccuracy is false', async () => {
      mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      mockGetCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 0, longitude: 0, altitude: null, accuracy: 50 },
      });

      await getCurrentLocation(false);
      expect(mockGetCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 3 });
    });
  });

  describe('formatCoordinate', () => {
    it('formats lat/lng without altitude', () => {
      const result = formatCoordinate({
        latitude: 17.487,
        longitude: 101.722,
        altitude: null,
        accuracy: null,
      });
      expect(result).toBe('17.487000, 101.722000');
    });

    it('includes altitude when available', () => {
      const result = formatCoordinate({
        latitude: 17.487,
        longitude: 101.722,
        altitude: 850.7,
        accuracy: 10,
      });
      expect(result).toContain('สูง 851 ม.');
    });
  });
});
