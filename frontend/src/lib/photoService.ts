import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export interface PhotoMetadata {
  farmId?: string;
  harvestId?: string;
  type: 'farm' | 'harvest' | 'disease' | 'pest' | 'general';
  description?: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface UploadedPhoto {
  url: string;
  metadata: PhotoMetadata;
  fileName: string;
  size: number;
}

export const PhotoService = {
  async requestCameraPermission(): Promise<boolean> {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    return result.status === 'granted';
  },

  async requestMediaLibraryPermission(): Promise<boolean> {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return result.status === 'granted';
  },

  async takePhoto(): Promise<string | null> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      console.warn('Camera permission denied');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  },

  async pickFromLibrary(): Promise<string | null> {
    const hasPermission = await this.requestMediaLibraryPermission();
    if (!hasPermission) {
      console.warn('Media library permission denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  },

  async processImage(uri: string): Promise<string> {
    try {
      // Resize and compress image
      const processed = await manipulateAsync(
        uri,
        [
          { resize: { width: 1024, height: 1024 } }, // Max 1024x1024
        ],
        {
          compress: 0.7,
          format: SaveFormat.JPEG,
        }
      );

      return processed.uri;
    } catch (error) {
      console.error('Error processing image:', error);
      return uri; // Return original if processing fails
    }
  },

  async uploadPhoto(
    uri: string,
    metadata: PhotoMetadata
  ): Promise<UploadedPhoto | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Process image
      const processedUri = await this.processImage(uri);

      // Convert to blob
      const response = await fetch(processedUri);
      const blob = await response.blob();

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${metadata.type}_${timestamp}.jpg`;

      // Create storage reference
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `users/${user.uid}/photos/${metadata.type}/${fileName}`
      );

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return {
        url: downloadURL,
        metadata,
        fileName,
        size: blob.size,
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  },

  async uploadMultiplePhotos(
    uris: string[],
    metadata: Omit<PhotoMetadata, 'timestamp'>
  ): Promise<UploadedPhoto[]> {
    const uploadedPhotos: UploadedPhoto[] = [];

    for (const uri of uris) {
      const photoMetadata: PhotoMetadata = {
        ...metadata,
        timestamp: new Date().toISOString(),
      };

      const result = await this.uploadPhoto(uri, photoMetadata);
      if (result) {
        uploadedPhotos.push(result);
      }
    }

    return uploadedPhotos;
  },

  async deletePhoto(fileName: string): Promise<boolean> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Note: You would need to implement this based on your folder structure
      // This is a placeholder for the actual deletion logic
      console.log('Delete photo:', fileName);
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  },

  async getPhotoUrl(fileName: string): Promise<string | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}/photos/${fileName}`);
      
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting photo URL:', error);
      return null;
    }
  },

  // Get image info (size, dimensions)
  async getImageInfo(uri: string): Promise<{
    size: number;
    width: number;
    height: number;
  } | null> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // For dimensions, you might need to use a library like expo-image-manipulator
      // This is a simplified version
      return {
        size: blob.size,
        width: 1024, // Placeholder
        height: 768,  // Placeholder
      };
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  },

  // Validate photo before upload
  validatePhoto(uri: string): {
    isValid: boolean;
    error?: string;
  } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // This is a simplified validation
    // In a real app, you would check the actual file size and format
    
    return {
      isValid: true,
    };
  },

  // Generate photo metadata
  generatePhotoMetadata(
    type: PhotoMetadata['type'],
    farmId?: string,
    harvestId?: string,
    description?: string
  ): PhotoMetadata {
    return {
      farmId,
      harvestId,
      type,
      description,
      timestamp: new Date().toISOString(),
    };
  },

  // Get photo suggestions based on type
  getPhotoSuggestions(type: PhotoMetadata['type']): {
    title: string;
    description: string;
    tips: string[];
  } {
    const suggestions = {
      farm: {
        title: 'ถ่ายรูปสวนกาแฟ',
        description: 'บันทึกภาพรวมของสวนเพื่อติดตามการเจริญเติบโต',
        tips: [
          'ถ่ายจากมุมสูงเพื่อเห็นภาพรวม',
          'หลีกเลี่ยงแสงแดดจ้าเวลาถ่าย',
          'ถ่ายในเวลาเช้าหรือเย็น',
          'แสดงต้นกาแฟและพื้นที่โดยรอบ',
        ],
      },
      harvest: {
        title: 'ถ่ายรูปผลผลิต',
        description: 'บันทึกภาพผลเก็บเกี่ยวเพื่อคำนวณปริมาณและคุณภาพ',
        tips: [
          'ถ่ายให้เห็นผลกาแฟชัดเจน',
          'วัดขนาดผลเพื่อบันทึกข้อมูล',
          'ถ่ายสีของผลเพื่อประเมินความสุก',
          'บันทึกวันที่เก็บเกี่ยว',
        ],
      },
      disease: {
        title: 'ถ่ายรูปอาการโรค',
        description: 'บันทึกภาพอาการผิดปกติเพื่อการวินิจฉัย',
        tips: [
          'ถ่ายให้ใกล้ชัดที่สุด',
          'ถ่ายทั้งด้านหน้าและด้านหลังใบ',
          'แสดงสีที่เปลี่ยนแปลงชัดเจน',
          'ถ่ายใบหลายใบที่มีอาการเดียวกัน',
        ],
      },
      pest: {
        title: 'ถ่ายรูปศัตรูพืช',
        description: 'บันทึกภาพแมลงหรือศัตรูเพื่อการป้องกัน',
        tips: [
          'ถ่ายให้เห็นแมลงชัดเจน',
          'ใช้สเกลเพื่อวัดขนาด',
          'ถ่ายความเสียหายที่เกิดขึ้น',
          'บันทึกจำนวนแมลงที่พบ',
        ],
      },
      general: {
        title: 'ถ่ายรูปทั่วไป',
        description: 'บันทึกภาพที่เกี่ยวข้องกับการจัดการสวน',
        tips: [
          'ถ่ายภาพที่มีประโยชน์ต่อการบันทึก',
          'เพิ่มคำอธิบายให้ชัดเจน',
          'บันทึกวันที่และเวลา',
          'จัดระเบียบภาพตามหมวดหมู่',
        ],
      },
    };

    return suggestions[type] || suggestions.general;
  },
};

export default PhotoService;
