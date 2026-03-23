import { MarketService, COFFEE_GRADES, LOEI_MARKET_REGIONS, CERTIFICATIONS } from '../../lib/marketService';

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
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
}));

describe('MarketService', () => {
  const mockUserId = 'user123';
  const mockBuyer = {
    userId: mockUserId,
    name: 'สมชาย ใจดี',
    company: 'ร้านกาแฟเลยทัวร์',
    type: 'local' as const,
    contactPerson: 'สมชาย ใจดี',
    phone: '0812345678',
    email: 'coffee@loei.com',
    address: '123 ถ.เลย',
    province: 'เลย',
    district: 'เมืองเลย',
    postalCode: '42000',
    website: 'https://loei-coffee.com',
    lineId: 'loeicoffee',
    facebook: 'LoeiCoffee',
    specialties: ['Arabica', 'กาแฟพรีเมียม'],
    qualityRequirements: [
      {
        grade: 'A' as const,
        moistureContent: { min: 10, max: 12 },
        defects: { max: 2 },
        beanSize: 18,
        processing: 'washed' as const,
        description: 'คุณภาพสูงสุด',
      },
    ],
    paymentTerms: [
      {
        type: 'bank_transfer' as const,
        period: 30,
        discount: 2,
        description: 'โอนเงินภายใน 30 วัน',
      },
    ],
    certifications: [],
    preferredRegions: ['เลย'],
    priceRange: { min: 100, max: 150, currency: 'THB' },
    volumeCapacity: { min: 100, max: 1000 },
    reliability: 'good' as const,
    notes: 'ผู้ซื้อที่น่าเชื่อถือ',
    isActive: true,
    createdAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
  };

  const mockMarketPrice = {
    userId: mockUserId,
    region: 'เลย',
    province: 'เลย',
    marketType: 'local' as const,
    grade: 'A' as const,
    price: 150,
    currency: 'THB',
    unit: 'kg' as const,
    date: '2024-01-15',
    source: 'ตลาดเลย',
    trend: 'up' as const,
    trendPercentage: 5.2,
    notes: 'ราคาขาขึ้นจากความต้องการสูง',
    createdAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
  };

  const mockMarketInsight = {
    userId: mockUserId,
    title: 'ราคากาแฟเกรด A มีแนวโน้มขาขึ้น',
    type: 'price_forecast' as const,
    content: 'จากการวิเคราะห์ข้อมูลตลาด พบว่าราคากาแฟเกรด A มีแนวโน้มขาขึ้นในช่วง 3 เดือนข้างหน้า',
    targetRegion: 'เลย',
    targetGrade: 'A',
    timeframe: 'Q1 2024',
    impact: 'high' as const,
    actionable: true,
    recommendations: ['ควรรักษาคุณภาพให้ดีที่สุด', 'รอจังหวะราคาดีขึ้น'],
    sources: ['ตลาดเลย', 'ข้อมูลส่งออก'],
    createdAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
  };

  const mockMarketTransaction = {
    userId: mockUserId,
    farmId: 'farm123',
    buyerId: 'buyer123',
    date: '2024-01-15',
    grade: 'A' as const,
    quantity: 100,
    unitPrice: 150,
    totalPrice: 15000,
    currency: 'THB',
    qualityScore: 85,
    certifications: ['Organic'],
    paymentTerms: {
      type: 'bank_transfer' as const,
      period: 30,
      discount: 2,
      description: 'โอนเงินภายใน 30 วัน',
    },
    deliveryMethod: 'pickup' as const,
    status: 'completed' as const,
    createdAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('COFFEE_GRADES', () => {
    it('should have all required grades', () => {
      expect(Object.keys(COFFEE_GRADES)).toEqual(['A', 'B', 'C', 'D']);
    });

    it('should have valid grade structure', () => {
      Object.values(COFFEE_GRADES).forEach(grade => {
        expect(grade).toHaveProperty('name');
        expect(grade).toHaveProperty('description');
        expect(grade).toHaveProperty('moistureRange');
        expect(grade).toHaveProperty('maxDefects');
        expect(grade).toHaveProperty('beanSize');
        expect(grade).toHaveProperty('premium');
        expect(typeof grade.premium).toBe('number');
      });
    });

    it('should have decreasing premiums for lower grades', () => {
      expect(COFFEE_GRADES.A.premium).toBeGreaterThan(COFFEE_GRADES.B.premium);
      expect(COFFEE_GRADES.B.premium).toBeGreaterThan(COFFEE_GRADES.C.premium);
      expect(COFFEE_GRADES.C.premium).toBeGreaterThan(COFFEE_GRADES.D.premium);
    });
  });

  describe('LOEI_MARKET_REGIONS', () => {
    it('should have all required market regions', () => {
      expect(LOEI_MARKET_REGIONS).toHaveLength(5);
      expect(LOEI_MARKET_REGIONS.map(r => r.name)).toEqual(
        expect.arrayContaining(['เลย', 'ขอนแก่น', 'กรุงเทพมหานคร', 'ชลบุรี', 'ภูเก็ต'])
      );
    });

    it('should have valid region structure', () => {
      LOEI_MARKET_REGIONS.forEach(region => {
        expect(region).toHaveProperty('name');
        expect(region).toHaveProperty('type');
        expect(region).toHaveProperty('description');
        expect(['local', 'regional', 'national', 'export']).toContain(region.type);
      });
    });
  });

  describe('CERTIFICATIONS', () => {
    it('should have all required certifications', () => {
      expect(CERTIFICATIONS).toHaveLength(5);
      expect(CERTIFICATIONS.map(c => c.name)).toEqual(
        expect.arrayContaining(['Organic', 'Fair Trade', 'Rainforest Alliance', 'Bird Friendly', 'UTZ'])
      );
    });

    it('should have valid certification structure', () => {
      CERTIFICATIONS.forEach(cert => {
        expect(cert).toHaveProperty('name');
        expect(cert).toHaveProperty('description');
        expect(cert).toHaveProperty('premium');
        expect(typeof cert.premium).toBe('number');
      });
    });
  });

  describe('createBuyer', () => {
    it('should create buyer', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      const mockDocRef = { id: 'buyer123' };
      addDoc.mockResolvedValue(mockDocRef);

      const result = await MarketService.createBuyer(mockBuyer);

      expect(addDoc).toHaveBeenCalledWith(
        collection(undefined, 'buyers'),
        expect.objectContaining({
          ...mockBuyer,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      );
      expect(result).toBe('buyer123');
    });

    it('should handle create buyer error', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockRejectedValue(new Error('Firebase error'));

      await expect(MarketService.createBuyer(mockBuyer)).rejects.toThrow('Firebase error');
    });
  });

  describe('updateBuyer', () => {
    it('should update buyer', async () => {
      const { updateDoc, doc } = require('firebase/firestore');
      updateDoc.mockResolvedValue(undefined);

      await MarketService.updateBuyer('buyer123', {
        name: 'สมชาย ใจดี (อัพเดต)',
        reliability: 'excellent',
      });

      expect(updateDoc).toHaveBeenCalledWith(
        doc(undefined, 'buyers', 'buyer123'),
        expect.objectContaining({
          name: 'สมชาย ใจดี (อัพเดต)',
          reliability: 'excellent',
          updatedAt: expect.any(Object),
        })
      );
    });

    it('should handle update buyer error', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockRejectedValue(new Error('Update error'));

      await expect(MarketService.updateBuyer('buyer123', { name: 'Test' })).rejects.toThrow('Update error');
    });
  });

  describe('deleteBuyer', () => {
    it('should delete buyer', async () => {
      const { deleteDoc, doc } = require('firebase/firestore');
      deleteDoc.mockResolvedValue(undefined);

      await MarketService.deleteBuyer('buyer123');

      expect(deleteDoc).toHaveBeenCalledWith(doc(undefined, 'buyers', 'buyer123'));
    });

    it('should handle delete buyer error', async () => {
      const { deleteDoc } = require('firebase/firestore');
      deleteDoc.mockRejectedValue(new Error('Delete error'));

      await expect(MarketService.deleteBuyer('buyer123')).rejects.toThrow('Delete error');
    });
  });

  describe('getAllBuyers', () => {
    it('should get all buyers for user', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockBuyers = [
        { ...mockBuyer, id: 'buyer1' },
        { ...mockBuyer, id: 'buyer2', company: 'ร้านกาแฟที่สอง' },
      ];

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: mockBuyers.map(buyer => ({ id: buyer.id, data: () => buyer })),
      });

      const result = await MarketService.getAllBuyers(mockUserId);

      expect(query).toHaveBeenCalledWith(
        collection(undefined, 'buyers'),
        where('userId', '==', mockUserId),
        where('isActive', '==', true),
        orderBy('company', 'asc')
      );
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
      expect(result).toHaveLength(2);
    });
  });

  describe('getBuyersByType', () => {
    it('should get buyers by type', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockBuyers = [
        { ...mockBuyer, id: 'buyer1', type: 'local' },
        { ...mockBuyer, id: 'buyer2', type: 'local' },
      ];

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: mockBuyers.map(buyer => ({ id: buyer.id, data: () => buyer })),
      });

      const result = await MarketService.getBuyersByType(mockUserId, 'local');

      expect(query).toHaveBeenCalledWith(
        collection(undefined, 'buyers'),
        where('userId', '==', mockUserId),
        where('type', '==', 'local'),
        where('isActive', '==', true),
        orderBy('company', 'asc')
      );
      expect(result).toHaveLength(2);
      expect(result.every(buyer => buyer.type === 'local')).toBe(true);
    });
  });

  describe('getBuyersBySpecialty', () => {
    it('should get buyers by specialty', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockBuyers = [
        { ...mockBuyer, id: 'buyer1', specialties: ['Arabica'] },
        { ...mockBuyer, id: 'buyer2', specialties: ['Arabica', 'กาแฟพรีเมียม'] },
      ];

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: mockBuyers.map(buyer => ({ id: buyer.id, data: () => buyer })),
      });

      const result = await MarketService.getBuyersBySpecialty(mockUserId, 'Arabica');

      expect(query).toHaveBeenCalledWith(
        collection(undefined, 'buyers'),
        where('userId', '==', mockUserId),
        where('specialties', 'array-contains', 'Arabica'),
        where('isActive', '==', true),
        orderBy('company', 'asc')
      );
      expect(result).toHaveLength(2);
      expect(result.every(buyer => buyer.specialties.includes('Arabica'))).toBe(true);
    });
  });

  describe('createMarketPrice', () => {
    it('should create market price', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      const mockDocRef = { id: 'price123' };
      addDoc.mockResolvedValue(mockDocRef);

      const result = await MarketService.createMarketPrice(mockMarketPrice);

      expect(addDoc).toHaveBeenCalledWith(
        collection(undefined, 'market_prices'),
        expect.objectContaining({
          ...mockMarketPrice,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      );
      expect(result).toBe('price123');
    });
  });

  describe('getMarketPrices', () => {
    it('should get market prices with filters', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockPrices = [
        { ...mockMarketPrice, id: 'price1' },
        { ...mockMarketPrice, id: 'price2', grade: 'B' },
      ];

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: mockPrices.map(price => ({ id: price.id, data: () => price })),
      });

      const result = await MarketService.getMarketPrices(mockUserId, {
        region: 'เลย',
        grade: 'A',
      });

      expect(query).toHaveBeenCalledTimes(3); // Initial query + 2 filters
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
      expect(result).toHaveLength(2); // Both prices have region: 'เลย'
      expect(result.filter(p => p.grade === 'A')).toHaveLength(1);
    });
  });

  describe('getPriceTrends', () => {
    it('should calculate price trends correctly', async () => {
      const mockPrices = [
        { ...mockMarketPrice, price: 150, date: '2024-01-15' },
        { ...mockMarketPrice, price: 140, date: '2024-01-10' },
        { ...mockMarketPrice, price: 130, date: '2024-01-05' },
      ];

      jest.spyOn(MarketService, 'getMarketPrices').mockResolvedValue(mockPrices);

      const result = await MarketService.getPriceTrends(mockUserId, 'เลย', 'A', 30);

      expect(result).toEqual({
        currentPrice: 150,
        previousPrice: 130,
        trend: 'up',
        percentageChange: expect.closeTo(15.38, 0.01),
        forecast: expect.any(String),
      });
    });

    it('should return stable trend for minimal change', async () => {
      const mockPrices = [
        { ...mockMarketPrice, price: 150, date: '2024-01-15' },
        { ...mockMarketPrice, price: 148, date: '2024-01-10' },
      ];

      jest.spyOn(MarketService, 'getMarketPrices').mockResolvedValue(mockPrices);

      const result = await MarketService.getPriceTrends(mockUserId, 'เลย', 'A', 30);

      expect(result.trend).toBe('stable');
    });

    it('should handle insufficient data', async () => {
      jest.spyOn(MarketService, 'getMarketPrices').mockResolvedValue([]);

      const result = await MarketService.getPriceTrends(mockUserId, 'เลย', 'A', 30);

      expect(result).toEqual({
        currentPrice: 0,
        previousPrice: 0,
        trend: 'stable',
        percentageChange: 0,
        forecast: 'ข้อมูลไม่เพียงพอสำหรับพยากรณ์',
      });
    });
  });

  describe('createMarketInsight', () => {
    it('should create market insight', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      const mockDocRef = { id: 'insight123' };
      addDoc.mockResolvedValue(mockDocRef);

      const result = await MarketService.createMarketInsight(mockMarketInsight);

      expect(addDoc).toHaveBeenCalledWith(
        collection(undefined, 'market_insights'),
        expect.objectContaining({
          ...mockMarketInsight,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      );
      expect(result).toBe('insight123');
    });
  });

  describe('getMarketInsights', () => {
    it('should get market insights with filters', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockInsights = [
        { ...mockMarketInsight, id: 'insight1' },
        { ...mockMarketInsight, id: 'insight2', type: 'market_trend' },
      ];

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: mockInsights.map(insight => ({ id: insight.id, data: () => insight })),
      });

      const result = await MarketService.getMarketInsights(mockUserId, {
        type: 'price_forecast',
        impact: 'high',
      });

      expect(query).toHaveBeenCalledTimes(3); // Initial query + 2 filters
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
      expect(result).toHaveLength(2); // Both insights have impact: 'high'
      expect(result.filter(r => r.type === 'price_forecast')).toHaveLength(1);
    });
  });

  describe('createTransaction', () => {
    it('should create transaction', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      const mockDocRef = { id: 'transaction123' };
      addDoc.mockResolvedValue(mockDocRef);

      const result = await MarketService.createTransaction(mockMarketTransaction);

      expect(addDoc).toHaveBeenCalledWith(
        collection(undefined, 'market_transactions'),
        expect.objectContaining({
          ...mockMarketTransaction,
          totalPrice: 15000, // 100 * 150
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      );
      expect(result).toBe('transaction123');
    });
  });

  describe('getTransactions', () => {
    it('should get transactions with filters', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockTransactions = [
        { ...mockMarketTransaction, id: 'transaction1', grade: 'A' as const, status: 'completed' as const },
        { ...mockMarketTransaction, id: 'transaction2', grade: 'B' as const, status: 'pending' as const },
      ];

      const mockQuery = { mock: 'query' };
      query.mockReturnValue(mockQuery);
      getDocs.mockResolvedValue({
        docs: mockTransactions.map(transaction => ({ id: transaction.id, data: () => transaction })),
      });

      const result = await MarketService.getTransactions(mockUserId, {
        farmId: 'farm123',
        status: 'completed',
      });

      expect(query).toHaveBeenCalledTimes(3); // Initial query + 2 filters
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
      expect(result).toHaveLength(2); // Both transactions have farmId: 'farm123'
      expect(result.filter(t => t.status === 'completed')).toHaveLength(1);
    });
  });

  describe('getMarketSummary', () => {
    it('should calculate market summary correctly', async () => {
      const mockBuyers = [
        { ...mockBuyer, id: 'buyer1', isActive: true },
        { ...mockBuyer, id: 'buyer2', isActive: false },
      ];

      const mockTransactions = [
        { ...mockMarketTransaction, id: 'transaction1', status: 'completed', totalPrice: 15000, quantity: 100, unitPrice: 150, grade: 'A' },
        { ...mockMarketTransaction, id: 'transaction2', status: 'completed', totalPrice: 12000, quantity: 100, unitPrice: 120, grade: 'B' },
        { ...mockMarketTransaction, id: 'transaction3', status: 'pending', totalPrice: 10000, quantity: 100, unitPrice: 100, grade: 'C' },
      ];

      jest.spyOn(MarketService, 'getAllBuyers').mockResolvedValue(mockBuyers);
      jest.spyOn(MarketService, 'getTransactions').mockResolvedValue(mockTransactions as any);

      const result = await MarketService.getMarketSummary(mockUserId);

      expect(result).toEqual({
        totalBuyers: 2,
        activeBuyers: 1,
        averagePrice: 135, // (15000 + 12000) / (100 + 100)
        priceTrend: expect.any(String),
        totalTransactions: 2, // Only completed transactions
        totalVolume: 200, // 100 + 100
        totalRevenue: 27000, // 15000 + 12000
        topBuyers: expect.any(Array),
        gradeDistribution: {
          A: 1,
          B: 1,
        },
      });
    });
  });

  describe('getRecommendedBuyers', () => {
    it('should filter and sort buyers by compatibility', async () => {
      const mockBuyers = [
        { ...mockBuyer, id: 'buyer1', priceRange: { min: 100, max: 200, currency: 'THB' }, volumeCapacity: { min: 50, max: 500 }, reliability: 'excellent' as const },
        { ...mockBuyer, id: 'buyer2', priceRange: { min: 80, max: 120, currency: 'THB' }, volumeCapacity: { min: 200, max: 1000 }, reliability: 'good' as const },
        { ...mockBuyer, id: 'buyer3', priceRange: { min: 150, max: 250, currency: 'THB' }, volumeCapacity: { min: 100, max: 300 }, reliability: 'poor' as const },
      ];

      jest.spyOn(MarketService, 'getAllBuyers').mockResolvedValue(mockBuyers);

      const result = await MarketService.getRecommendedBuyers(mockUserId, 'A', 150, 'เลย');

      expect(result).toHaveLength(1); // Only buyer1 matches all criteria
      expect(result[0].reliability).toBe('excellent');
      expect(result.every(buyer => ['excellent', 'good'].includes(buyer.reliability))).toBe(true);
    });
  });

  describe('calculateOptimalSellingPrice', () => {
    it('should calculate optimal price with premiums', () => {
      const result = MarketService.calculateOptimalSellingPrice(
        'A',
        85,
        ['Organic', 'Fair Trade'],
        100
      );

      expect(result).toEqual({
        basePrice: 100,
        qualityAdjustment: expect.closeTo(14, 0.01), // (85-50)/50 * 100 * 0.2
        certificationPremium: 50, // 30% + 20%
        recommendedPrice: expect.closeTo(256.5, 0.01), // 100 * 1.5 * 1.3 * 1.14
        reasoning: expect.arrayContaining([
          'เกรด A พรีเมียม 50% จากคุณภาพสูงสุด',
          'Organic พรีเมียม 30%',
          'Fair Trade พรีเมียม 20%',
          'คุณภาพสูงกว่าเกณฑ์ ปรับราคาขึ้น',
        ]),
      });
    });

    it('should handle low quality score', () => {
      const result = MarketService.calculateOptimalSellingPrice(
        'C',
        40,
        [],
        100
      );

      expect(result.qualityAdjustment).toBeLessThan(0);
      expect(result.certificationPremium).toBe(0);
      expect(result.reasoning).toContain('คุณภาพต่ำกว่าเกณฑ์ อาจต้องลดราคา');
    });

    it('should handle B grade with moderate quality', () => {
      const result = MarketService.calculateOptimalSellingPrice(
        'B',
        60,
        ['Organic'],
        100
      );

      expect(result.basePrice).toBe(100);
      expect(result.recommendedPrice).toBeGreaterThan(100);
      expect(result.reasoning).toContain('เกรด B พรีเมียม 20% จากคุณภาพดี');
    });
  });
});
