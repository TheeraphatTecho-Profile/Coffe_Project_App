import {
  mockGetDocs,
  mockGetDoc,
  mockAddDoc,
  mockUpdateDoc,
  mockDeleteDoc,
} from './firebase.mock';

// Must import after mocks are set up
import { FarmService, HarvestService } from '../../lib/firebaseDb';

describe('Service Error Handling', () => {
  const mockUserId = 'test-user-id';
  const mockFarmId = 'test-farm-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FarmService Error Handling', () => {
    describe('getAll', () => {
      it('should handle Firestore network errors', async () => {
        const networkError = new Error('Network request failed');
        mockGetDocs.mockRejectedValue(networkError);

        await expect(FarmService.getAll(mockUserId)).rejects.toThrow('Network request failed');
      });

      it('should handle permission denied errors', async () => {
        const permissionError = new Error('Permission denied');
        mockGetDocs.mockRejectedValue(permissionError);

        await expect(FarmService.getAll(mockUserId)).rejects.toThrow('Permission denied');
      });

      it('should handle unavailable service errors', async () => {
        const serviceError = new Error('Service unavailable');
        mockGetDocs.mockRejectedValue(serviceError);

        await expect(FarmService.getAll(mockUserId)).rejects.toThrow('Service unavailable');
      });
    });

    describe('getById', () => {
      it('should handle document not found errors', async () => {
        const notFoundError = new Error('Document not found');
        mockGetDoc.mockRejectedValue(notFoundError);

        await expect(FarmService.getById(mockFarmId)).rejects.toThrow('Document not found');
      });

      it('should handle invalid document ID errors', async () => {
        const invalidIdError = new Error('Invalid document ID');
        mockGetDoc.mockRejectedValue(invalidIdError);

        await expect(FarmService.getById('invalid-id')).rejects.toThrow('Invalid document ID');
      });
    });

    describe('create', () => {
      it('should handle create permission errors', async () => {
        const permissionError = new Error('Missing or insufficient permissions');
        mockAddDoc.mockRejectedValue(permissionError);
        mockGetDoc.mockResolvedValue({
          id: 'new-farm-id',
          exists: () => true,
          data: () => ({}),
        });

        const farmData = {
          name: 'Test Farm',
          area: 10,
          soilType: 'loam',
          waterSource: 'river',
          province: 'เลย',
          district: 'ภูเรือ',
          altitude: 600,
          variety: 'Arabica',
          treeCount: 1000,
          plantingYear: 2020,
          notes: 'Test farm',
        };

        await expect(FarmService.create(mockUserId, farmData)).rejects.toThrow('Missing or insufficient permissions');
      });

      it('should handle quota exceeded errors', async () => {
        const quotaError = new Error('Quota exceeded');
        mockAddDoc.mockRejectedValue(quotaError);

        const farmData = {
          name: 'Test Farm',
          area: 10,
          soilType: 'loam',
          waterSource: 'river',
          province: 'เลย',
          district: 'ภูเรือ',
          altitude: 600,
          variety: 'Arabica',
          treeCount: 1000,
          plantingYear: 2020,
          notes: 'Test farm',
        };

        await expect(FarmService.create(mockUserId, farmData)).rejects.toThrow('Quota exceeded');
      });

      it('should handle getDoc failures after successful addDoc', async () => {
        mockAddDoc.mockResolvedValue({ id: 'new-farm-id' });
        mockGetDoc.mockRejectedValue(new Error('Failed to retrieve created document'));

        const farmData = {
          name: 'Test Farm',
          area: 10,
          soilType: 'loam',
          waterSource: 'river',
          province: 'เลย',
          district: 'ภูเรือ',
          altitude: 600,
          variety: 'Arabica',
          treeCount: 1000,
          plantingYear: 2020,
          notes: 'Test farm',
        };

        await expect(FarmService.create(mockUserId, farmData)).rejects.toThrow('Failed to retrieve created document');
      });
    });

    describe('update', () => {
      it('should handle update permission errors', async () => {
        const permissionError = new Error('Missing or insufficient permissions');
        mockUpdateDoc.mockRejectedValue(permissionError);

        const updateData = { name: 'Updated Farm' };
        await expect(FarmService.update(mockFarmId, updateData)).rejects.toThrow('Missing or insufficient permissions');
      });

      it('should handle document not found on update', async () => {
        const notFoundError = new Error('Document not found');
        mockUpdateDoc.mockRejectedValue(notFoundError);

        const updateData = { name: 'Updated Farm' };
        await expect(FarmService.update('non-existent-id', updateData)).rejects.toThrow('Document not found');
      });

      it('should handle invalid update data errors', async () => {
        const invalidDataError = new Error('Invalid data format');
        mockUpdateDoc.mockRejectedValue(invalidDataError);

        const invalidUpdate = { area: -10 };
        await expect(FarmService.update(mockFarmId, invalidUpdate)).rejects.toThrow('Invalid data format');
      });
    });

    describe('delete', () => {
      it('should handle delete permission errors', async () => {
        const permissionError = new Error('Missing or insufficient permissions');
        mockDeleteDoc.mockRejectedValue(permissionError);

        await expect(FarmService.delete(mockFarmId)).rejects.toThrow('Missing or insufficient permissions');
      });

      it('should handle document not found on delete', async () => {
        const notFoundError = new Error('Document not found');
        mockDeleteDoc.mockRejectedValue(notFoundError);

        await expect(FarmService.delete('non-existent-id')).rejects.toThrow('Document not found');
      });
    });
  });

  describe('HarvestService Error Handling', () => {
    describe('getAll', () => {
      it('should handle Firestore network errors', async () => {
        const networkError = new Error('Network request failed');
        mockGetDocs.mockRejectedValue(networkError);

        await expect(HarvestService.getAll(mockUserId)).rejects.toThrow('Network request failed');
      });

      it('should handle query timeout errors', async () => {
        const timeoutError = new Error('Query timeout');
        mockGetDocs.mockRejectedValue(timeoutError);

        await expect(HarvestService.getAll(mockUserId)).rejects.toThrow('Query timeout');
      });
    });

    describe('getAll with farm filtering', () => {
      it('should handle invalid user ID errors', async () => {
        const invalidIdError = new Error('Invalid user ID');
        mockGetDocs.mockRejectedValue(invalidIdError);

        await expect(HarvestService.getAll('invalid-user-id')).rejects.toThrow('Invalid user ID');
      });

      it('should handle query execution errors', async () => {
        const queryError = new Error('Query execution failed');
        mockGetDocs.mockRejectedValue(queryError);

        await expect(HarvestService.getAll(mockUserId)).rejects.toThrow('Query execution failed');
      });
    });

    describe('create', () => {
      it('should handle create validation errors from Firestore', async () => {
        const validationError = new Error('Invalid harvest data');
        mockAddDoc.mockRejectedValue(validationError);
        mockGetDoc.mockResolvedValue({
          id: 'new-harvest-id',
          exists: () => true,
          data: () => ({}),
        });

        const harvestData = {
          farmId: mockFarmId,
          harvestDate: '2024-03-15',
          variety: 'Arabica',
          weightKg: 50,
          income: 5000,
          shift: 'morning',
          notes: 'Good harvest',
        };

        await expect(HarvestService.create(mockUserId, harvestData)).rejects.toThrow('Invalid harvest data');
      });

      it('should handle foreign key constraint errors', async () => {
        const constraintError = new Error('Foreign key constraint failed');
        mockAddDoc.mockRejectedValue(constraintError);

        const harvestData = {
          farmId: 'non-existent-farm',
          harvestDate: '2024-03-15',
          variety: 'Arabica',
          weightKg: 50,
          income: 5000,
          shift: 'morning',
          notes: 'Good harvest',
        };

        await expect(HarvestService.create(mockUserId, harvestData)).rejects.toThrow('Foreign key constraint failed');
      });
    });

    describe('update', () => {
      it('should handle update validation errors', async () => {
        const validationError = new Error('Invalid update data');
        mockUpdateDoc.mockRejectedValue(validationError);

        const invalidUpdate = { weightKg: -100 };
        await expect(HarvestService.update('harvest-id', invalidUpdate)).rejects.toThrow('Invalid update data');
      });
    });

    describe('delete', () => {
      it('should handle cascade delete restrictions', async () => {
        const cascadeError = new Error('Cannot delete harvest with existing records');
        mockDeleteDoc.mockRejectedValue(cascadeError);

        await expect(HarvestService.delete('harvest-with-records')).rejects.toThrow('Cannot delete harvest with existing records');
      });
    });
  });

  describe('Cross-Service Error Handling', () => {
    it('should handle concurrent operation conflicts', async () => {
      // Simulate concurrent update conflict
      const conflictError = new Error('Concurrent modification conflict');
      mockUpdateDoc.mockRejectedValue(conflictError);

      await expect(FarmService.update(mockFarmId, { name: 'Updated' })).rejects.toThrow('Concurrent modification conflict');
    });

    it('should handle service unavailable scenarios', async () => {
      const serviceUnavailable = new Error('Service temporarily unavailable');
      mockGetDocs.mockRejectedValue(serviceUnavailable);

      await expect(FarmService.getAll(mockUserId)).rejects.toThrow('Service temporarily unavailable');
      await expect(HarvestService.getAll(mockUserId)).rejects.toThrow('Service temporarily unavailable');
    });

    it('should handle authentication token expiration', async () => {
      const authError = new Error('Authentication token expired');
      mockGetDocs.mockRejectedValue(authError);

      await expect(FarmService.getAll(mockUserId)).rejects.toThrow('Authentication token expired');
    });
  });
});
