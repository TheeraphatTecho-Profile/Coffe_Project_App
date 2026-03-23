import { CostService, COST_CATEGORIES } from '../../lib/costService';

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

describe('CostService', () => {
  const mockUserId = 'user123';
  const mockCost = {
    userId: mockUserId,
    farmId: 'farm123',
    category: 'fertilizer' as const,
    description: 'ปุ๋ยยูเรีย',
    amount: 50,
    unit: 'kg' as const,
    unitPrice: 25,
    date: '2024-01-15',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('COST_CATEGORIES', () => {
    it('should have all required categories', () => {
      expect(COST_CATEGORIES).toHaveLength(6);
      expect(COST_CATEGORIES.map(cat => cat.id)).toEqual(
        expect.arrayContaining(['fertilizer', 'labor', 'water', 'equipment', 'maintenance', 'other'])
      );
    });

    it('should have valid category structure', () => {
      COST_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('color');
        expect(category).toHaveProperty('unit');
        expect(category).toHaveProperty('typicalPriceRange');
        expect(category.typicalPriceRange).toHaveProperty('min');
        expect(category.typicalPriceRange).toHaveProperty('max');
      });
    });
  });

  describe('createCost', () => {
    it('should create cost with calculated total', async () => {
      const { addDoc, collection } = require('firebase/firestore');
      const mockDocRef = { id: 'cost123' };
      addDoc.mockResolvedValue(mockDocRef);

      const result = await CostService.createCost(mockCost);

      expect(addDoc).toHaveBeenCalledWith(
        collection(undefined, 'costs'),
        expect.objectContaining({
          ...mockCost,
          totalCost: 1250, // 50 * 25
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      );
      expect(result).toBe('cost123');
    });

    it('should handle create cost error', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockRejectedValue(new Error('Firebase error'));

      await expect(CostService.createCost(mockCost)).rejects.toThrow('Firebase error');
    });
  });

  describe('updateCost', () => {
    it('should update cost and recalculate total', async () => {
      const { updateDoc, doc, getDoc } = require('firebase/firestore');
      
      // Mock existing cost
      const mockExistingCost = {
        ...mockCost,
        totalCost: 1250,
      };
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockExistingCost,
      });

      await CostService.updateCost('cost123', {
        amount: 60,
        unitPrice: 30,
      });

      expect(updateDoc).toHaveBeenCalledWith(
        doc(undefined, 'costs', 'cost123'),
        expect.objectContaining({
          amount: 60,
          unitPrice: 30,
          totalCost: 1800, // 60 * 30
          updatedAt: expect.any(Object),
        })
      );
    });

    it('should handle update cost error', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockRejectedValue(new Error('Update error'));

      await expect(CostService.updateCost('cost123', { amount: 100 })).rejects.toThrow('Update error');
    });
  });

  describe('deleteCost', () => {
    it('should delete cost', async () => {
      const { deleteDoc, doc } = require('firebase/firestore');
      deleteDoc.mockResolvedValue(undefined);

      await CostService.deleteCost('cost123');

      expect(deleteDoc).toHaveBeenCalledWith(doc(undefined, 'costs', 'cost123'));
    });

    it('should handle delete cost error', async () => {
      const { deleteDoc } = require('firebase/firestore');
      deleteDoc.mockRejectedValue(new Error('Delete error'));

      await expect(CostService.deleteCost('cost123')).rejects.toThrow('Delete error');
    });
  });

  describe('getCostSummary', () => {
    it('should calculate cost summary correctly', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      const mockCosts = [
        { ...mockCost, totalCost: 1250, category: 'fertilizer', date: '2024-01-15' },
        { ...mockCost, totalCost: 600, category: 'labor', date: '2024-01-20' },
        { ...mockCost, totalCost: 400, category: 'fertilizer', date: '2024-02-15' },
      ];

      getDocs.mockResolvedValue({
        docs: mockCosts.map(cost => ({ id: 'test', data: () => cost })),
      });

      const result = await CostService.getCostSummary(mockUserId);

      expect(result).toEqual({
        totalCost: 2250,
        byCategory: {
          fertilizer: 1650, // 1250 + 400
          labor: 600,
        },
        byMonth: {
          '2024-01': 1850, // 1250 + 600
          '2024-02': 400,
        },
      });
    });

    it('should handle empty costs', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });

      const result = await CostService.getCostSummary(mockUserId);

      expect(result).toEqual({
        totalCost: 0,
        byCategory: {},
        byMonth: {},
      });
    });
  });

  describe('getMonthlyCostTrend', () => {
    it('should return monthly cost trend', async () => {
      const { getDocs, collection, query, where, orderBy } = require('firebase/firestore');
      
      // Mock current date to be 2024-03-01 for consistent testing
      const mockDate = new Date('2024-03-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const mockCosts = [
        { ...mockCost, totalCost: 1000, date: '2024-01-15' },
        { ...mockCost, totalCost: 1500, date: '2024-02-20' },
        { ...mockCost, totalCost: 800, date: '2024-03-10' },
      ];

      getDocs.mockResolvedValue({
        docs: mockCosts.map(cost => ({ id: 'test', data: () => cost })),
      });

      const result = await CostService.getMonthlyCostTrend(mockUserId, 3);

      // The function returns only months with data, not all months
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result).toContainEqual({ month: '2024-03', cost: 800 });
      
      jest.restoreAllMocks();
    });

    it('should return only months with costs when no data for some months', async () => {
      const { getDocs } = require('firebase/firestore');
      
      // Mock current date to be 2024-03-01
      const mockDate = new Date('2024-03-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const mockCosts = [
        { ...mockCost, totalCost: 800, date: '2024-03-10' },
      ];

      getDocs.mockResolvedValue({
        docs: mockCosts.map(cost => ({ id: 'test', data: () => cost })),
      });

      const result = await CostService.getMonthlyCostTrend(mockUserId, 3);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ month: '2024-03', cost: 800 });
      
      jest.restoreAllMocks();
    });

    it('should return initialized months when no costs', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });

      const result = await CostService.getMonthlyCostTrend(mockUserId, 3);

      // The function returns initialized months with zero costs
      expect(result).toHaveLength(3);
      result.forEach(month => {
        expect(month.cost).toBe(0);
      });
    });
  });
});
