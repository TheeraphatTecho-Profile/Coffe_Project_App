import {
  mockGetDocs,
  mockGetDoc,
  mockAddDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockDoc,
  mockHarvestDoc,
  mockEmptyDoc,
  mockQuerySnapshot,
} from './firebase.mock';

// Must import after mocks are set up
import { FarmService, HarvestService } from '../../lib/firebaseDb';

describe('FarmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all farms for a user', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([mockDoc]));

      const farms = await FarmService.getAll('user-1');

      expect(farms).toHaveLength(1);
      expect(farms[0].id).toBe('test-id-1');
      expect(farms[0].name).toBe('Test Farm');
      expect(farms[0].area).toBe(10);
    });

    it('should return empty array when no farms exist', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([]));

      const farms = await FarmService.getAll('user-1');

      expect(farms).toHaveLength(0);
    });

    it('should handle Firestore errors', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(FarmService.getAll('user-1')).rejects.toThrow('Firestore error');
    });
  });

  describe('getById', () => {
    it('should return a farm when it exists', async () => {
      mockGetDoc.mockResolvedValue(mockDoc);

      const farm = await FarmService.getById('test-id-1');

      expect(farm).not.toBeNull();
      expect(farm!.id).toBe('test-id-1');
      expect(farm!.name).toBe('Test Farm');
    });

    it('should return null when farm does not exist', async () => {
      mockGetDoc.mockResolvedValue(mockEmptyDoc);

      const farm = await FarmService.getById('nonexistent');

      expect(farm).toBeNull();
    });

    it('should handle Firestore errors', async () => {
      mockGetDoc.mockRejectedValue(new Error('Not found'));

      await expect(FarmService.getById('bad-id')).rejects.toThrow('Not found');
    });
  });

  describe('create', () => {
    it('should create a new farm and return it', async () => {
      const mockDocRef = { id: 'new-farm-id' };
      mockAddDoc.mockResolvedValue(mockDocRef);
      mockGetDoc.mockResolvedValue({
        id: 'new-farm-id',
        exists: () => true,
        data: () => ({
          name: 'New Farm',
          area: 5,
          soilType: 'clay',
          waterSource: 'stream',
          province: 'เลย',
          district: null,
          altitude: null,
          variety: null,
          treeCount: null,
          plantingYear: null,
          notes: null,
          userId: 'user-1',
          createdAt: 'SERVER_TIMESTAMP',
        }),
      });

      const farm = await FarmService.create('user-1', {
        name: 'New Farm',
        area: 5,
        soilType: 'clay',
        waterSource: 'stream',
        province: 'เลย',
        district: null,
        altitude: null,
        variety: null,
        treeCount: null,
        plantingYear: null,
        notes: null,
      });

      expect(farm.id).toBe('new-farm-id');
      expect(farm.name).toBe('New Farm');
      expect(mockAddDoc).toHaveBeenCalledTimes(1);
    });

    it('should handle creation errors', async () => {
      mockAddDoc.mockRejectedValue(new Error('Permission denied'));

      await expect(
        FarmService.create('user-1', {
          name: 'Fail Farm',
          area: 1,
          soilType: null,
          waterSource: null,
          province: 'เลย',
          district: null,
          altitude: null,
          variety: null,
          treeCount: null,
          plantingYear: null,
          notes: null,
        }),
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('update', () => {
    it('should update a farm', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await expect(FarmService.update('test-id-1', { name: 'Updated Farm' })).resolves.toBeUndefined();
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    });

    it('should handle update errors', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      await expect(FarmService.update('bad-id', { name: 'X' })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete a farm', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await expect(FarmService.delete('test-id-1')).resolves.toBeUndefined();
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    });

    it('should handle delete errors', async () => {
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));

      await expect(FarmService.delete('bad-id')).rejects.toThrow('Delete failed');
    });
  });

  describe('count', () => {
    it('should return farm count for a user', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([mockDoc, mockDoc, mockDoc]));

      const count = await FarmService.count('user-1');

      expect(count).toBe(3);
    });

    it('should return 0 when no farms', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([]));

      const count = await FarmService.count('user-1');

      expect(count).toBe(0);
    });
  });
});

