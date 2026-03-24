/**
 * imageUtils — Image compression & optimization utilities.
 *
 * Uses expo-image-manipulator (if available) for native,
 * falls back to canvas-based compression for web.
 */
import { Platform } from 'react-native';

export interface CompressOptions {
  /** Max width/height in pixels. Default: 1200 */
  maxDimension?: number;
  /** JPEG quality 0-1. Default: 0.7 */
  quality?: number;
  /** Output format. Default: 'jpeg' */
  format?: 'jpeg' | 'png';
}

export interface CompressResult {
  uri: string;
  width: number;
  height: number;
  /** Estimated file size in bytes (not always accurate) */
  estimatedSize?: number;
}

/**
 * Compress an image before uploading.
 * Reduces both dimensions and quality to minimize upload size & storage cost.
 */
export async function compressImage(
  uri: string,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxDimension = 1200,
    quality = 0.7,
    format = 'jpeg',
  } = options;

  if (Platform.OS === 'web') {
    return compressImageWeb(uri, maxDimension, quality);
  }

  // Native: use expo-image-manipulator (lazy import to avoid crash if not installed)
  try {
    const ImageManipulator = await import('expo-image-manipulator');

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxDimension } }],
      {
        compress: quality,
        format:
          format === 'png'
            ? ImageManipulator.SaveFormat.PNG
            : ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (err) {
    console.warn('[compressImage] expo-image-manipulator not available, returning original:', err);
    return { uri, width: 0, height: 0 };
  }
}

/**
 * Web fallback: uses OffscreenCanvas / HTMLCanvasElement.
 */
async function compressImageWeb(
  uri: string,
  maxDimension: number,
  quality: number
): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Scale down if necessary
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const compressedUri = canvas.toDataURL('image/jpeg', quality);
      const estimatedSize = Math.round((compressedUri.length * 3) / 4); // base64 → bytes estimate

      resolve({ uri: compressedUri, width, height, estimatedSize });
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = uri;
  });
}

/**
 * Calculate approximate file size from a base64 data URI.
 */
export function estimateBase64Size(dataUri: string): number {
  const base64 = dataUri.split(',')[1] || dataUri;
  return Math.round((base64.length * 3) / 4);
}

/**
 * Format bytes to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
