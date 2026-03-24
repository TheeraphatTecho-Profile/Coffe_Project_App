import { filterHarvests, getAvailableYears, getFarmOptions, getShiftSummary, HarvestFilters } from '../../lib/harvestFilters';
import type { Harvest } from '../../lib/firebaseDb';

const baseHarvest = (overrides: Partial<Harvest> = {}): Harvest => ({
  id: overrides.id || 'h1',
  farmId: overrides.farmId || 'farm-1',
  harvestDate: overrides.harvestDate || '2024-03-15',
  variety: overrides.variety || 'Arabica',
  weightKg: overrides.weightKg ?? 50,
  income: overrides.income ?? 5000,
  shift: overrides.shift || 'morning',
  notes: overrides.notes || null,
  createdAt: overrides.createdAt as any,
  userId: overrides.userId || 'user-1',
  farms: overrides.farms || { name: 'Test Farm' },
});

describe('harvestFilters helpers', () => {
  const harvests: Harvest[] = [
    baseHarvest({ id: 'h1', harvestDate: '2024-03-01', shift: 'morning', farmId: 'farm-1', farms: { name: 'ภูหลวง' } }),
    baseHarvest({ id: 'h2', harvestDate: '2023-12-10', shift: 'afternoon', farmId: 'farm-2', farms: { name: 'ภูเรือ' }, weightKg: 80 }),
    baseHarvest({ id: 'h3', harvestDate: '2024-05-05', shift: 'evening', farmId: 'farm-1', farms: { name: 'ภูหลวง' }, weightKg: 20 }),
  ];

  describe('filterHarvests', () => {
    it('filters by Thai year', () => {
      const filtered = filterHarvests(harvests, { year: '2567' });
      expect(filtered.map(h => h.id)).toEqual(['h1', 'h3']);
    });

    it('filters by shift, farm, and search text', () => {
      const filters: HarvestFilters = { shift: 'afternoon', farmId: 'farm-2', search: 'ภูเรือ', year: 'ทั้งหมด' };
      const filtered = filterHarvests(harvests, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('h2');
    });

    it('returns all when filters cleared', () => {
      const filtered = filterHarvests(harvests, { search: '   ' });
      expect(filtered).toHaveLength(harvests.length);
    });
  });

  describe('getAvailableYears', () => {
    it('returns unique sorted Thai years', () => {
      const years = getAvailableYears(harvests);
      expect(years).toEqual(['2567', '2566']);
    });
  });

  describe('getFarmOptions', () => {
    it('returns unique farm entries', () => {
      const options = getFarmOptions(harvests);
      expect(options).toEqual([
        { id: 'farm-1', name: 'ภูหลวง' },
        { id: 'farm-2', name: 'ภูเรือ' },
      ]);
    });
  });

  describe('getShiftSummary', () => {
    it('aggregates counts and weight per shift', () => {
      const summary = getShiftSummary(harvests);
      expect(summary).toEqual([
        expect.objectContaining({ id: 'afternoon', count: 1, totalWeight: 80 }),
        expect.objectContaining({ id: 'morning', count: 1, totalWeight: 50 }),
        expect.objectContaining({ id: 'evening', count: 1, totalWeight: 20 }),
      ]);
    });
  });
});
