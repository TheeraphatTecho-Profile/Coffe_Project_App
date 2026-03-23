export interface MarketPrice {
  id: string;
  buyer: string;
  location: string;
  price_per_kg: number;
  grade: 'A' | 'B' | 'C';
  date: string;
  region: string;
}

export interface PriceTrend {
  date: string;
  average_price: number;
  min_price: number;
  max_price: number;
  volume_kg: number;
}

export interface BuyerComparison {
  buyer: string;
  avg_price: number;
  total_volume: number;
  reliability_score: number;
  payment_terms: string;
  last_updated: string;
}

export interface PriceAlert {
  id: string;
  type: 'above' | 'below';
  threshold: number;
  buyer?: string;
  active: boolean;
  created_at: string;
}

const LOEI_BUYERS = [
  { name: 'โรงงานกาแฟภูหลวง', basePrice: 120, reliability: 4.5, terms: '15 วัน' },
  { name: 'บริษัท ลีโอคอฟฟี จำกัด', basePrice: 115, reliability: 4.2, terms: '30 วัน' },
  { name: 'ตลาดกลางเลย', basePrice: 110, reliability: 3.8, terms: 'เงินสด' },
  { name: 'ร้านกาแฟพิเศษ', basePrice: 125, reliability: 4.0, terms: '7 วัน' },
  { name: 'สหกรณ์เกษตรกรจังหวัดเลย', basePrice: 118, reliability: 4.7, terms: '21 วัน' },
];

const GRADE_PREMIUMS: Record<string, number> = {
  'A': 15,
  'B': 8,
  'C': 0,
};

function randomVariation(base: number, range: number = 0.1): number {
  return base + (Math.random() - 0.5) * base * range;
}

function generateHistoricalPrices(days: number): MarketPrice[] {
  const prices: MarketPrice[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    LOEI_BUYERS.forEach((buyer, index) => {
      ['A', 'B', 'C'].forEach(grade => {
        const basePrice = buyer.basePrice + GRADE_PREMIUMS[grade];
        prices.push({
          id: `price-${i}-${index}-${grade}`,
          buyer: buyer.name,
          location: 'จังหวัดเลย',
          price_per_kg: randomVariation(basePrice, 0.08),
          grade: grade as 'A' | 'B' | 'C',
          date: date.toISOString().split('T')[0],
          region: 'ภาคตะวันออกเฉียงเหนือ',
        });
      });
    });
  }
  
  return prices;
}

export class PriceService {
  private static historicalPrices: MarketPrice[] = generateHistoricalPrices(90);

  static async getMarketPrices(days: number = 30): Promise<MarketPrice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.historicalPrices.filter(price => 
      new Date(price.date) >= cutoffDate
    );
  }

  static async getPriceTrends(days: number = 30): Promise<PriceTrend[]> {
    const prices = await this.getMarketPrices(days);
    
    // Group by date and calculate averages
    const dailyStats = new Map<string, {
      prices: number[];
      volumes: number[];
    }>();
    
    prices.forEach(price => {
      const date = price.date;
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { prices: [], volumes: [] });
      }
      const stats = dailyStats.get(date)!;
      stats.prices.push(price.price_per_kg);
      stats.volumes.push(Math.random() * 1000 + 200); // Mock volume
    });
    
    return Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        average_price: stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length,
        min_price: Math.min(...stats.prices),
        max_price: Math.max(...stats.prices),
        volume_kg: stats.volumes.reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  static async getBuyerComparison(): Promise<BuyerComparison[]> {
    const recentPrices = await this.getMarketPrices(30);
    
    return LOEI_BUYERS.map(buyer => {
      const buyerPrices = recentPrices.filter(p => p.buyer === buyer.name);
      const avgPrice = buyerPrices.length > 0 
        ? buyerPrices.reduce((sum, p) => sum + p.price_per_kg, 0) / buyerPrices.length
        : buyer.basePrice;
      
      return {
        buyer: buyer.name,
        avg_price: Math.round(avgPrice * 100) / 100,
        total_volume: Math.round(Math.random() * 5000 + 1000),
        reliability_score: buyer.reliability,
        payment_terms: buyer.terms,
        last_updated: new Date().toISOString().split('T')[0],
      };
    }).sort((a, b) => b.avg_price - a.avg_price);
  }

  static async getBestPriceForGrade(grade: 'A' | 'B' | 'C'): Promise<{
    buyer: string;
    price: number;
    premium: number;
  }> {
    const comparison = await this.getBuyerComparison();
    const best = comparison[0]; // Already sorted by price
    
    const gradePrice = this.historicalPrices
      .filter(p => p.grade === grade)
      .sort((a, b) => b.price_per_kg - a.price_per_kg)[0];
    
    return {
      buyer: best.buyer,
      price: Math.round(best.avg_price * 100) / 100,
      premium: gradePrice ? Math.round((gradePrice.price_per_kg - 110) * 100) / 100 : 0,
    };
  }

  static async createPriceAlert(alert: Omit<PriceAlert, 'id' | 'created_at'>): Promise<PriceAlert> {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    
    // In a real app, this would save to Firestore
    console.log('Creating price alert:', newAlert);
    
    return newAlert;
  }

  static async getPriceAlerts(): Promise<PriceAlert[]> {
    // Mock alerts - in real app would fetch from Firestore
    return [
      {
        id: 'alert-1',
        type: 'above',
        threshold: 130,
        active: true,
        created_at: '2024-03-01T10:00:00Z',
      },
      {
        id: 'alert-2',
        type: 'below',
        threshold: 105,
        buyer: 'ตลาดกลางเลย',
        active: true,
        created_at: '2024-03-05T14:30:00Z',
      },
    ];
  }

  static calculateProfitPotential(
    harvestWeight: number,
    grade: 'A' | 'B' | 'C',
    targetPrice?: number
  ): {
    best_buyer: string;
    max_revenue: number;
    price_difference: number;
    recommendation: string;
  } {
    const baseRevenue = harvestWeight * 110; // Base market price
    const premiumRevenue = harvestWeight * (110 + GRADE_PREMIUMS[grade]);
    
    return {
      best_buyer: 'ร้านกาแฟพิเศษ', // Highest base price
      max_revenue: Math.round(premiumRevenue),
      price_difference: Math.round(premiumRevenue - baseRevenue),
      recommendation: grade === 'A' 
        ? 'ขายให้ร้านกาแฟพิเศษเพื่อรับราคาสูงสุด'
        : grade === 'B'
        ? 'พิจารณาขายให้สหกรณ์เพื่อความน่าเชื่อถือ'
        : 'ขายที่ตลาดกลางเพื่อความรวดเร็ว',
    };
  }
}
