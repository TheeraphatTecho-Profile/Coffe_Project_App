import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Cost {
  id?: string;
  userId: string;
  farmId: string;
  category: 'fertilizer' | 'labor' | 'water' | 'equipment' | 'maintenance' | 'other';
  description: string;
  amount: number;
  unit: 'kg' | 'liter' | 'hour' | 'day' | 'item' | 'month';
  unitPrice: number;
  totalCost: number;
  date: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CostInput extends Omit<Cost, 'id' | 'createdAt' | 'updatedAt' | 'totalCost'> {
  totalCost?: number;
}

export interface CostCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  unit: string;
  typicalPriceRange: {
    min: number;
    max: number;
  };
}

export const COST_CATEGORIES: CostCategory[] = [
  {
    id: 'fertilizer',
    name: 'ปุ๋ย',
    icon: 'leaf',
    color: '#4CAF50',
    unit: 'kg',
    typicalPriceRange: { min: 15, max: 45 }
  },
  {
    id: 'labor',
    name: 'แรงงาน',
    icon: 'people',
    color: '#2196F3',
    unit: 'day',
    typicalPriceRange: { min: 300, max: 600 }
  },
  {
    id: 'water',
    name: 'น้ำ',
    icon: 'water',
    color: '#00BCD4',
    unit: 'liter',
    typicalPriceRange: { min: 0.5, max: 2 }
  },
  {
    id: 'equipment',
    name: 'อุปกรณ์',
    icon: 'build',
    color: '#FF9800',
    unit: 'item',
    typicalPriceRange: { min: 50, max: 5000 }
  },
  {
    id: 'maintenance',
    name: 'บำรุงรักษา',
    icon: 'settings',
    color: '#9C27B0',
    unit: 'month',
    typicalPriceRange: { min: 500, max: 2000 }
  },
  {
    id: 'other',
    name: 'อื่นๆ',
    icon: 'ellipsis-horizontal',
    color: '#607D8B',
    unit: 'item',
    typicalPriceRange: { min: 10, max: 1000 }
  }
];

export class CostService {
  private static collection = 'costs';

  static async createCost(cost: CostInput): Promise<string> {
    try {
      const costData = {
        ...cost,
        totalCost: cost.totalCost || cost.amount * cost.unitPrice,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.collection), costData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating cost:', error);
      throw error;
    }
  }

  static async updateCost(id: string, updates: Partial<Cost>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Recalculate total cost if amount or unitPrice changed
      if (updates.amount !== undefined || updates.unitPrice !== undefined) {
        const currentDoc = await getDoc(doc(db, this.collection, id));
        const currentData = currentDoc.data() as Cost;
        
        const newAmount = updates.amount !== undefined ? updates.amount : currentData.amount;
        const newUnitPrice = updates.unitPrice !== undefined ? updates.unitPrice : currentData.unitPrice;
        
        updateData.totalCost = newAmount * newUnitPrice;
      }

      await updateDoc(doc(db, this.collection, id), updateData);
    } catch (error) {
      console.error('Error updating cost:', error);
      throw error;
    }
  }

  static async deleteCost(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collection, id));
    } catch (error) {
      console.error('Error deleting cost:', error);
      throw error;
    }
  }

  static async deleteCostsByFarm(farmId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.collection),
        where('farmId', '==', farmId)
      );
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(docSnap => 
        deleteDoc(doc(db, this.collection, docSnap.id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting costs by farm:', error);
      throw error;
    }
  }

  static async getCost(userId: string, costId: string): Promise<Cost | null> {
    try {
      const docRef = doc(db, this.collection, costId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().userId === userId) {
        return { id: docSnap.id, ...docSnap.data() } as Cost;
      }
      return null;
    } catch (error) {
      console.error('Error getting cost:', error);
      throw error;
    }
  }

  static async getAllCosts(userId: string): Promise<Cost[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cost[];
    } catch (error) {
      console.error('Error getting all costs:', error);
      throw error;
    }
  }

  static async getCostsByFarm(userId: string, farmId: string): Promise<Cost[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('farmId', '==', farmId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cost[];
    } catch (error) {
      console.error('Error getting costs by farm:', error);
      throw error;
    }
  }

  static async getCostsByCategory(userId: string, category: Cost['category']): Promise<Cost[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cost[];
    } catch (error) {
      console.error('Error getting costs by category:', error);
      throw error;
    }
  }

  static async getCostSummary(userId: string, farmId?: string): Promise<{
    totalCost: number;
    byCategory: Record<Cost['category'], number>;
    byMonth: Record<string, number>;
  }> {
    try {
      const costs = farmId 
        ? await this.getCostsByFarm(userId, farmId)
        : await this.getAllCosts(userId);

      const summary = {
        totalCost: 0,
        byCategory: {} as Record<Cost['category'], number>,
        byMonth: {} as Record<string, number>,
      };

      costs.forEach(cost => {
        summary.totalCost += cost.totalCost;
        
        // Sum by category
        if (!summary.byCategory[cost.category]) {
          summary.byCategory[cost.category] = 0;
        }
        summary.byCategory[cost.category] += cost.totalCost;

        // Sum by month (format: YYYY-MM)
        const month = cost.date.substring(0, 7);
        if (!summary.byMonth[month]) {
          summary.byMonth[month] = 0;
        }
        summary.byMonth[month] += cost.totalCost;
      });

      return summary;
    } catch (error) {
      console.error('Error getting cost summary:', error);
      throw error;
    }
  }

  static async getMonthlyCostTrend(userId: string, months: number = 12): Promise<{
    month: string;
    cost: number;
  }[]> {
    try {
      const costs = await this.getAllCosts(userId);
      const monthlyData: Record<string, number> = {};

      // Initialize last N months
      const now = new Date();
      for (let i = 0; i < months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().substring(0, 7);
        monthlyData[monthKey] = 0;
      }

      // Sum costs by month
      costs.forEach(cost => {
        const monthKey = cost.date.substring(0, 7);
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += cost.totalCost;
        }
      });

      // Convert to array and sort
      return Object.entries(monthlyData)
        .map(([month, cost]) => ({ month, cost }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      console.error('Error getting monthly cost trend:', error);
      throw error;
    }
  }
}
