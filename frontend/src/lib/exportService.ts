import { Farm, Harvest } from './firebaseDb';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const ExportService = {
  /**
   * Convert farms array to CSV string.
   */
  farmsToCSV(farms: Farm[]): string {
    const headers = ['Name', 'Area', 'Province', 'District', 'Variety', 'Tree Count', 'Planting Year', 'Notes'];
    const rows = farms.map(f => [
      f.name,
      f.area.toString(),
      f.province,
      f.district || '',
      f.variety || '',
      f.tree_count?.toString() || '',
      f.planting_year?.toString() || '',
      f.notes || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  },

  /**
   * Convert harvests array to CSV string.
   */
  harvestsToCSV(harvests: Harvest[]): string {
    const headers = ['Date', 'Farm', 'Variety', 'Weight (kg)', 'Income', 'Shift', 'Notes'];
    const rows = harvests.map(h => [
      h.harvest_date,
      h.farms?.name || '',
      h.variety || '',
      h.weight_kg.toString(),
      h.income.toString(),
      h.shift,
      h.notes || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  },

  /**
   * Export farms data to CSV and share.
   */
  async exportFarms(farms: Farm[]): Promise<void> {
    const csv = this.farmsToCSV(farms);
    const filename = `farms_${Date.now()}.csv`;
    const file = new File(Paths.document, filename);

    await file.write(csv);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    }
  },

  /**
   * Export harvests data to CSV and share.
   */
  async exportHarvests(harvests: Harvest[]): Promise<void> {
    const csv = this.harvestsToCSV(harvests);
    const filename = `harvests_${Date.now()}.csv`;
    const file = new File(Paths.document, filename);

    await file.write(csv);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    }
  },

  /**
   * Export all data (farms + harvests) to a single CSV and share.
   */
  async exportAll(farms: Farm[], harvests: Harvest[]): Promise<void> {
    const csv = `FARMS\n${this.farmsToCSV(farms)}\n\nHARVESTS\n${this.harvestsToCSV(harvests)}`;
    const filename = `coffee_farm_export_${Date.now()}.csv`;
    const file = new File(Paths.document, filename);

    await file.write(csv);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    }
  },
};

export default ExportService;
