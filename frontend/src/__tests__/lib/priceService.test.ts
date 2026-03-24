import { PriceService } from '../../lib/priceService';

describe('PriceService', () => {
  describe('getMarketPrices', () => {
    it('should return market prices for specified days', async () => {
      const prices = await PriceService.getMarketPrices(7);
      expect(prices.length).toBeGreaterThan(0);
      expect(prices[0]).toHaveProperty('buyer');
      expect(prices[0]).toHaveProperty('price_per_kg');
      expect(prices[0]).toHaveProperty('grade');
      expect(prices[0]).toHaveProperty('date');
    });

    it('should filter by date range correctly', async () => {
      const prices30 = await PriceService.getMarketPrices(30);
      const prices7 = await PriceService.getMarketPrices(7);
      expect(prices7.length).toBeLessThan(prices30.length);
    });
  });

  describe('getPriceTrends', () => {
    it('should calculate daily price statistics', async () => {
      const trends = await PriceService.getPriceTrends(7);
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0]).toHaveProperty('date');
      expect(trends[0]).toHaveProperty('average_price');
      expect(trends[0]).toHaveProperty('min_price');
      expect(trends[0]).toHaveProperty('max_price');
      expect(trends[0]).toHaveProperty('volume_kg');
    });

    it('should have valid price ranges', async () => {
      const trends = await PriceService.getPriceTrends(7);
      trends.forEach(trend => {
        expect(trend.min_price).toBeLessThanOrEqual(trend.average_price);
        expect(trend.average_price).toBeLessThanOrEqual(trend.max_price);
      });
    });
  });

  describe('getBuyerComparison', () => {
    it('should return buyer comparison data', async () => {
      const comparison = await PriceService.getBuyerComparison();
      expect(comparison).toHaveLength(5);
      expect(comparison[0]).toHaveProperty('buyer');
      expect(comparison[0]).toHaveProperty('avg_price');
      expect(comparison[0]).toHaveProperty('reliability_score');
      expect(comparison[0]).toHaveProperty('payment_terms');
    });

    it('should sort by average price descending', async () => {
      const comparison = await PriceService.getBuyerComparison();
      for (let i = 1; i < comparison.length; i++) {
        expect(comparison[i-1].avg_price).toBeGreaterThanOrEqual(comparison[i].avg_price);
      }
    });
  });

  describe('getBestPriceForGrade', () => {
    it('should return best price for each grade', async () => {
      const gradeA = await PriceService.getBestPriceForGrade('A');
      const gradeB = await PriceService.getBestPriceForGrade('B');
      const gradeC = await PriceService.getBestPriceForGrade('C');

      expect(gradeA.price).toBeGreaterThanOrEqual(gradeB.price);
      expect(gradeB.price).toBeGreaterThanOrEqual(gradeC.price);
      expect(gradeA.buyer).toBeDefined();
      expect(gradeA.premium).toBeGreaterThan(0);
    });
  });

  describe('calculateProfitPotential', () => {
    it('should calculate profit metrics correctly', () => {
      const result = PriceService.calculateProfitPotential(100, 'A');
      expect(result.best_buyer).toBeDefined();
      expect(result.max_revenue).toBeGreaterThan(0);
      expect(result.price_difference).toBeGreaterThanOrEqual(0);
      expect(result.recommendation).toBeDefined();
    });

    it('should provide different recommendations by grade', () => {
      const gradeA = PriceService.calculateProfitPotential(100, 'A');
      const gradeB = PriceService.calculateProfitPotential(100, 'B');
      const gradeC = PriceService.calculateProfitPotential(100, 'C');

      expect(gradeA.recommendation).not.toBe(gradeB.recommendation);
      expect(gradeB.recommendation).not.toBe(gradeC.recommendation);
    });
  });

  describe('createPriceAlert', () => {
    it('should create price alert with generated ID', async () => {
      const alert = await PriceService.createPriceAlert({
        type: 'above',
        threshold: 130,
        active: true,
      });

      expect(alert.id).toMatch(/^alert-\d+$/);
      expect(alert.type).toBe('above');
      expect(alert.threshold).toBe(130);
      expect(alert.active).toBe(true);
      expect(alert.created_at).toBeDefined();
    });
  });

  describe('getPriceAlerts', () => {
    it('should return mock price alerts', async () => {
      const alerts = await PriceService.getPriceAlerts();
      expect(alerts).toHaveLength(2);
      expect(alerts[0]).toHaveProperty('type');
      expect(alerts[0]).toHaveProperty('threshold');
      expect(alerts[0]).toHaveProperty('active');
    });
  });
});
