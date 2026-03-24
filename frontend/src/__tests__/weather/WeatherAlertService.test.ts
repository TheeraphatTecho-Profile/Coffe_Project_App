import { WeatherAlertService, LOEI_WEATHER_THRESHOLDS } from '../../lib/weatherAlertService';

// Mock Firebase
jest.mock('../../lib/firebase', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
}));

describe('WeatherAlertService', () => {
  const mockUserId = 'user123';
  const mockFarmId = 'farm123';
  const mockAlert = {
    userId: mockUserId,
    farmId: mockFarmId,
    type: 'frost' as const,
    severity: 'high' as const,
    title: 'คำเตือนความหนาว',
    description: 'อุณหภูมิต่ำกว่า 2°C',
    expectedTime: '2024-01-15T06:00:00Z',
    expectedDuration: 8,
    affectedArea: 'สวนกาแฟทั้งหมด',
    recommendations: ['ป้องกันพืชด้วยผ้าคลุม'],
    isActive: true,
    isRead: false,
  };

  const mockSettings = {
    userId: mockUserId,
    farmId: mockFarmId,
    enableFrostAlerts: true,
    frostThreshold: 4.0,
    enableRainAlerts: true,
    heavyRainThreshold: 15.0,
    enableStormAlerts: true,
    enableDroughtAlerts: true,
    droughtThreshold: 7,
    enableTemperatureAlerts: true,
    heatThreshold: 32.0,
    coldThreshold: 6.0,
    enableWindAlerts: false,
    windThreshold: 40.0,
    enableHumidityAlerts: false,
    humidityMinThreshold: 30,
    humidityMaxThreshold: 90,
    notificationHours: [6, 12, 24],
    pushNotifications: true,
    emailNotifications: false,
  };

  const mockProfile = {
    userId: mockUserId,
    farmId: mockFarmId,
    altitude: 1000,
    latitude: 17.5,
    longitude: 101.7,
    microclimate: 'highland' as const,
    frostRisk: 'high' as const,
    floodRisk: 'medium' as const,
    windExposure: 'moderate' as const,
    soilType: 'loam' as const,
    drainage: 'good' as const,
    typicalWeatherPatterns: ['morning_fog', 'afternoon_rain'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LOEI_WEATHER_THRESHOLDS', () => {
    it('should have all required threshold categories', () => {
      expect(Object.keys(LOEI_WEATHER_THRESHOLDS)).toEqual(
        expect.arrayContaining(['frost', 'heat', 'rain', 'wind', 'drought', 'humidity'])
      );
    });

    it('should have valid threshold structure', () => {
      Object.entries(LOEI_WEATHER_THRESHOLDS).forEach(([key, threshold]) => {
        // Skip humidity as it has different structure
        if (key === 'humidity') {
          expect(threshold).toHaveProperty('tooLow');
          expect(threshold).toHaveProperty('tooHigh');
          expect(threshold).toHaveProperty('optimal');
        } else {
          expect(threshold).toHaveProperty('high');
          expect(threshold).toHaveProperty('medium');
          expect(threshold).toHaveProperty('low');
          expect(typeof (threshold as any).high).toBe('number');
          expect(typeof (threshold as any).medium).toBe('number');
          expect(typeof (threshold as any).low).toBe('number');
        }
      });
    });

    it('should have appropriate frost thresholds for highland coffee', () => {
      expect(LOEI_WEATHER_THRESHOLDS.frost.high).toBeLessThan(LOEI_WEATHER_THRESHOLDS.frost.medium);
      expect(LOEI_WEATHER_THRESHOLDS.frost.medium).toBeLessThan(LOEI_WEATHER_THRESHOLDS.frost.low);
      expect(LOEI_WEATHER_THRESHOLDS.frost.high).toBe(2.0); // Critical for coffee
    });
  });

  describe('createAlert', () => {
    it('should create weather alert', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      const mockDocRef = { id: 'alert123' };
      addDoc.mockResolvedValue(mockDocRef);

      const result = await WeatherAlertService.createAlert(mockAlert);

      expect(addDoc).toHaveBeenCalledWith(
        collection(undefined, 'weather_alerts'),
        expect.objectContaining({
          ...mockAlert,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      );
      expect(result).toBe('alert123');
    });

    it('should handle create alert error', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockRejectedValue(new Error('Firebase error'));

      await expect(WeatherAlertService.createAlert(mockAlert)).rejects.toThrow('Firebase error');
    });
  });

  describe('updateAlert', () => {
    it('should update weather alert', async () => {
      const { updateDoc, doc } = require('firebase/firestore');
      updateDoc.mockResolvedValue(undefined);

      await WeatherAlertService.updateAlert('alert123', {
        isRead: true,
        severity: 'medium',
      });

      expect(updateDoc).toHaveBeenCalledWith(
        doc(undefined, 'weather_alerts', 'alert123'),
        expect.objectContaining({
          isRead: true,
          severity: 'medium',
          updatedAt: expect.any(Object),
        })
      );
    });

    it('should handle update alert error', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockRejectedValue(new Error('Update error'));

      await expect(WeatherAlertService.updateAlert('alert123', { isRead: true })).rejects.toThrow('Update error');
    });
  });

  describe('deleteAlert', () => {
    it('should delete weather alert', async () => {
      const { deleteDoc, doc } = require('firebase/firestore');
      deleteDoc.mockResolvedValue(undefined);

      await WeatherAlertService.deleteAlert('alert123');

      expect(deleteDoc).toHaveBeenCalledWith(doc(undefined, 'weather_alerts', 'alert123'));
    });

    it('should handle delete alert error', async () => {
      const { deleteDoc } = require('firebase/firestore');
      deleteDoc.mockRejectedValue(new Error('Delete error'));

      await expect(WeatherAlertService.deleteAlert('alert123')).rejects.toThrow('Delete error');
    });
  });

  describe('getAllAlerts', () => {
    it('should get all alerts for user', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockAlerts = [
        { ...mockAlert, id: 'alert1', createdAt: { seconds: 1234567890, nanoseconds: 0 } as any },
        { ...mockAlert, id: 'alert2', type: 'heavy_rain', createdAt: { seconds: 1234567891, nanoseconds: 0 } as any },
      ];

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: mockAlerts.map(alert => ({ id: alert.id, data: () => alert })),
      });

      const result = await WeatherAlertService.getAllAlerts(mockUserId);

      expect(query).toHaveBeenCalledWith(
        collection(undefined, 'weather_alerts'),
        where('userId', '==', mockUserId),
        orderBy('createdAt', 'desc')
      );
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
      expect(result).toHaveLength(2);
    });
  });

  describe('getActiveAlerts', () => {
    it('should get active alerts', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockAlerts = [
        { ...mockAlert, id: 'alert1', isActive: true, expectedTime: new Date(Date.now() + 86400000).toISOString() },
        { ...mockAlert, id: 'alert2', isActive: false, expectedTime: new Date(Date.now() + 86400000).toISOString() },
      ];

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: mockAlerts.filter(a => a.isActive).map(alert => ({ id: alert.id, data: () => alert })),
      });

      const result = await WeatherAlertService.getActiveAlerts(mockUserId);

      expect(query).toHaveBeenCalledWith(
        collection(undefined, 'weather_alerts'),
        where('userId', '==', mockUserId),
        where('isActive', '==', true),
        where('expectedTime', '>=', expect.any(String)),
        orderBy('expectedTime', 'asc')
      );
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });
  });

  describe('getUnreadAlerts', () => {
    it('should get unread alerts', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockAlerts = [
        { ...mockAlert, id: 'alert1', isRead: false },
        { ...mockAlert, id: 'alert2', isRead: true },
      ];

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: mockAlerts.filter(a => !a.isRead).map(alert => ({ id: alert.id, data: () => alert })),
      });

      const result = await WeatherAlertService.getUnreadAlerts(mockUserId);

      expect(query).toHaveBeenCalledWith(
        collection(undefined, 'weather_alerts'),
        where('userId', '==', mockUserId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );
      expect(result).toHaveLength(1);
      expect(result[0].isRead).toBe(false);
    });
  });

  describe('markAlertAsRead', () => {
    it('should mark alert as read', async () => {
      const { updateDoc, doc } = require('firebase/firestore');
      updateDoc.mockResolvedValue(undefined);

      await WeatherAlertService.markAlertAsRead('alert123');

      expect(updateDoc).toHaveBeenCalledWith(
        doc(undefined, 'weather_alerts', 'alert123'),
        expect.objectContaining({
          isRead: true,
          updatedAt: expect.any(Object),
        })
      );
    });
  });

  describe('createAlertSettings', () => {
    it('should create alert settings', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      const mockDocRef = { id: 'settings123' };
      addDoc.mockResolvedValue(mockDocRef);

      const result = await WeatherAlertService.createAlertSettings(mockSettings);

      expect(addDoc).toHaveBeenCalledWith(
        collection(undefined, 'weather_alert_settings'),
        expect.objectContaining({
          ...mockSettings,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      );
      expect(result).toBe('settings123');
    });
  });

  describe('getAlertSettings', () => {
    it('should get alert settings for farm', async () => {
      const { getDocs, collection, query, where, orderBy, limit } = require('firebase/firestore');
      
      const mockSettingsData = { ...mockSettings, id: 'settings123', createdAt: { seconds: 1234567890, nanoseconds: 0 } as any, updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any };

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: [{ id: mockSettingsData.id, data: () => mockSettingsData }],
      });

      const result = await WeatherAlertService.getAlertSettings(mockUserId, mockFarmId);

      expect(query).toHaveBeenCalledWith(
        collection(undefined, 'weather_alert_settings'),
        where('userId', '==', mockUserId),
        where('farmId', '==', mockFarmId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      expect(result).toEqual(mockSettingsData);
    });

    it('should return null when no settings found', async () => {
      const { getDocs, collection, query, where, orderBy, limit } = require('firebase/firestore');
      
      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({ 
        docs: [] // Empty array to simulate no documents found
      });

      const result = await WeatherAlertService.getAlertSettings(mockUserId, mockFarmId);

      expect(result).toBeNull();
    });
  });

  describe('createFarmWeatherProfile', () => {
    it('should create farm weather profile', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      const mockDocRef = { id: 'profile123' };
      addDoc.mockResolvedValue(mockDocRef);

      const result = await WeatherAlertService.createFarmWeatherProfile(mockProfile);

      expect(addDoc).toHaveBeenCalledWith(
        collection(undefined, 'farm_weather_profiles'),
        expect.objectContaining({
          ...mockProfile,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      );
      expect(result).toBe('profile123');
    });
  });

  describe('getFarmWeatherProfile', () => {
    it('should get farm weather profile', async () => {
      const { getDocs, collection, query, where, orderBy, limit } = require('firebase/firestore');
      
      const mockProfileData = { ...mockProfile, id: 'profile123' };

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: [{ id: mockProfileData.id, data: () => mockProfileData }],
      });

      const result = await WeatherAlertService.getFarmWeatherProfile(mockUserId, mockFarmId);

      expect(result).toEqual(mockProfileData);
    });
  });

  describe('getAlertSummary', () => {
    it('should calculate alert summary correctly', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockAlerts = [
        { ...mockAlert, id: 'alert1', type: 'frost', severity: 'high', isActive: true, isRead: false },
        { ...mockAlert, id: 'alert2', type: 'heavy_rain', severity: 'medium', isActive: true, isRead: true },
        { ...mockAlert, id: 'alert3', type: 'heat_wave', severity: 'low', isActive: false, isRead: false },
      ];

      // Mock the service calls
      jest.spyOn(WeatherAlertService, 'getAllAlerts').mockResolvedValue(mockAlerts as any);
      jest.spyOn(WeatherAlertService, 'getActiveAlerts').mockResolvedValue(mockAlerts.filter(a => a.isActive) as any);
      jest.spyOn(WeatherAlertService, 'getUnreadAlerts').mockResolvedValue(mockAlerts.filter(a => !a.isRead) as any);

      const result = await WeatherAlertService.getAlertSummary(mockUserId);

      expect(result).toEqual({
        total: 3,
        active: 2,
        unread: 2,
        byType: {
          frost: 1,
          heavy_rain: 1,
          heat_wave: 1,
        },
        bySeverity: {
          high: 1,
          medium: 1,
          low: 1,
        },
      });
    });
  });

  describe('analyzeWeatherRisk', () => {
    it('should analyze frost risk for highland farm', () => {
      const weatherData = {
        timestamp: '2024-01-15T06:00:00Z',
        temperature: 1.5,
        humidity: 85,
        rainfall: 0,
        windSpeed: 10,
        windDirection: 180,
        pressure: 1013,
        visibility: 10,
        uvIndex: 1,
        cloudCover: 90,
        conditions: 'foggy',
      };

      const mockProfileWithTimestamps = {
        ...mockProfile,
        createdAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      };

      const result = WeatherAlertService.analyzeWeatherRisk(weatherData, mockProfileWithTimestamps);

      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].type).toBe('frost');
      expect(result.alerts[0].severity).toBe('high');
      expect(result.riskLevel).toBe('extreme'); // Expected 'extreme' for 1.5°C at high altitude
    });

    it('should analyze heavy rain risk', () => {
      const weatherData = {
        timestamp: '2024-06-15T14:00:00Z',
        temperature: 25,
        humidity: 90,
        rainfall: 35,
        windSpeed: 20,
        windDirection: 90,
        pressure: 1008,
        visibility: 5,
        uvIndex: 5,
        cloudCover: 100,
        conditions: 'heavy_rain',
      };

      const result = WeatherAlertService.analyzeWeatherRisk(weatherData, mockProfile as any);

      expect(result.alerts.some(alert => alert.type === 'heavy_rain')).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    it('should analyze heat wave risk', () => {
      const weatherData = {
        timestamp: '2024-04-15T14:00:00Z',
        temperature: 34,
        humidity: 60,
        rainfall: 0,
        windSpeed: 15,
        windDirection: 270,
        pressure: 1010,
        visibility: 10,
        uvIndex: 10,
        cloudCover: 20,
        conditions: 'sunny',
      };

      const result = WeatherAlertService.analyzeWeatherRisk(weatherData, mockProfile as any);

      expect(result.alerts.some(alert => alert.type === 'heat_wave')).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    it('should return low risk for normal weather', () => {
      const weatherData = {
        timestamp: '2024-03-15T12:00:00Z',
        temperature: 22,
        humidity: 70,
        rainfall: 2,
        windSpeed: 10,
        windDirection: 180,
        pressure: 1012,
        visibility: 10,
        uvIndex: 6,
        cloudCover: 40,
        conditions: 'partly_cloudy',
      };

      const result = WeatherAlertService.analyzeWeatherRisk(weatherData, mockProfile as any);

      expect(result.alerts).toHaveLength(0);
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('getLoeiSeasonalRecommendations', () => {
    it('should return winter recommendations', () => {
      const recommendations = WeatherAlertService.getLoeiSeasonalRecommendations(12);
      
      expect(recommendations).toContain('เตรียมผ้าคลุมพืช');
      expect(recommendations).toContain('เฝ้าระวังอุณหภูมิต่ำในเช้ามืด');
    });

    it('should return summer recommendations', () => {
      const recommendations = WeatherAlertService.getLoeiSeasonalRecommendations(6);
      
      expect(recommendations).toContain('ติดตามพยากรณ์ฝน');
      expect(recommendations).toContain('หลีกเลี่ยงการใส่ปุ๋ยในช่วงฝนตกหนัก');
    });

    it('should return harvest season recommendations', () => {
      const recommendations = WeatherAlertService.getLoeiSeasonalRecommendations(10);
      
      expect(recommendations).toContain('เร่งเก็บเกี่ยวผลผลิต');
      expect(recommendations).toContain('ตรวจสอบคุณภาพของผลผลิต');
    });

    it('should return empty array for invalid month', () => {
      const recommendations = WeatherAlertService.getLoeiSeasonalRecommendations(13);
      
      expect(recommendations).toEqual([]);
    });
  });
});
