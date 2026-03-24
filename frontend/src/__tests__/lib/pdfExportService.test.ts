/**
 * Unit tests for pdfExportService.
 */
import {
  generateFarmReport,
  generateAndShareReport,
  PdfFarmData,
  PdfHarvestData,
} from '../../lib/pdfExportService';

// Access the mocks set up in jest.setup.js
const Print = require('expo-print');
const Sharing = require('expo-sharing');

describe('pdfExportService', () => {
  const mockFarms: PdfFarmData[] = [
    {
      id: 'f1',
      name: 'สวนทดสอบ 1',
      area: 15,
      province: 'เลย',
      district: 'ภูเรือ',
      altitude: 850,
      variety: 'Arabica',
      treeCount: 500,
    },
    {
      id: 'f2',
      name: 'สวนทดสอบ 2',
      area: 8,
      province: 'เชียงราย',
      altitude: 1200,
      variety: 'Robusta',
      treeCount: 300,
    },
  ];

  const mockHarvests: PdfHarvestData[] = [
    {
      id: 'h1',
      farmName: 'สวนทดสอบ 1',
      harvestDate: '2569-01-15',
      weightKg: 120,
      pricePerKg: 180,
      quality: 'A',
    },
    {
      id: 'h2',
      farmName: 'สวนทดสอบ 2',
      harvestDate: '2569-02-20',
      weightKg: 85,
      pricePerKg: 200,
      quality: 'AA',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFarmReport', () => {
    it('generates PDF and returns URI on success', async () => {
      const result = await generateFarmReport(mockFarms, mockHarvests);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.uri).toBe('file:///mock/output.pdf');
      }
      expect(Print.printToFileAsync).toHaveBeenCalledTimes(1);
    });

    it('passes HTML string to printToFileAsync', async () => {
      await generateFarmReport(mockFarms, mockHarvests);

      const call = Print.printToFileAsync.mock.calls[0][0];
      expect(call.html).toContain('สวนทดสอบ 1');
      expect(call.html).toContain('Arabica');
      expect(call.html).toContain('รายงานสวนกาแฟ');
    });

    it('uses custom title when provided', async () => {
      await generateFarmReport(mockFarms, mockHarvests, {
        title: 'รายงานประจำเดือน',
      });

      const call = Print.printToFileAsync.mock.calls[0][0];
      expect(call.html).toContain('รายงานประจำเดือน');
    });

    it('handles empty arrays gracefully', async () => {
      const result = await generateFarmReport([], []);

      expect(result.success).toBe(true);
      const call = Print.printToFileAsync.mock.calls[0][0];
      // Should not contain farm or harvest table headings
      expect(call.html).not.toContain('ชื่อสวน');
    });

    it('returns error when printToFileAsync throws', async () => {
      Print.printToFileAsync.mockRejectedValueOnce(new Error('printer error'));

      const result = await generateFarmReport(mockFarms, mockHarvests);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ไม่สามารถสร้างรายงาน');
      }
    });
  });

  describe('generateAndShareReport', () => {
    it('generates PDF and shares on success', async () => {
      const result = await generateAndShareReport(mockFarms, mockHarvests);

      expect(result.success).toBe(true);
      expect(Sharing.isAvailableAsync).toHaveBeenCalledTimes(1);
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'file:///mock/output.pdf',
        expect.objectContaining({ mimeType: 'application/pdf' }),
      );
    });

    it('returns error when sharing is not available', async () => {
      Sharing.isAvailableAsync.mockResolvedValueOnce(false);

      const result = await generateAndShareReport(mockFarms, mockHarvests);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ไม่รองรับการแชร์');
      }
    });

    it('returns error when shareAsync throws', async () => {
      Sharing.shareAsync.mockRejectedValueOnce(new Error('share failed'));

      const result = await generateAndShareReport(mockFarms, mockHarvests);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ไม่สามารถแชร์');
      }
    });

    it('does not call share when PDF generation fails', async () => {
      Print.printToFileAsync.mockRejectedValueOnce(new Error('fail'));

      await generateAndShareReport(mockFarms, mockHarvests);

      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });
  });
});
