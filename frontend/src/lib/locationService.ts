/**
 * GPS Location Service for Coffee Farm app.
 * Handles permission requests and coordinate fetching via expo-location.
 */
import * as Location from 'expo-location';

/** Represents a geographic coordinate with optional altitude. */
export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
}

/** Result wrapper for location operations. */
export type LocationResult =
  | { success: true; coordinate: GpsCoordinate }
  | { success: false; error: string };

/**
 * Request foreground location permission from the user.
 * @returns true if permission was granted, false otherwise.
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (err) {
    console.error('[locationService] Permission request failed:', err);
    return false;
  }
}

/**
 * Check whetherforeground location permission is currently granted.
 */
export async function hasLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Fetch the device's current GPS position.
 * Automatically requests permission if not yet granted.
 *
 * @param highAccuracy - If true, uses GPS hardware for higher precision
 *                       (slower, more battery). Defaults to true.
 * @returns LocationResult with coordinate or error message.
 */
export async function getCurrentLocation(
  highAccuracy = true,
): Promise<LocationResult> {
  try {
    const granted = await requestLocationPermission();
    if (!granted) {
      return {
        success: false,
        error: 'ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง กรุณาเปิดสิทธิ์ในการตั้งค่า',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: highAccuracy
        ? Location.Accuracy.High
        : Location.Accuracy.Balanced,
    });

    return {
      success: true,
      coordinate: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
      },
    };
  } catch (err) {
    console.error('[locationService] getCurrentLocation failed:', err);
    return {
      success: false,
      error: 'ไม่สามารถดึงตำแหน่งได้ กรุณาตรวจสอบว่า GPS เปิดอยู่',
    };
  }
}

/**
 * Format a coordinate pair into a human-readable Thai string.
 */
export function formatCoordinate(coord: GpsCoordinate): string {
  const lat = coord.latitude.toFixed(6);
  const lng = coord.longitude.toFixed(6);
  const alt = coord.altitude != null ? ` (สูง ${Math.round(coord.altitude)} ม.)` : '';
  return `${lat}, ${lng}${alt}`;
}
