import { ExportService } from '../../lib/exportService';
import type { Farm, Harvest } from '../../lib/firebaseDb';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((_dir: any, name: string) => ({
    uri: `file:///mock/${name}`,
    write: jest.fn().mockResolvedValue(undefined),
  })),
  Paths: {
    document: '/mock/documents',
  },
}));

// Mock expo-sharing
const mockShareAsync = jest.fn().mockResolvedValue(undefined);
const mockIsAvailableAsync = jest.fn().mockResolvedValue(true);
jest.mock('expo-sharing', () => ({
  shareAsync: (...args: any[]) => mockShareAsync(...args),
  isAvailableAsync: () => mockIsAvailableAsync(),
}));

const mockFarms: Farm[] = [
  {
    id: 'farm-1',
    name: 'Test Farm',
    area: 10,
    soil_type: 'loam',
    water_source: 'rain',
    province: 'เลย',
    district: 'ภูเรือ',
    altitude: 800,
    variety: 'Arabica',
    tree_count: 500,
    planting_year: 2020,
    notes: null,
    created_at: { seconds: 1710000000, nanoseconds: 0 } as any,
    user_id: 'user-1',
  },
];

const mockHarvests: Harvest[] = [
  {
    id: 'harvest-1',
    farm_id: 'farm-1',
    harvest_date: '2024-03-15',
    variety: 'Arabica',
    weight_kg: 50,
    income: 5000,
    shift: 'morning',
    notes: 'Good harvest',
    created_at: { seconds: 1710000000, nanoseconds: 0 } as any,
    user_id: 'user-1',
    farms: { name: 'Test Farm' },
  },
];

describe('ExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('farmsToCSV', () => {
    it('should generate valid CSV headers', () => {
      const csv = ExportService.farmsToCSV(mockFarms);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('Name,Area,Province,District,Variety,Tree Count,Planting Year,Notes');
    });

    it('should include farm data in CSV rows', () => {
      const csv = ExportService.farmsToCSV(mockFarms);
      const lines = csv.split('\n');

      expect(lines[1]).toContain('"Test Farm"');
      expect(lines[1]).toContain('"10"');
      expect(lines[1]).toContain('"เลย"');
      expect(lines[1]).toContain('"Arabica"');
    });

    it('should handle empty farms array', () => {
      const csv = ExportService.farmsToCSV([]);
      const lines = csv.split('\n');

      expect(lines).toHaveLength(1); // Only headers
    });

    it('should handle null values gracefully', () => {
      const farmWithNulls: Farm = {
        ...mockFarms[0],
        district: null,
        variety: null,
        notes: null,
      };
      const csv = ExportService.farmsToCSV([farmWithNulls]);

      expect(csv).toContain('""'); // Empty quoted strings for null values
    });
  });

  describe('harvestsToCSV', () => {
    it('should generate valid CSV headers', () => {
      const csv = ExportService.harvestsToCSV(mockHarvests);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('Date,Farm,Variety,Weight (kg),Income,Shift,Notes');
    });

    it('should include harvest data in CSV rows', () => {
      const csv = ExportService.harvestsToCSV(mockHarvests);
      const lines = csv.split('\n');

      expect(lines[1]).toContain('"2024-03-15"');
      expect(lines[1]).toContain('"Test Farm"');
      expect(lines[1]).toContain('"50"');
      expect(lines[1]).toContain('"5000"');
    });

    it('should handle empty harvests array', () => {
      const csv = ExportService.harvestsToCSV([]);
      const lines = csv.split('\n');

      expect(lines).toHaveLength(1);
    });

    it('should handle missing farm name', () => {
      const harvestNoFarm: Harvest = {
        ...mockHarvests[0],
        farms: undefined,
      };
      const csv = ExportService.harvestsToCSV([harvestNoFarm]);

      expect(csv).toBeDefined();
    });
  });

  describe('exportFarms', () => {
    it('should create file and share it', async () => {
      await ExportService.exportFarms(mockFarms);

      expect(mockShareAsync).toHaveBeenCalledTimes(1);
    });

    it('should not share if sharing is unavailable', async () => {
      mockIsAvailableAsync.mockResolvedValueOnce(false);

      await ExportService.exportFarms(mockFarms);

      expect(mockShareAsync).not.toHaveBeenCalled();
    });
  });

  describe('exportHarvests', () => {
    it('should create file and share it', async () => {
      await ExportService.exportHarvests(mockHarvests);

      expect(mockShareAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('exportAll', () => {
    it('should create combined CSV and share', async () => {
      await ExportService.exportAll(mockFarms, mockHarvests);

      expect(mockShareAsync).toHaveBeenCalledTimes(1);
    });
  });
});
