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
      f.treeCount?.toString() || '',
      f.plantingYear?.toString() || '',
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
      h.harvestDate,
      h.farms?.name || '',
      h.variety || '',
      h.weightKg.toString(),
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

  harvestsToHTML(harvests: Harvest[], year?: string): string {
    const total = harvests.reduce((s, h) => s + (h.weightKg || 0), 0);
    const income = harvests.reduce((s, h) => s + (h.income || 0), 0);
    const fmt = (n: number) => n.toLocaleString('th-TH', { maximumFractionDigits: 2 });
    const yearLabel = year ?? 'all';
    const rows = harvests
      .map(
        h => `<tr>
        <td>${h.harvestDate ?? '-'}</td>
        <td>${h.farms?.name ?? '-'}</td>
        <td>${h.shift ?? '-'}</td>
        <td style="text-align:right">${fmt(h.weightKg ?? 0)}</td>
        <td style="text-align:right">${fmt(h.income ?? 0)}</td>
        <td>${h.notes ?? ''}</td>
      </tr>`
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="th"><head>
<meta charset="UTF-8"/>
<title>Harvest Report</title>
<style>
body{font-family:sans-serif;padding:20px;color:#1a1a1a}
h1{color:#6B4226}
.cards{display:flex;gap:16px;margin:16px 0}
.card{background:#FFF8F3;border-radius:8px;padding:12px;min-width:120px}
.cl{font-size:11px;color:#888}.cv{font-size:22px;font-weight:700;color:#6B4226}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#6B4226;color:#fff;padding:8px;text-align:left}
td{padding:6px 8px;border-bottom:1px solid #eee}
tr:nth-child(even) td{background:#FFF8F3}
.foot{margin-top:16px;font-size:11px;color:#999}
@media print{body{padding:0}}
</style></head><body>
<h1>Harvest Report</h1>
<p style="color:#666;font-size:13px">Year: ${yearLabel} | Generated: ${new Date().toLocaleDateString()}</p>
<div class="cards">
<div class="card"><div class="cl">Entries</div><div class="cv">${harvests.length}</div></div>
<div class="card"><div class="cl">Total Weight (kg)</div><div class="cv">${fmt(total)}</div></div>
<div class="card"><div class="cl">Total Income</div><div class="cv">${fmt(income)}</div></div>
</div>
<table><thead><tr><th>Date</th><th>Farm</th><th>Shift</th><th>Weight (kg)</th><th>Income</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="foot">Coffee Farm App</p>
</body></html>`;
  },

  async exportHarvestsPDF(harvests: Harvest[], year?: string): Promise<void> {
    const html = this.harvestsToHTML(harvests, year);
    const filename = `harvest_report_${Date.now()}.html`;
    const file = new File(Paths.document, filename);
    await file.write(html);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: 'text/html', UTI: 'public.html' });
    }
  },
};

export default ExportService;
