import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const usersRef = collection(db, 'user_profiles');

/**
 * User profile data for coffee farmers in Loei province.
 * Stored in Firestore collection `user_profiles`, keyed by Firebase Auth UID.
 */
export interface UserProfile {
  /** Firebase Auth UID — also used as document ID */
  uid: string;
  /** Full name (ชื่อ-นามสกุล) */
  fullName: string;
  /** Gender (เพศ): male | female | other */
  gender: 'male' | 'female' | 'other' | null;
  /** Date of birth (วัน/เดือน/ปีเกิด) as ISO string YYYY-MM-DD */
  dateOfBirth: string | null;
  /** Thai citizen ID 13 digits (เลขบัตรประชาชน) — must be unique */
  citizenId: string | null;
  /** House number (เลขบ้าน) */
  houseNumber: string | null;
  /** Farmer household ID (เลขที่เกษตรกรต่อครัวเรือน) */
  farmerHouseholdId: string | null;
  /** Phone number */
  phone: string | null;
  /** Email (from Firebase Auth, stored for convenience) */
  email: string | null;
  /** Province */
  province: string | null;
  /** District */
  district: string | null;
  /** Sub-district */
  subDistrict: string | null;
  /** Profile photo URL */
  photoUrl: string | null;
  /** PDPA consent accepted at */
  consentAcceptedAt: Timestamp | null;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Last updated timestamp */
  updatedAt: Timestamp;
}

/**
 * Validate Thai citizen ID (13 digits with checksum).
 */
export function validateCitizenId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(id[12]);
}

export const UserProfileService = {
  /**
   * Get user profile by UID.
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(db, 'user_profiles', uid));
    if (!docSnap.exists()) return null;
    return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
  },

  /**
   * Create or update user profile.
   * Uses set with merge so it works for both create and update.
   */
  async saveProfile(
    uid: string,
    data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const ref = doc(db, 'user_profiles', uid);
    const existing = await getDoc(ref);

    if (existing.exists()) {
      await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        ...data,
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  },

  /**
   * Check if a citizen ID is already used by another user.
   * Returns true if the citizen ID is available (not taken by someone else).
   */
  async isCitizenIdAvailable(citizenId: string, currentUid: string): Promise<boolean> {
    if (!citizenId) return true;
    const q = query(usersRef, where('citizenId', '==', citizenId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return true;
    // If the only match is the current user, it's still available
    return snapshot.docs.every(d => d.id === currentUid);
  },

  /**
   * Record PDPA consent acceptance.
   */
  async acceptConsent(uid: string): Promise<void> {
    await this.saveProfile(uid, {
      consentAcceptedAt: serverTimestamp() as unknown as Timestamp,
    });
  },
};
