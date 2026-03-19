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

const farmsRef = collection(db, 'farms');
const harvestsRef = collection(db, 'harvests');

export interface Farm {
  id: string;
  name: string;
  area: number;
  soil_type: string | null;
  water_source: string | null;
  province: string;
  district: string | null;
  altitude: number | null;
  variety: string | null;
  tree_count: number | null;
  planting_year: number | null;
  notes: string | null;
  created_at: Timestamp;
  user_id: string;
}

export interface Harvest {
  id: string;
  farm_id: string;
  harvest_date: string;
  variety: string | null;
  weight_kg: number;
  income: number;
  shift: string;
  notes: string | null;
  created_at: Timestamp;
  user_id: string;
  farms?: { name: string };
}

export const FarmService = {
  /**
   * Get all farms for a specific user.
   */
  async getAll(userId: string): Promise<Farm[]> {
    const q = query(farmsRef, where('user_id', '==', userId), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Farm));
  },

  /**
   * Get a single farm by ID.
   */
  async getById(id: string): Promise<Farm | null> {
    const docSnap = await getDoc(doc(db, 'farms', id));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Farm;
  },

  /**
   * Create a new farm.
   */
  async create(userId: string, data: Omit<Farm, 'id' | 'created_at' | 'user_id'>): Promise<Farm> {
    const docRef = await addDoc(farmsRef, {
      ...data,
      user_id: userId,
      created_at: serverTimestamp(),
    });
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as Farm;
  },

  /**
   * Update an existing farm.
   */
  async update(id: string, data: Partial<Farm>): Promise<void> {
    await updateDoc(doc(db, 'farms', id), data);
  },

  /**
   * Delete a farm by ID.
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'farms', id));
  },

  /**
   * Count farms for a specific user.
   */
  async count(userId: string): Promise<number> {
    const q = query(farmsRef, where('user_id', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  },
};

export const HarvestService = {
  /**
   * Get all harvests for a specific user with farm names.
   */
  async getAll(userId: string): Promise<Harvest[]> {
    const q = query(harvestsRef, where('user_id', '==', userId), orderBy('harvest_date', 'desc'));
    const snapshot = await getDocs(q);

    const harvestDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Harvest));

    const farmIds = [...new Set(harvestDocs.map(h => h.farm_id).filter(Boolean))];
    const farms: Record<string, string> = {};

    for (const farmId of farmIds) {
      const farmSnap = await getDoc(doc(db, 'farms', farmId));
      const farmData = farmSnap.data();
      if (farmSnap.exists() && farmData) {
        farms[farmId] = farmData.name;
      }
    }

    return harvestDocs.map(h => ({
      ...h,
      farms: h.farm_id ? { name: farms[h.farm_id] || '' } : undefined,
    }));
  },

  /**
   * Get a single harvest by ID with farm name.
   */
  async getById(id: string): Promise<Harvest | null> {
    const docSnap = await getDoc(doc(db, 'harvests', id));
    if (!docSnap.exists()) return null;

    const data = docSnap.data() as Harvest;
    let farmName = '';
    if (data.farm_id) {
      const farmSnap = await getDoc(doc(db, 'farms', data.farm_id));
      const farmData = farmSnap.data();
      if (farmSnap.exists() && farmData) {
        farmName = farmData.name;
      }
    }

    return {
      ...data,
      id: docSnap.id,
      farms: { name: farmName },
    } as Harvest;
  },

  /**
   * Create a new harvest record.
   */
  async create(userId: string, data: Omit<Harvest, 'id' | 'created_at' | 'user_id'>): Promise<Harvest> {
    const docRef = await addDoc(harvestsRef, {
      ...data,
      user_id: userId,
      created_at: serverTimestamp(),
    });
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as Harvest;
  },

  /**
   * Update an existing harvest.
   */
  async update(id: string, data: Partial<Harvest>): Promise<void> {
    await updateDoc(doc(db, 'harvests', id), data);
  },

  /**
   * Delete a harvest by ID.
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'harvests', id));
  },

  /**
   * Get summary statistics for a user's harvests.
   */
  async getSummary(userId: string): Promise<{ totalWeight: number; totalIncome: number }> {
    const q = query(harvestsRef, where('user_id', '==', userId));
    const snapshot = await getDocs(q);

    let totalWeight = 0;
    let totalIncome = 0;

    snapshot.docs.forEach(d => {
      const data = d.data();
      totalWeight += data.weight_kg || 0;
      totalIncome += data.income || 0;
    });

    return { totalWeight, totalIncome };
  },
};
