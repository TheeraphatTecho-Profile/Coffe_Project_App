import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface WeatherAlert {
  id?: string;
  userId: string;
  farmId: string;
  type: 'frost' | 'heavy_rain' | 'storm' | 'drought' | 'heat_wave' | 'cold_snap' | 'wind' | 'humidity';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  expectedTime: string; // ISO string
  expectedDuration: number; // in hours
  affectedArea: string;
  recommendations: string[];
  isActive: boolean;
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WeatherAlertSettings {
  id?: string;
  userId: string;
  farmId: string;
  enableFrostAlerts: boolean;
  frostThreshold: number; // Celsius
  enableRainAlerts: boolean;
  heavyRainThreshold: number; // mm per hour
  enableStormAlerts: boolean;
  enableDroughtAlerts: boolean;
  droughtThreshold: number; // days without rain
  enableTemperatureAlerts: boolean;
  heatThreshold: number; // Celsius
  coldThreshold: number; // Celsius
  enableWindAlerts: boolean;
  windThreshold: number; // km/h
  enableHumidityAlerts: boolean;
  humidityMinThreshold: number; // %
  humidityMaxThreshold: number; // %
  notificationHours: number[]; // Hours before alert to notify
  pushNotifications: boolean;
  emailNotifications: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  rainfall: number; // mm in last hour
  windSpeed: number; // km/h
  windDirection: number; // degrees
  pressure: number; // hPa
  visibility: number; // km
  uvIndex: number;
  cloudCover: number; // %
  conditions: string;
}

export interface FarmWeatherProfile {
  id?: string;
  userId: string;
  farmId: string;
  altitude: number; // meters above sea level
  latitude: number;
  longitude: number;
  microclimate: 'highland' | 'valley' | 'slope' | 'plateau';
  frostRisk: 'low' | 'medium' | 'high';
  floodRisk: 'low' | 'medium' | 'high';
  windExposure: 'sheltered' | 'moderate' | 'exposed';
  soilType: 'sandy' | 'clay' | 'loam' | 'silt';
  drainage: 'poor' | 'moderate' | 'good';
  typicalWeatherPatterns: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const LOEI_WEATHER_THRESHOLDS = {
  // Highland-specific thresholds for coffee farming
  frost: {
    high: 2.0, // Above 2°C at 1000m+ altitude
    medium: 4.0, // 2-4°C moderate risk
    low: 6.0, // 4-6°C low risk
  },
  heat: {
    extreme: 35.0, // Above 35°C
    high: 32.0, // 32-35°C
    medium: 30.0, // 30-32°C
    low: 28.0, // 28-30°C
  },
  rain: {
    extreme: 50.0, // >50mm/hour
    high: 30.0, // 30-50mm/hour
    medium: 15.0, // 15-30mm/hour
    low: 5.0, // 5-15mm/hour
  },
  wind: {
    extreme: 80.0, // >80km/h
    high: 60.0, // 60-80km/h
    medium: 40.0, // 40-60km/h
    low: 25.0, // 25-40km/h
  },
  drought: {
    extreme: 21, // >21 days no rain
    high: 14, // 14-21 days
    medium: 7, // 7-14 days
    low: 3, // 3-7 days
  },
  humidity: {
    tooLow: 30, // <30%
    tooHigh: 90, // >90%
    optimal: [60, 80], // 60-80% optimal range
  }
};

export const WEATHER_ALERT_RECOMMENDATIONS = {
  frost: {
    high: [
      'ป้องกันพืชด้วยการใช้ผ้าคลุมหรือฟาง',
      'เปิดน้ำสปริงเล็กน้อยเพื่อเพิ่มความชื้น',
      'ตรวจสอบระบบน้ำประปาป้องกันแข็ง',
      'เตรียมพันธุ์กาแฟที่ทนความหนาวไว้ในพื้นที่ปลอดภัย'
    ],
    medium: [
      'ตรวจสอบสภาพอากาศเป็นประจำ',
      'เตรียมมาตรการป้องกันพืช',
      'ตรวจสอบระบบชลประทาน'
    ],
    low: [
      'ติดตามพยากรณ์อากาศ',
      'เตรียมการป้องกันหากจำเป็น'
    ]
  },
  heavy_rain: {
    high: [
      'ตรวจสอบระบบระบายน้ำในสวน',
      'หลีกเลี่ยงการใส่ปุ๋ยในช่วงฝนตกหนัก',
      'ตรวจสอบความมั่นคงของต้นกาแฟ',
      'เตรียมอุปกรณ์ป้องกันพัดลม'
    ],
    medium: [
      'ตรวจสอบการระบายน้ำ',
      'หยุดกิจกรรมที่ไม่จำเป็นในสวน'
    ],
    low: [
      'ติดตามปริมาณน้ำฝน',
      'ตรวจสอบสภาพดิน'
    ]
  },
  heat_wave: {
    high: [
      'เพิ่มการให้น้ำในเช้าและเย็น',
      'เพิ่มการคลุมดินด้วยฟางหรือวัสดุอื่น',
      'หลีกเลี่ยงการใส่ปุ๋ยในช่วงอุณหภูมิสูง',
      'ตรวจสอบสัญญาณของความเครียดในพืช'
    ],
    medium: [
      'ปรับเวลาให้น้ำให้เหมาะสม',
      'เพิ่มการคลุมดิน'
    ],
    low: [
      'ติดตามอุณหภูมิ',
      'เตรียมการปรับปริมาณน้ำ'
    ]
  },
  drought: {
    high: [
      'จำกัดการใช้น้ำเฉพาะส่วนที่จำเป็น',
      'ใช้น้ำประหยัดเช่นน้ำหยด',
      'เพิ่มการคลุมดินเพื่อลดการระเหย',
      'พิจารณาตัดแต่งกิ่งเพื่อลดการใช้น้ำ'
    ],
    medium: [
      'วางแผนการใช้น้ำ',
      'เพิ่มการคลุมดิน'
    ],
    low: [
      'ติดตามปริมาณน้ำ',
      'ตรวจสอบความชื้นในดิน'
    ]
  }
};

export class WeatherAlertService {
  private static collection = 'weather_alerts';
  private static settingsCollection = 'weather_alert_settings';
  private static profileCollection = 'farm_weather_profiles';

  static async createAlert(alert: Omit<WeatherAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const alertData = {
        ...alert,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.collection), alertData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating weather alert:', error);
      throw error;
    }
  }

  static async updateAlert(id: string, updates: Partial<WeatherAlert>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, this.collection, id), updateData);
    } catch (error) {
      console.error('Error updating weather alert:', error);
      throw error;
    }
  }

  static async deleteAlert(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collection, id));
    } catch (error) {
      console.error('Error deleting weather alert:', error);
      throw error;
    }
  }

  static async getAlert(userId: string, alertId: string): Promise<WeatherAlert | null> {
    try {
      const docRef = doc(db, this.collection, alertId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().userId === userId) {
        return { id: docSnap.id, ...docSnap.data() } as WeatherAlert;
      }
      return null;
    } catch (error) {
      console.error('Error getting weather alert:', error);
      throw error;
    }
  }

  static async getAllAlerts(userId: string): Promise<WeatherAlert[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WeatherAlert[];
    } catch (error) {
      console.error('Error getting all weather alerts:', error);
      throw error;
    }
  }

  static async getActiveAlerts(userId: string): Promise<WeatherAlert[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('isActive', '==', true),
        where('expectedTime', '>=', new Date().toISOString()),
        orderBy('expectedTime', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WeatherAlert[];
    } catch (error) {
      console.error('Error getting active weather alerts:', error);
      throw error;
    }
  }

  static async getUnreadAlerts(userId: string): Promise<WeatherAlert[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WeatherAlert[];
    } catch (error) {
      console.error('Error getting unread weather alerts:', error);
      throw error;
    }
  }

  static async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await this.updateAlert(alertId, { isRead: true });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  static async createAlertSettings(settings: Omit<WeatherAlertSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const settingsData = {
        ...settings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.settingsCollection), settingsData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating weather alert settings:', error);
      throw error;
    }
  }

  static async updateAlertSettings(id: string, updates: Partial<WeatherAlertSettings>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, this.settingsCollection, id), updateData);
    } catch (error) {
      console.error('Error updating weather alert settings:', error);
      throw error;
    }
  }

  static async getAlertSettings(userId: string, farmId: string): Promise<WeatherAlertSettings | null> {
    try {
      const q = query(
        collection(db, this.settingsCollection),
        where('userId', '==', userId),
        where('farmId', '==', farmId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0]) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as WeatherAlertSettings;
      }
      return null;
    } catch (error) {
      console.error('Error getting weather alert settings:', error);
      throw error;
    }
  }

  static async createFarmWeatherProfile(profile: Omit<FarmWeatherProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const profileData = {
        ...profile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.profileCollection), profileData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating farm weather profile:', error);
      throw error;
    }
  }

  static async updateFarmWeatherProfile(id: string, updates: Partial<FarmWeatherProfile>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, this.profileCollection, id), updateData);
    } catch (error) {
      console.error('Error updating farm weather profile:', error);
      throw error;
    }
  }

  static async getFarmWeatherProfile(userId: string, farmId: string): Promise<FarmWeatherProfile | null> {
    try {
      const q = query(
        collection(db, this.profileCollection),
        where('userId', '==', userId),
        where('farmId', '==', farmId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as FarmWeatherProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting farm weather profile:', error);
      throw error;
    }
  }

  static async getAlertSummary(userId: string): Promise<{
    total: number;
    active: number;
    unread: number;
    byType: Record<WeatherAlert['type'], number>;
    bySeverity: Record<WeatherAlert['severity'], number>;
  }> {
    try {
      const allAlerts = await this.getAllAlerts(userId);
      const activeAlerts = await this.getActiveAlerts(userId);
      const unreadAlerts = await this.getUnreadAlerts(userId);

      const summary = {
        total: allAlerts.length,
        active: activeAlerts.length,
        unread: unreadAlerts.length,
        byType: {} as Record<WeatherAlert['type'], number>,
        bySeverity: {} as Record<WeatherAlert['severity'], number>,
      };

      // Count by type
      allAlerts.forEach(alert => {
        if (!summary.byType[alert.type]) {
          summary.byType[alert.type] = 0;
        }
        summary.byType[alert.type]++;
      });

      // Count by severity
      allAlerts.forEach(alert => {
        if (!summary.bySeverity[alert.severity]) {
          summary.bySeverity[alert.severity] = 0;
        }
        summary.bySeverity[alert.severity]++;
      });

      return summary;
    } catch (error) {
      console.error('Error getting alert summary:', error);
      throw error;
    }
  }

  static analyzeWeatherRisk(weatherData: WeatherData, profile: FarmWeatherProfile): {
    alerts: Omit<WeatherAlert, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'farmId'>[];
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  } {
    const alerts: Omit<WeatherAlert, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'farmId'>[] = [];
    let maxRiskLevel = 0;

    // Frost risk analysis (altitude-dependent)
    if (profile.altitude > 800 && weatherData.temperature <= LOEI_WEATHER_THRESHOLDS.frost.high) {
      alerts.push({
        type: 'frost',
        severity: weatherData.temperature <= 0 ? 'extreme' : 
                  weatherData.temperature <= 2 ? 'high' : 'medium',
        title: 'คำเตือนอุณหภูมิต่ำ',
        description: `อุณหภูมิ ${weatherData.temperature}°C มีความเสี่ยงน้ำค้างแข็งที่ความสูง ${profile.altitude}m`,
        expectedTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        expectedDuration: 8,
        affectedArea: 'สวนกาแฟทั้งหมด',
        recommendations: WEATHER_ALERT_RECOMMENDATIONS.frost.high,
        isActive: true,
        isRead: false,
      });
      maxRiskLevel = Math.max(maxRiskLevel, 3);
    }

    // Heavy rain risk
    if (weatherData.rainfall >= LOEI_WEATHER_THRESHOLDS.rain.medium) {
      alerts.push({
        type: 'heavy_rain',
        severity: weatherData.rainfall >= LOEI_WEATHER_THRESHOLDS.rain.high ? 'high' : 'medium',
        title: 'คำเตือนฝนตกหนัก',
        description: `ปริมาณน้ำฝน ${weatherData.rainfall}มม./ชม. อาจทำให้ดินชื้นมากเกินไป`,
        expectedTime: new Date().toISOString(),
        expectedDuration: 4,
        affectedArea: 'สวนกาแฟทั้งหมด',
        recommendations: weatherData.rainfall >= LOEI_WEATHER_THRESHOLDS.rain.high ? 
                        WEATHER_ALERT_RECOMMENDATIONS.heavy_rain.high : 
                        WEATHER_ALERT_RECOMMENDATIONS.heavy_rain.medium,
        isActive: true,
        isRead: false,
      });
      maxRiskLevel = Math.max(maxRiskLevel, 2);
    }

    // Heat wave risk
    if (weatherData.temperature >= LOEI_WEATHER_THRESHOLDS.heat.medium) {
      alerts.push({
        type: 'heat_wave',
        severity: weatherData.temperature >= LOEI_WEATHER_THRESHOLDS.heat.high ? 'high' : 'medium',
        title: 'คำเตือนอุณหภูมิสูง',
        description: `อุณหภูมิ ${weatherData.temperature}°C อาจส่งผลต่อการเจริญเติบโตของกาแฟ`,
        expectedTime: new Date().toISOString(),
        expectedDuration: 6,
        affectedArea: 'สวนกาแฟทั้งหมด',
        recommendations: weatherData.temperature >= LOEI_WEATHER_THRESHOLDS.heat.high ? 
                        WEATHER_ALERT_RECOMMENDATIONS.heat_wave.high : 
                        WEATHER_ALERT_RECOMMENDATIONS.heat_wave.medium,
        isActive: true,
        isRead: false,
      });
      maxRiskLevel = Math.max(maxRiskLevel, 2);
    }

    // Wind risk
    if (weatherData.windSpeed >= LOEI_WEATHER_THRESHOLDS.wind.medium) {
      alerts.push({
        type: 'wind',
        severity: weatherData.windSpeed >= LOEI_WEATHER_THRESHOLDS.wind.high ? 'high' : 'medium',
        title: 'คำเตือนลมแรง',
        description: `ความเร็วลม ${weatherData.windSpeed}กม./ชม. อาจทำให้ต้นกาแฟเสียหาย`,
        expectedTime: new Date().toISOString(),
        expectedDuration: 3,
        affectedArea: 'สวนกาแฟทั้งหมด',
        recommendations: [
          'ตรวจสอบความมั่นคงของต้นกาแฟ',
          'หยุดการใช้สารเคมีในสวน',
          'เตรียมมาตรการป้องกันความเสียหาย'
        ],
        isActive: true,
        isRead: false,
      });
      maxRiskLevel = Math.max(maxRiskLevel, 2);
    }

    const riskLevels: ('low' | 'medium' | 'high' | 'extreme')[] = ['low', 'medium', 'high', 'extreme'];
    const riskLevel = riskLevels[maxRiskLevel] || 'low';

    return { alerts, riskLevel };
  }

  static getLoeiSeasonalRecommendations(month: number): string[] {
    const seasonalRecommendations = {
      11: ['เตรียมการป้องกันความหนาวในช่วงฤดูหนาว', 'ตรวจสอบระบบน้ำประปา'],
      12: ['เฝ้าระวังอุณหภูมิต่ำในเช้ามืด', 'เตรียมผ้าคลุมพืช'],
      1: ['ตรวจสอบสัญญาณความเครียดจากความหนาว', 'เพิ่มการให้น้ำในวันที่อากาศอบอุ่น'],
      2: ['เริ่มเตรียมการตัดแต่งกิ่ง', 'ติดตามสภาพอากาศอย่างใกล้ชิด'],
      3: ['เตรียมการให้น้ำในช่วงออกดอก', 'ตรวจสอบความชื้นในดิน'],
      4: ['เพิ่มการให้น้ำในช่วงอุณหภูมิสูง', 'คลุมดินเพื่อรักษาความชื้น'],
      5: ['ตรวจสอบการระบายน้ำก่อนฤดูฝน', 'เตรียมระบบป้องกันน้ำท่วม'],
      6: ['ติดตามพยากรณ์ฝน', 'หลีกเลี่ยงการใส่ปุ๋ยในช่วงฝนตกหนัก'],
      7: ['ตรวจสอบระบบระบายน้ำ', 'ป้องกันโรครานที่เกิดจากความชื้นสูง'],
      8: ['เฝ้าระวังพายุดีเฟลช', 'ตรวจสอบความแข็งแรงของต้นไม้'],
      9: ['เตรียมการเก็บเกี่ยว', 'ติดตามสภาพอากาศสำหรับการเก็บเกี่ยว'],
      10: ['เร่งเก็บเกี่ยวผลผลิต', 'ตรวจสอบคุณภาพของผลผลิต'],
    };

    return seasonalRecommendations[month as keyof typeof seasonalRecommendations] || [];
  }
}
