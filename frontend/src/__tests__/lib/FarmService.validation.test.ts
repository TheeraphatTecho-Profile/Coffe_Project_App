import {
  mockAddDoc,
  mockUpdateDoc,
  mockGetDoc,
} from './firebase.mock';

// Must import after mocks are set up
import { FarmService, Farm } from '../../lib/firebaseDb';

describe('FarmService Data Integrity', () => {
  const mockUserId = 'test-user-id';

  // Helper function to create valid farm data
  const createValidFarm = (overrides: Partial<Farm> = {}) => ({
    name: 'Test Farm',
    area: 10,
    soil_type: 'loam',
    water_source: 'river',
    province: 'เลย',
    district: 'ภูเรือ',
    altitude: 600,
    variety: 'Arabica',
    tree_count: 1000,
    planting_year: 2020,
    notes: 'Test farm',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock addDoc to return a document reference with id
    mockAddDoc.mockResolvedValue({ id: 'new-farm-id' });
    mockUpdateDoc.mockResolvedValue(undefined);
    
    // Mock getDoc to return a document with the data passed to addDoc
    mockGetDoc.mockImplementation(() => {
      return Promise.resolve({
        id: 'new-farm-id',
        exists: () => true,
        data: () => ({
          name: 'Test Farm',
          area: 10,
          soil_type: 'loam',
          water_source: 'river',
          province: 'เลย',
          district: 'ภูเรือ',
          altitude: 600,
          variety: 'Arabica',
          tree_count: 1000,
          planting_year: 2020,
          notes: 'Test farm',
          user_id: mockUserId,
          created_at: 'SERVER_TIMESTAMP',
        }),
      });
    });
  });

  describe('create behavior', () => {
    it('should create farm and call addDoc with correct data', async () => {
      const farm = createValidFarm();
      await FarmService.create(mockUserId, farm);
      
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(), // collection reference
        {
          ...farm,
          user_id: mockUserId,
          created_at: 'SERVER_TIMESTAMP',
        }
      );
    });

    it('should call getDoc after addDoc', async () => {
      const farm = createValidFarm();
      await FarmService.create(mockUserId, farm);
      
      expect(mockGetDoc).toHaveBeenCalledWith({ id: 'new-farm-id' });
    });

    it('should return farm with id', async () => {
      const farm = createValidFarm();
      const result = await FarmService.create(mockUserId, farm);
      
      expect(result.id).toBe('new-farm-id');
      expect(result.user_id).toBe(mockUserId);
    });

    it('should handle any data passed to it (no validation)', async () => {
      const invalidFarm = {
        name: '',
        area: -10,
        soil_type: null,
        water_source: null,
        province: '',
        district: null,
        altitude: -1000,
        variety: null,
        tree_count: -500,
        planting_year: 3000,
        notes: null,
      };
      
      await expect(FarmService.create(mockUserId, invalidFarm)).resolves.toMatchObject({
        id: 'new-farm-id',
        user_id: mockUserId,
      });
    });
  });

  describe('update behavior', () => {
    it('should call updateDoc with correct parameters', async () => {
      const updateData = { variety: 'Robusta', notes: 'Updated' };
      await FarmService.update('farm-id', updateData);
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(), // document reference
        updateData
      );
    });

    it('should handle any update data (no validation)', async () => {
      const invalidUpdate = { area: -100, tree_count: -500 };
      await expect(FarmService.update('farm-id', invalidUpdate)).resolves.toBeUndefined();
    });
  });

  describe('data handling', () => {
    it('should pass through data without sanitization', async () => {
      const xssFarm = createValidFarm({ 
        name: '<script>alert("xss")</script>',
        notes: "'; DROP TABLE farms; --"
      });
      
      await expect(FarmService.create(mockUserId, xssFarm)).resolves.toBeDefined();
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: '<script>alert("xss")</script>',
          notes: "'; DROP TABLE farms; --"
        })
      );
    });

    it('should handle null and undefined values', async () => {
      const farmWithNulls = createValidFarm({
        variety: null,
        notes: null,
        district: null,
        altitude: null,
        tree_count: null,
        planting_year: null,
      });
      
      await expect(FarmService.create(mockUserId, farmWithNulls)).resolves.toBeDefined();
    });
  });
});
