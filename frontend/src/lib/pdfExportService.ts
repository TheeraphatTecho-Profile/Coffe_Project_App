/**
 * PDF Export Service for Coffee Farm app.
 *
 * Generates a styled HTML report from farm and harvest data,
 * then converts it to a PDF file via expo-print and shares it
 * via the native share dialog.
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ─── Types ───────────────────────────────────────────────────────

/** Minimal shape expected from the Farm record. */
export interface PdfFarmData {
  id: string;
  name: string;
  area: number;
  province: string;
  district?: string | null;
  altitude?: number | null;
  variety?: string | null;
  treeCount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

/** Minimal shape expected from the Harvest record. */
export interface PdfHarvestData {
  id: string;
  farmName?: string;
  harvestDate: string;
  weightKg: number;
  pricePerKg?: number;
  quality?: string;
  notes?: string;
}

/** Options for generating a report. */
export interface PdfReportOptions {
  title?: string;
  subtitle?: string;
  generatedBy?: string;
}

// ─── Result type ─────────────────────────────────────────────────

export type PdfResult =
  | { success: true; uri: string }
  | { success: false; error: string };

// ─── HTML template helpers ───────────────────────────────────────

/** Format a number with Thai locale separators. */
function fmtNum(n: number | null | undefined): string {
  if (n == null) return '-';
  return n.toLocaleString('th-TH');
}

/** Format currency (THB). */
function fmtCurrency(n: number | null | undefined): string {
  if (n == null) return '-';
  return `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Build the full HTML string for the report. */
function buildReportHtml(
  farms: PdfFarmData[],
  harvests: PdfHarvestData[],
  options: PdfReportOptions,
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalWeight = harvests.reduce((sum, h) => sum + h.weightKg, 0);
  const totalRevenue = harvests.reduce((sum, h) => sum + h.weightKg * (h.pricePerKg ?? 0), 0);
  const avgPrice = harvests.length > 0
    ? harvests.reduce((sum, h) => sum + (h.pricePerKg ?? 0), 0) / harvests.length
    : 0;

  const farmRows = farms
    .map(
      (f) => `
      <tr>
        <td>${f.name}</td>
        <td>${fmtNum(f.area)} ไร่</td>
        <td>${f.province}${f.district ? `, ${f.district}` : ''}</td>
        <td>${f.variety ?? '-'}</td>
        <td>${fmtNum(f.altitude)} ม.</td>
        <td>${fmtNum(f.treeCount)}</td>
      </tr>`,
    )
    .join('');

  const harvestRows = harvests
    .map(
      (h) => `
      <tr>
        <td>${h.farmName ?? '-'}</td>
        <td>${h.harvestDate}</td>
        <td>${fmtNum(h.weightKg)} กก.</td>
        <td>${fmtCurrency(h.pricePerKg)}/กก.</td>
        <td>${fmtCurrency(h.weightKg * (h.pricePerKg ?? 0))}</td>
        <td>${h.quality ?? '-'}</td>
      </tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 20mm 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Kanit', 'Sarabun', sans-serif;
      font-size: 12px;
      color: #1A2332;
      line-height: 1.6;
    }

    /* Header */
    .header {
      text-align: center;
      border-bottom: 3px solid #2E7D32;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 22px;
      color: #2E7D32;
      margin: 0 0 4px;
    }
    .header .subtitle {
      font-size: 14px;
      color: #5A6B7D;
    }
    .header .meta {
      font-size: 10px;
      color: #8E9AAD;
      margin-top: 6px;
    }

