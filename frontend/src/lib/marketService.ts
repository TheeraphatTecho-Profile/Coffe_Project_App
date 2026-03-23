import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Buyer {
  id?: string;
  userId: string;
  name: string;
  company: string;
  type: 'local' | 'regional' | 'national' | 'international' | 'cooperative' | 'processor' | 'roaster' | 'exporter';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  district: string;
  postalCode: string;
  website?: string;
  lineId?: string;
  facebook?: string;
  specialties: string[]; // Types of coffee they buy
  qualityRequirements: QualityRequirement[];
  paymentTerms: PaymentTerm[];
  certifications: Certification[];
  preferredRegions: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  volumeCapacity: {
    min: number; // kg per month
    max: number; // kg per month
  };
  reliability: 'excellent' | 'good' | 'average' | 'poor';
  notes?: string;
  isActive: boolean;
  lastContact?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface QualityRequirement {
  grade: 'A' | 'B' | 'C' | 'D';
  moistureContent: { min: number; max: number }; // %
  defects: { max: number }; // %
  beanSize: number; // screen size
  processing: 'washed' | 'natural' | 'honey' | 'semi-washed';
  certification?: string;
  description: string;
}

export interface PaymentTerm {
  type: 'cash' | 'bank_transfer' | 'check' | 'credit' | 'consignment';
  period: number; // days
  discount: number; // % for early payment
  description: string;
}

export interface Certification {
  name: string;
  required: boolean;
  validUntil?: string;
  description: string;
}

export interface MarketPrice {
  id?: string;
  userId: string;
  region: string;
  province: string;
  marketType: 'local' | 'regional' | 'national' | 'export';
  grade: 'A' | 'B' | 'C' | 'D';
  price: number;
  currency: string;
  unit: 'kg' | 'ton' | 'pound';
  date: string; // YYYY-MM-DD
  source: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MarketInsight {
  id?: string;
  userId: string;
  title: string;
  type: 'price_forecast' | 'market_trend' | 'buyer_demand' | 'export_opportunity' | 'quality_premium' | 'seasonal_analysis';
  content: string;
  targetRegion?: string;
  targetGrade?: string;
  timeframe: string; // e.g., "Q1 2024", "Next 3 months"
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
  sources: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MarketTransaction {
  id?: string;
  userId: string;
  farmId: string;
  buyerId: string;
  date: string;
  grade: 'A' | 'B' | 'C' | 'D';
  quantity: number; // kg
  unitPrice: number;
  totalPrice: number;
  currency: string;
  qualityScore: number; // 0-100
  certifications: string[];
  paymentTerms: PaymentTerm;
  deliveryMethod: 'pickup' | 'delivery' | 'shipping';
  deliveryLocation?: string;
  buyerFeedback?: string;
  farmerFeedback?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const COFFEE_GRADES = {
  A: {
    name: 'เกรด A',
    description: 'คุณภาพสูงสุด ไม่มีตำหริน',
    moistureRange: { min: 10, max: 12 },
    maxDefects: 2,
    beanSize: 18,
    premium: 1.5, // 50% premium
  },
  B: {
    name: 'เกรด B',
    description: 'คุณภาพดี ตำหรินน้อย',
    moistureRange: { min: 11, max: 13 },
    maxDefects: 5,
    beanSize: 16,
    premium: 1.2, // 20% premium
  },
  C: {
    name: 'เกรด C',
    description: 'คุณภาพปานกลาง',
    moistureRange: { min: 12, max: 14 },
    maxDefects: 10,
    beanSize: 14,
    premium: 1.0, // Base price
  },
  D: {
    name: 'เกรด D',
    description: 'คุณภาพทั่วไป',
    moistureRange: { min: 13, max: 15 },
    maxDefects: 15,
    beanSize: 12,
    premium: 0.8, // 20% discount
  },
};

export const LOEI_MARKET_REGIONS = [
  { name: 'เลย', type: 'local', description: 'ตลาดในจังหวัดเลย' },
  { name: 'ขอนแก่น', type: 'regional', description: 'ตลาดภาคอีสาน' },
  { name: 'กรุงเทพมหานคร', type: 'national', description: 'ตลาดกรุงเทพ' },
  { name: 'ชลบุรี', type: 'export', description: 'ตลาดส่งออก' },
  { name: 'ภูเก็ต', type: 'export', description: 'ตลาดส่งออกภาคใต้' },
];

export const CERTIFICATIONS = [
  { name: 'Organic', description: 'การเกษตรอินทรีย์', premium: 0.3 },
  { name: 'Fair Trade', description: 'การค้าขายที่เป็นธรรม', premium: 0.2 },
  { name: 'Rainforest Alliance', description: 'พันธมิตรป่าดิบชน', premium: 0.15 },
  { name: 'Bird Friendly', description: 'เป็นมิตรต่อนก', premium: 0.1 },
  { name: 'UTZ', description: 'มาตรฐาน UTZ', premium: 0.1 },
];

export class MarketService {
  private static collection = 'buyers';
  private static priceCollection = 'market_prices';
  private static insightCollection = 'market_insights';
  private static transactionCollection = 'market_transactions';

  // Buyer Management
  static async createBuyer(buyer: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const buyerData = {
        ...buyer,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.collection), buyerData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating buyer:', error);
      throw error;
    }
  }

  static async updateBuyer(id: string, updates: Partial<Buyer>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, this.collection, id), updateData);
    } catch (error) {
      console.error('Error updating buyer:', error);
      throw error;
    }
  }

  static async deleteBuyer(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collection, id));
    } catch (error) {
      console.error('Error deleting buyer:', error);
      throw error;
    }
  }

  static async getAllBuyers(userId: string): Promise<Buyer[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('company', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Buyer[];
    } catch (error) {
      console.error('Error getting all buyers:', error);
      throw error;
    }
  }

  static async getBuyersByType(userId: string, type: Buyer['type']): Promise<Buyer[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('type', '==', type),
        where('isActive', '==', true),
        orderBy('company', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Buyer[];
    } catch (error) {
      console.error('Error getting buyers by type:', error);
      throw error;
    }
  }

  static async getBuyersBySpecialty(userId: string, specialty: string): Promise<Buyer[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('specialties', 'array-contains', specialty),
        where('isActive', '==', true),
        orderBy('company', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Buyer[];
    } catch (error) {
      console.error('Error getting buyers by specialty:', error);
      throw error;
    }
  }

  // Market Price Management
  static async createMarketPrice(price: Omit<MarketPrice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const priceData = {
        ...price,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.priceCollection), priceData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating market price:', error);
      throw error;
    }
  }

  static async getMarketPrices(userId: string, filters?: {
    region?: string;
    grade?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<MarketPrice[]> {
    try {
      let q = query(
        collection(db, this.priceCollection),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      if (filters?.region) {
        q = query(q, where('region', '==', filters.region));
      }
      if (filters?.grade) {
        q = query(q, where('grade', '==', filters.grade));
      }
      if (filters?.dateFrom) {
        q = query(q, where('date', '>=', filters.dateFrom));
      }
      if (filters?.dateTo) {
        q = query(q, where('date', '<=', filters.dateTo));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketPrice[];
    } catch (error) {
      console.error('Error getting market prices:', error);
      throw error;
    }
  }

  static async getPriceTrends(userId: string, region: string, grade: string, days: number = 30): Promise<{
    currentPrice: number;
    previousPrice: number;
    trend: 'up' | 'down' | 'stable';
    percentageChange: number;
    forecast: string;
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const prices = await this.getMarketPrices(userId, {
        region,
        grade,
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0],
      });

      if (prices.length < 2) {
        return {
          currentPrice: 0,
          previousPrice: 0,
          trend: 'stable',
          percentageChange: 0,
          forecast: 'ข้อมูลไม่เพียงพอสำหรับพยากรณ์',
        };
      }

      const currentPrice = prices[0].price;
      const previousPrice = prices[prices.length - 1].price;
      const percentageChange = ((currentPrice - previousPrice) / previousPrice) * 100;
      
      let trend: 'up' | 'down' | 'stable';
      if (percentageChange > 2) trend = 'up';
      else if (percentageChange < -2) trend = 'down';
      else trend = 'stable';

      const forecast = this.generatePriceForecast(prices, trend);

      return {
        currentPrice,
        previousPrice,
        trend,
        percentageChange,
        forecast,
      };
    } catch (error) {
      console.error('Error getting price trends:', error);
      throw error;
    }
  }

  private static generatePriceForecast(prices: MarketPrice[], currentTrend: 'up' | 'down' | 'stable'): string {
    const recentPrices = prices.slice(0, 7).map(p => p.price);
    const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const volatility = Math.max(...recentPrices) - Math.min(...recentPrices);

    if (volatility < avgRecent * 0.05) {
      return 'ราคาน่าจะคงที่ในช่วงนี้';
    }

    switch (currentTrend) {
      case 'up':
        return volatility > avgRecent * 0.1 
          ? 'ราคามีแนวโน้มขึ้นแต่มีความผันผวนสูง ควรระมัดระวัง'
          : 'ราคามีแนวโน้มขึ้นอย่างต่อเนื่อง';
      case 'down':
        return volatility > avgRecent * 0.1
          ? 'ราคาลดลงและมีความผันผวน อาจเป็นโอกาสดีสำหรับซื้อ'
          : 'ราคาลดลงอย่างต่อเนื่อง อาจต้องรอจังหวะดีขึ้น';
      default:
        return 'ราคาคงที่ เป็นช่วงเวลาที่ดีสำหรับวางแผนการขาย';
    }
  }

  // Market Insights
  static async createMarketInsight(insight: Omit<MarketInsight, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const insightData = {
        ...insight,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.insightCollection), insightData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating market insight:', error);
      throw error;
    }
  }

  static async getMarketInsights(userId: string, filters?: {
    type?: string;
    impact?: string;
    timeframe?: string;
  }): Promise<MarketInsight[]> {
    try {
      let q = query(
        collection(db, this.insightCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters?.impact) {
        q = query(q, where('impact', '==', filters.impact));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketInsight[];
    } catch (error) {
      console.error('Error getting market insights:', error);
      throw error;
    }
  }

  // Market Transactions
  static async createTransaction(transaction: Omit<MarketTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const transactionData = {
        ...transaction,
        totalPrice: transaction.quantity * transaction.unitPrice,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.transactionCollection), transactionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async getTransactions(userId: string, filters?: {
    farmId?: string;
    buyerId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Promise<MarketTransaction[]> {
    try {
      let q = query(
        collection(db, this.transactionCollection),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      if (filters?.farmId) {
        q = query(q, where('farmId', '==', filters.farmId));
      }
      if (filters?.buyerId) {
        q = query(q, where('buyerId', '==', filters.buyerId));
      }
      if (filters?.dateFrom) {
        q = query(q, where('date', '>=', filters.dateFrom));
      }
      if (filters?.dateTo) {
        q = query(q, where('date', '<=', filters.dateTo));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketTransaction[];
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  static async getMarketSummary(userId: string): Promise<{
    totalBuyers: number;
    activeBuyers: number;
    averagePrice: number;
    priceTrend: 'up' | 'down' | 'stable';
    totalTransactions: number;
    totalVolume: number;
    totalRevenue: number;
    topBuyers: Array<{ buyer: Buyer; volume: number; revenue: number }>;
    gradeDistribution: Record<string, number>;
  }> {
    try {
      const [buyers, transactions] = await Promise.all([
        this.getAllBuyers(userId),
        this.getTransactions(userId),
      ]);

      const activeBuyers = buyers.filter(b => b.isActive).length;
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.totalPrice, 0);
      const totalVolume = completedTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const averagePrice = totalVolume > 0 ? totalRevenue / totalVolume : 0;

      // Calculate price trend
      const recentTransactions = completedTransactions.slice(0, 10);
      let priceTrend: 'up' | 'down' | 'stable' = 'stable';
      if (recentTransactions.length >= 2) {
        const recent = recentTransactions.slice(0, 5);
        const older = recentTransactions.slice(5, 10);
        const recentAvg = recent.reduce((sum, t) => sum + t.unitPrice, 0) / recent.length;
        const olderAvg = older.reduce((sum, t) => sum + t.unitPrice, 0) / older.length;
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        if (change > 2) priceTrend = 'up';
        else if (change < -2) priceTrend = 'down';
      }

      // Top buyers by revenue
      const buyerStats = new Map<string, { volume: number; revenue: number }>();
      completedTransactions.forEach(t => {
        const existing = buyerStats.get(t.buyerId) || { volume: 0, revenue: 0 };
        buyerStats.set(t.buyerId, {
          volume: existing.volume + t.quantity,
          revenue: existing.revenue + t.totalPrice,
        });
      });

      const topBuyers = Array.from(buyerStats.entries())
        .map(([buyerId, stats]) => ({
          buyer: buyers.find(b => b.id === buyerId)!,
          ...stats,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Grade distribution
      const gradeDistribution: Record<string, number> = {};
      completedTransactions.forEach(t => {
        gradeDistribution[t.grade] = (gradeDistribution[t.grade] || 0) + 1;
      });

      return {
        totalBuyers: buyers.length,
        activeBuyers,
        averagePrice,
        priceTrend,
        totalTransactions: completedTransactions.length,
        totalVolume,
        totalRevenue,
        topBuyers,
        gradeDistribution,
      };
    } catch (error) {
      console.error('Error getting market summary:', error);
      throw error;
    }
  }

  static getRecommendedBuyers(userId: string, grade: string, quantity: number, region: string): Promise<Buyer[]> {
    return this.getAllBuyers(userId).then(buyers => {
      return buyers.filter(buyer => {
        // Filter by grade compatibility
        const gradeCompatible = buyer.qualityRequirements.some(req => req.grade === grade);
        
        // Filter by quantity capacity
        const quantityCompatible = buyer.volumeCapacity.min <= quantity && quantity <= buyer.volumeCapacity.max;
        
        // Filter by region preference
        const regionCompatible = buyer.preferredRegions.length === 0 || 
          buyer.preferredRegions.includes(region) || 
          buyer.preferredRegions.includes('ทั่วประเทศ');
        
        // Filter by reliability
        const reliable = buyer.reliability === 'excellent' || buyer.reliability === 'good';
        
        return gradeCompatible && quantityCompatible && regionCompatible && reliable;
      }).sort((a, b) => {
        // Sort by price range (higher max price first)
        return b.priceRange.max - a.priceRange.max;
      });
    });
  }

  static calculateOptimalSellingPrice(grade: string, quality: number, certifications: string[], currentMarketPrice: number): {
    basePrice: number;
    qualityAdjustment: number;
    certificationPremium: number;
    recommendedPrice: number;
    reasoning: string[];
  } {
    const gradeInfo = COFFEE_GRADES[grade as keyof typeof COFFEE_GRADES];
    let basePrice = currentMarketPrice * gradeInfo.premium;
    
    // Quality adjustment
    const qualityAdjustment = ((quality - 50) / 50) * 0.2; // ±20% based on quality score
    basePrice *= (1 + qualityAdjustment);
    
    // Certification premiums
    let certificationPremium = 0;
    const reasoning: string[] = [];
    
    if (grade === 'A') {
      reasoning.push('เกรด A พรีเมียม 50% จากคุณภาพสูงสุด');
    } else if (grade === 'B') {
      reasoning.push('เกรด B พรีเมียม 20% จากคุณภาพดี');
    }
    
    certifications.forEach(cert => {
      const certInfo = CERTIFICATIONS.find(c => c.name === cert);
      if (certInfo) {
        certificationPremium += certInfo.premium;
        reasoning.push(`${cert} พรีเมียม ${(certInfo.premium * 100).toFixed(0)}%`);
      }
    });
    
    const recommendedPrice = basePrice * (1 + certificationPremium);
    
    if (quality > 75) {
      reasoning.push('คุณภาพสูงกว่าเกณฑ์ ปรับราคาขึ้น');
    } else if (quality < 50) {
      reasoning.push('คุณภาพต่ำกว่าเกณฑ์ อาจต้องลดราคา');
    }
    
    return {
      basePrice: currentMarketPrice,
      qualityAdjustment: qualityAdjustment * 100,
      certificationPremium: certificationPremium * 100,
      recommendedPrice,
      reasoning,
    };
  }
}
