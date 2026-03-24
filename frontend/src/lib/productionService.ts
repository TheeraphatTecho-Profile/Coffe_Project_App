import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Collections ────────────────────────────────────────────────
const freshSalesRef = collection(db, 'fresh_sales');
const processedProductsRef = collection(db, 'processed_products');

// ─── Interfaces ─────────────────────────────────────────────────

/**
 * Fresh coffee cherry sale record (ปริมาณขายผลสด).
 */
export interface FreshSale {
  id: string;
  /** Which farm this sale is from */
  farmId: string;
  /** Harvest year (พ.ศ.) */
  harvestYear: number;
  /** Coffee variety */
  variety: string | null;
  /** Weight sold in kg (ปริมาณขายผลสด กก.) */
  weightKg: number;
  /** Price per kg (ราคาต่อกก.) */
  pricePerKg: number;
  /** Total income (รายได้) */
  totalIncome: number;
  /** Buyer name / channel */
  buyerName: string | null;
  /** Sale date */
  saleDate: string;
  /** Notes */
  notes: string | null;
  userId: string;
  createdAt: Timestamp;
}

/**
 * Processed coffee product record (ผลิตภัณฑ์แปรรูป).
 */
export interface ProcessedProduct {
  id: string;
  /** Which farm the beans come from */
  farmId: string;
  /** Harvest year (พ.ศ.) */
  harvestYear: number;
  /** Product name (ชื่อผลิตภัณฑ์) */
  productName: string;
  /** Product type e.g. กาแฟคั่ว, กาแฟดริป, etc. (ชนิดผลิตภัณฑ์) */
  productType: string;
  /** Quantity produced (ปริมาณ) */
  quantity: number;
  /** Unit (e.g. กก., ถุง, กล่อง) */
  unit: string;
  /** Weight of raw beans used in kg (ปริมาณแปรรูป กก.) */
  rawWeightKg: number;
  /** Source of coffee beans (แหล่งที่มาของเมล็ดกาแฟ) */
  beanSource: string | null;
  /** GI certified? (สิ่งบ่งชี้ทางภูมิศาสตร์) */
  isGI: boolean;
  /** Sales channel / location (สถานที่จำหน่าย) */
  salesChannel: string | null;
  /** Price per unit (ราคาต่อหน่วย) */
  pricePerUnit: number;
  /** Total income from this product */
  totalIncome: number;
  /** Notes */
  notes: string | null;
  userId: string;
  createdAt: Timestamp;
}

/**
 * Annual production summary (สรุปผลผลิตรายปี).
 */
export interface AnnualProductionSummary {
  harvestYear: number;
  /** Total harvest weight (ปริมาณเก็บเกี่ยวรวม กก.) */
  totalHarvestKg: number;
  /** By variety breakdown */
  byVariety: { variety: string; weightKg: number }[];
  /** Fresh sale total (ปริมาณขายผลสด กก.) */
  freshSaleKg: number;
  /** Fresh sale income */
  freshSaleIncome: number;
  /** Processed total (ปริมาณแปรรูป กก.) */
  processedKg: number;
  /** Processed income */
  processedIncome: number;
  /** Total farmer income (รายได้รวม) */
  totalIncome: number;
}

// ─── Fresh Sale Service ─────────────────────────────────────────

export const FreshSaleService = {
  async getAll(userId: string): Promise<FreshSale[]> {
    const q = query(freshSalesRef, where('userId', '==', userId), orderBy('saleDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FreshSale));
  },

  async getByYear(userId: string, year: number): Promise<FreshSale[]> {
    const q = query(
      freshSalesRef,
      where('userId', '==', userId),
      where('harvestYear', '==', year),
      orderBy('saleDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FreshSale));
  },

  async getById(id: string): Promise<FreshSale | null> {
    const docSnap = await getDoc(doc(db, 'fresh_sales', id));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as FreshSale;
  },

  async create(userId: string, data: Omit<FreshSale, 'id' | 'createdAt' | 'userId'>): Promise<FreshSale> {
    const docRef = await addDoc(freshSalesRef, {
      ...data,
      userId,
      createdAt: serverTimestamp(),
    });
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as FreshSale;
  },

  async update(id: string, data: Partial<FreshSale>): Promise<void> {
    await updateDoc(doc(db, 'fresh_sales', id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'fresh_sales', id));
  },
};

// ─── Processed Product Service ──────────────────────────────────

export const ProcessedProductService = {
  async getAll(userId: string): Promise<ProcessedProduct[]> {
    const q = query(processedProductsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ProcessedProduct));
  },

  async getByYear(userId: string, year: number): Promise<ProcessedProduct[]> {
    const q = query(
      processedProductsRef,
      where('userId', '==', userId),
      where('harvestYear', '==', year),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ProcessedProduct));
  },

  async getById(id: string): Promise<ProcessedProduct | null> {
    const docSnap = await getDoc(doc(db, 'processed_products', id));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as ProcessedProduct;
  },

  async create(userId: string, data: Omit<ProcessedProduct, 'id' | 'createdAt' | 'userId'>): Promise<ProcessedProduct> {
    const docRef = await addDoc(processedProductsRef, {
      ...data,
      userId,
      createdAt: serverTimestamp(),
    });
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as ProcessedProduct;
  },

  async update(id: string, data: Partial<ProcessedProduct>): Promise<void> {
    await updateDoc(doc(db, 'processed_products', id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'processed_products', id));
  },
};