    /* Summary cards */
    .summary {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .summary .card {
      flex: 1;
      background: #F0F7F1;
      border-radius: 8px;
      padding: 14px;
      text-align: center;
    }
    .summary .card .value {
      font-size: 20px;
      font-weight: 700;
      color: #2E7D32;
    }
    .summary .card .label {
      font-size: 10px;
      color: #5A6B7D;
      margin-top: 4px;
    }

    /* Section title */
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1B5E20;
      margin: 24px 0 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #E2E8F0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      background: #2E7D32;
      color: white;
      font-weight: 600;
      font-size: 11px;
      padding: 8px 6px;
      text-align: left;
    }
    td {
      padding: 7px 6px;
      font-size: 11px;
      border-bottom: 1px solid #EDF2F7;
    }
    tr:nth-child(even) td { background: #F7FAFC; }

    /* Footer */
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 9px;
      color: #8E9AAD;
      border-top: 1px solid #E2E8F0;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>☕ ${options.title ?? 'รายงานสวนกาแฟ'}</h1>
    <div class="subtitle">${options.subtitle ?? 'สรุปข้อมูลสวนและผลผลิต'}</div>
    <div class="meta">วันที่ออกรายงาน: ${dateStr} | โดย: ${options.generatedBy ?? 'ระบบ Coffee Farm App'}</div>
  </div>

  <div class="summary">
    <div class="card">
      <div class="value">${farms.length}</div>
      <div class="label">สวนทั้งหมด</div>
    </div>
    <div class="card">
      <div class="value">${fmtNum(totalWeight)} กก.</div>
      <div class="label">ผลผลิตรวม</div>
    </div>
    <div class="card">
      <div class="value">${fmtCurrency(totalRevenue)}</div>
      <div class="label">รายได้รวม</div>
    </div>
    <div class="card">
      <div class="value">${fmtCurrency(avgPrice)}/กก.</div>
      <div class="label">ราคาเฉลี่ย</div>
    </div>
  </div>

  ${farms.length > 0 ? `
  <div class="section-title">🌱 ข้อมูลสวน (${farms.length} สวน)</div>
  <table>
    <thead>
      <tr>
        <th>ชื่อสวน</th>
        <th>พื้นที่</th>
        <th>ที่ตั้ง</th>
        <th>สายพันธุ์</th>
        <th>ระดับความสูง</th>
        <th>จำนวนต้น</th>
      </tr>
    </thead>
    <tbody>${farmRows}</tbody>
  </table>` : ''}

  ${harvests.length > 0 ? `
  <div class="section-title">📦 ประวัติเก็บเกี่ยว (${harvests.length} รายการ)</div>
  <table>
    <thead>
      <tr>
        <th>สวน</th>
        <th>วันที่เก็บ</th>
        <th>น้ำหนัก</th>
        <th>ราคา</th>
        <th>มูลค่า</th>
        <th>คุณภาพ</th>
      </tr>
    </thead>
    <tbody>${harvestRows}</tbody>
  </table>` : ''}

  <div class="footer">
    สร้างโดย Coffee Farm App — รายงานนี้เป็นข้อมูลสรุปจากระบบ ไม่ใช่เอกสารทางการ
  </div>
</body>
</html>`;
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Generate a PDF report from farm and harvest data.
 *
 * @param farms    Array of farm records to include.
 * @param harvests Array of harvest records to include.
 * @param options  Optional title / subtitle overrides.
 * @returns PdfResult with the file URI on success.
 */
export async function generateFarmReport(
  farms: PdfFarmData[],
  harvests: PdfHarvestData[],
  options: PdfReportOptions = {},
): Promise<PdfResult> {
  try {
    const html = buildReportHtml(farms, harvests, options);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    return { success: true, uri };
  } catch (err) {
    console.error('[pdfExportService] generateFarmReport failed:', err);
    return {
      success: false,
      error: 'ไม่สามารถสร้างรายงาน PDF ได้ กรุณาลองอีกครั้ง',
    };
  }
}

/**
 * Generate a PDF and immediately open the native share dialog.
 *
 * @returns PdfResult – the URI can be used to show a success toast.
 */
export async function generateAndShareReport(
  farms: PdfFarmData[],
  harvests: PdfHarvestData[],
  options: PdfReportOptions = {},
): Promise<PdfResult> {
  const result = await generateFarmReport(farms, harvests, options);
  if (!result.success) return result;

  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      return { success: false, error: 'อุปกรณ์นี้ไม่รองรับการแชร์ไฟล์' };
    }

    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'แชร์รายงานสวนกาแฟ',
      UTI: 'com.adobe.pdf',
    });

    return result;
  } catch (err) {
    console.error('[pdfExportService] share failed:', err);
    return {
      success: false,
      error: 'ไม่สามารถแชร์ไฟล์ได้ กรุณาลองอีกครั้ง',
    };
  }
}