describe('HarvestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear internal farm name cache to prevent cross-test pollution
    HarvestService._farmNameCache = {};
  });

  describe('getAll', () => {
    it('should return harvests with farm names', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([mockHarvestDoc]));
      mockGetDoc.mockResolvedValue(mockDoc); // Farm lookup

      const harvests = await HarvestService.getAll('user-1');

      expect(harvests).toHaveLength(1);
      expect(harvests[0].weightKg).toBe(50);
      expect(harvests[0].farms?.name).toBe('Test Farm');
    });

    it('should return empty array when no harvests', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([]));

      const harvests = await HarvestService.getAll('user-1');

      expect(harvests).toHaveLength(0);
    });

    it('should handle missing farm gracefully', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([mockHarvestDoc]));
      mockGetDoc.mockResolvedValue(mockEmptyDoc);

      const harvests = await HarvestService.getAll('user-1');

      expect(harvests).toHaveLength(1);
      expect(harvests[0].farms?.name).toBe('');
    });
  });

  describe('getById', () => {
    it('should return a harvest with farm name', async () => {
      mockGetDoc
        .mockResolvedValueOnce(mockHarvestDoc) // Harvest lookup
        .mockResolvedValueOnce(mockDoc); // Farm lookup

      const harvest = await HarvestService.getById('harvest-1');

      expect(harvest).not.toBeNull();
      expect(harvest!.weightKg).toBe(50);
      expect(harvest!.farms?.name).toBe('Test Farm');
    });

    it('should return null when harvest does not exist', async () => {
      mockGetDoc.mockResolvedValue(mockEmptyDoc);

      const harvest = await HarvestService.getById('nonexistent');

      expect(harvest).toBeNull();
    });

    it('should handle missing farm in harvest', async () => {
      mockGetDoc
        .mockResolvedValueOnce(mockHarvestDoc)
        .mockResolvedValueOnce(mockEmptyDoc);

      const harvest = await HarvestService.getById('harvest-1');

      expect(harvest).not.toBeNull();
      expect(harvest!.farms?.name).toBe('');
    });
  });

  describe('create', () => {
    it('should create a new harvest', async () => {
      const mockDocRef = { id: 'new-harvest-id' };
      mockAddDoc.mockResolvedValue(mockDocRef);
      mockGetDoc.mockResolvedValue({
        id: 'new-harvest-id',
        exists: () => true,
        data: () => ({
          farmId: 'test-id-1',
          harvestDate: '2024-03-20',
          variety: 'Robusta',
          weightKg: 30,
          income: 3000,
          shift: 'afternoon',
          notes: null,
          userId: 'user-1',
          createdAt: 'SERVER_TIMESTAMP',
        }),
      });

      const harvest = await HarvestService.create('user-1', {
        farmId: 'test-id-1',
        harvestDate: '2024-03-20',
        variety: 'Robusta',
        weightKg: 30,
        income: 3000,
        shift: 'afternoon',
        notes: null,
      });

      expect(harvest.id).toBe('new-harvest-id');
      expect(harvest.weightKg).toBe(30);
      expect(mockAddDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a harvest', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await expect(HarvestService.update('harvest-1', { weightKg: 60 })).resolves.toBeUndefined();
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a harvest', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await expect(HarvestService.delete('harvest-1')).resolves.toBeUndefined();
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSummary', () => {
    it('should calculate correct totals', async () => {
      const harvestDoc1 = {
        id: 'h1',
        data: () => ({ weightKg: 50, income: 5000 }),
      };
      const harvestDoc2 = {
        id: 'h2',
        data: () => ({ weightKg: 30, income: 3000 }),
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([harvestDoc1, harvestDoc2]));

      const summary = await HarvestService.getSummary('user-1');

      expect(summary.totalWeight).toBe(80);
      expect(summary.totalIncome).toBe(8000);
    });

    it('should return zeros when no harvests', async () => {
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([]));

      const summary = await HarvestService.getSummary('user-1');

      expect(summary.totalWeight).toBe(0);
      expect(summary.totalIncome).toBe(0);
    });

    it('should handle null/undefined values', async () => {
      const harvestWithNulls = {
        id: 'h1',
        data: () => ({ weightKg: null, income: undefined }),
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot([harvestWithNulls]));

      const summary = await HarvestService.getSummary('user-1');

      expect(summary.totalWeight).toBe(0);
      expect(summary.totalIncome).toBe(0);
    });
  });
});
