import { Harvest } from './firebaseDb';

export type HarvestFilters = {
  search?: string;
  year?: string; // Thai year (พ.ศ.) or 'ทั้งหมด'
  shift?: string; // 'all' | shift id in lowercase
  farmId?: string; // 'all' or farm_id
};

const DEFAULT_FILTERS: Required<HarvestFilters> = {
  search: '',
  year: 'ทั้งหมด',
  shift: 'all',
  farmId: 'all',
};

export const toThaiYear = (dateValue?: string | Date | null): string => {
  if (!dateValue) return '';
  try {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const year = date.getFullYear();
    if (Number.isNaN(year)) return '';
    return String(year + 543);
  } catch {
    return '';
  }
};

export const normalizeShift = (shift?: string | null): string => (shift || '').toLowerCase();

export function filterHarvests(harvests: Harvest[], filters: HarvestFilters = {}): Harvest[] {
  const { search, year, shift, farmId } = { ...DEFAULT_FILTERS, ...filters };
  const queryText = search.trim().toLowerCase();

  return harvests.filter((harvest) => {
    const thaiYear = toThaiYear(harvest.harvest_date);
    if (year !== 'ทั้งหมด' && thaiYear !== year) {
      return false;
    }

    if (shift !== 'all' && normalizeShift(harvest.shift) !== shift) {
      return false;
    }

    if (farmId !== 'all' && harvest.farm_id !== farmId) {
      return false;
    }

    if (queryText) {
      const haystack = [
        harvest.harvest_date,
        thaiYear,
        harvest.variety,
        normalizeShift(harvest.shift),
        harvest.farms?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(queryText)) {
        return false;
      }
    }

    return true;
  });
}

export function getAvailableYears(harvests: Harvest[]): string[] {
  const years = new Set<string>();
  harvests.forEach((harvest) => {
    const thaiYear = toThaiYear(harvest.harvest_date);
    if (thaiYear) {
      years.add(thaiYear);
    }
  });

  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

export function getFarmOptions(harvests: Harvest[]): { id: string; name: string }[] {
  const map = new Map<string, string>();
  harvests.forEach((harvest) => {
    if (harvest.farm_id) {
      const displayName = harvest.farms?.name || 'ไร่กาแฟ';
      if (!map.has(harvest.farm_id)) {
        map.set(harvest.farm_id, displayName);
      }
    }
  });

  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}

export type ShiftSummary = {
  id: string;
  label: string;
  count: number;
  totalWeight: number;
};

const SHIFT_LABELS: Record<string, string> = {
  morning: 'เช้า',
  afternoon: 'บ่าย',
  evening: 'กลางคืน',
};

export function getShiftSummary(harvests: Harvest[]): ShiftSummary[] {
  const summary = new Map<string, ShiftSummary>();

  harvests.forEach((harvest) => {
    const shift = normalizeShift(harvest.shift) || 'อื่นๆ';
    if (!summary.has(shift)) {
      summary.set(shift, {
        id: shift,
        label: SHIFT_LABELS[shift] || shift,
        count: 0,
        totalWeight: 0,
      });
    }

    const bucket = summary.get(shift)!;
    bucket.count += 1;
    bucket.totalWeight += harvest.weight_kg || 0;
  });

  return Array.from(summary.values()).sort((a, b) => b.totalWeight - a.totalWeight);
}
