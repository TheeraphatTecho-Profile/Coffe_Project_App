import {
  mockAddDoc,
  mockUpdateDoc,
  mockGetDoc,
} from './firebase.mock';

// Must import after mocks are set up
import { HarvestService, Harvest } from '../../lib/firebaseDb';

describe('HarvestService Data Integrity', () => {
  const mockUserId = 'test-user-id';
  const mockFarmId = 'test-farm-id';

  // Helper function to create valid harvest data
  const createValidHarvest = (overrides: Partial<Harvest> = {}) => ({
    farm_id: mockFarmId,
    harvest_date: '2024-03-15',
    variety: 'Arabica',
    weight_kg: 50,
    income: 5000,
    shift: 'morning',
    notes: 'Good harvest',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock addDoc to return a document reference with id
    mockAddDoc.mockResolvedValue({ id: 'new-harvest-id' });
    mockUpdateDoc.mockResolvedValue(undefined);
    
    // Mock getDoc to return a document with the data passed to addDoc
    mockGetDoc.mockImplementation(() => {
      return Promise.resolve({
        id: 'new-harvest-id',
        exists: () => true,
        data: () => ({
          farm_id: mockFarmId,
          harvest_date: '2024-03-15',
          variety: 'Arabica',
          weight_kg: 50,
          income: 5000,
          shift: 'morning',
          notes: 'Good harvest',
          user_id: mockUserId,
          created_at: 'SERVER_TIMESTAMP',
        }),
      });
    });
  });

  describe('create behavior', () => {
    it('should create harvest and call addDoc with correct data', async () => {
      const harvest = createValidHarvest();
      await HarvestService.create(mockUserId, harvest);
      
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(), // collection reference
        {
          ...harvest,
          user_id: mockUserId,
          created_at: 'SERVER_TIMESTAMP',
        }
      );
    });

    it('should call getDoc after addDoc', async () => {
      const harvest = createValidHarvest();
      await HarvestService.create(mockUserId, harvest);
      
      expect(mockGetDoc).toHaveBeenCalledWith({ id: 'new-harvest-id' });
    });

    it('should return harvest with id', async () => {
      const harvest = createValidHarvest();
      const result = await HarvestService.create(mockUserId, harvest);
      
      expect(result.id).toBe('new-harvest-id');
      expect(result.user_id).toBe(mockUserId);
      expect(result.farm_id).toBe(mockFarmId);
    });

    it('should handle any data passed to it (no validation)', async () => {
      const invalidHarvest = {
        farm_id: '',
        harvest_date: '',
        variety: null,
        weight_kg: -100,
        income: -500,
        shift: '',
        notes: null,
      };
      
      await expect(HarvestService.create(mockUserId, invalidHarvest)).resolves.toMatchObject({
        id: 'new-harvest-id',
        user_id: mockUserId,
      });
    });

    it('should handle negative weight (no validation)', async () => {
      const negativeWeightHarvest = createValidHarvest({ weight_kg: -50 });
      await expect(HarvestService.create(mockUserId, negativeWeightHarvest)).resolves.toBeDefined();
    });

    it('should handle negative income (no validation)', async () => {
      const negativeIncomeHarvest = createValidHarvest({ income: -1000 });
      await expect(HarvestService.create(mockUserId, negativeIncomeHarvest)).resolves.toBeDefined();
    });

    it('should handle extremely large values', async () => {
      const extremeHarvest = createValidHarvest({
        weight_kg: 999999,
        income: 999999999,
      });
      await expect(HarvestService.create(mockUserId, extremeHarvest)).resolves.toBeDefined();
    });
  });

  describe('update behavior', () => {
    it('should call updateDoc with correct parameters', async () => {
      const updateData = { weight_kg: 100, income: 10000 };
      await HarvestService.update('harvest-id', updateData);
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(), // document reference
        updateData
      );
    });

    it('should handle any update data (no validation)', async () => {
      const invalidUpdate = { weight_kg: -200, income: -5000 };
      await expect(HarvestService.update('harvest-id', invalidUpdate)).resolves.toBeUndefined();
    });
  });

  describe('data handling', () => {
    it('should pass through data without sanitization', async () => {
      const xssHarvest = createValidHarvest({ 
        variety: '<script>alert("xss")</script>',
        notes: "'; DROP TABLE harvests; --"
      });
      
      await expect(HarvestService.create(mockUserId, xssHarvest)).resolves.toBeDefined();
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          variety: '<script>alert("xss")</script>',
          notes: "'; DROP TABLE harvests; --"
        })
      );
    });

    it('should handle null and undefined values', async () => {
      const harvestWithNulls = createValidHarvest({
        variety: null,
        notes: null,
      });
      
      await expect(HarvestService.create(mockUserId, harvestWithNulls)).resolves.toBeDefined();
    });

    it('should handle invalid dates (no validation)', async () => {
      const invalidDateHarvest = createValidHarvest({
        harvest_date: 'not-a-real-date',
      });
      
      await expect(HarvestService.create(mockUserId, invalidDateHarvest)).resolves.toBeDefined();
    });

    it('should handle empty shift values', async () => {
      const emptyShiftHarvest = createValidHarvest({ shift: '' });
      await expect(HarvestService.create(mockUserId, emptyShiftHarvest)).resolves.toBeDefined();
    });
  });
});
