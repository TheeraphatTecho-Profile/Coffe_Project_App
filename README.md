# ☕ สวนกาแฟเลย — Coffee Farm Management App

> **React Native + Expo + Firebase** — แอปจัดการไร่กาแฟสำหรับ Android และ Web

---

## 📱 Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Welcome        │  │   Login          │  │   Home           │
│   ☕              │  │   Email/Pass     │  │   Dashboard      │
│   สวนกาแฟเลย    │  │   Google         │  │   Stats Cards    │
│                  │  │   Facebook       │  │   Quick Actions  │
│   เข้าสู่ระบบ   │  │   LINE           │  │   Activities     │
│   สร้างบัญชี    │  │                  │  │                  │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   My Farms       │  │   Harvest        │  │   Analytics      │
│   Farm List      │  │   Records List   │  │   Charts         │
│   + Add Farm     │  │   Search/Filter  │  │   Revenue Stats  │
│   4-Step Form    │  │   Summary Cards  │  │   AI Insights    │
│                  │  │                  │  │                  │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐
│   Profile        │
│   Avatar         │
│   Settings       │
│   Theme Toggle   │
│   Sign Out       │
└─────────────────┘
```

---

## ✨ ฟีเจอร์

| ฟีเจอร์ | คำอธิบาย |
|---------|-------------|
| **การยืนยันตัวตน** | อีเมล/รหัสผ่าน, Google, Facebook, LINE |
| **จัดการไร่กาแฟ** | การ CRUD พร้อมฟอร์มเพิ่ม 4 ขั้นตอน |
| **ติดตามการเก็บเกี่ยว** | บันทึกผลผลิตพร้อมน้ำหนัก, รายได้, กะ |
| **การวิเคราะห์** | กราฟ, สถิติรายได้, ข้อมูลเชิงลึก AI |
| **รองรับออฟไลน์** | AsyncStorage cache พร้อมตรวจสอบความเก่า |
| **ส่งออก CSV** | ส่งออกข้อมูลไร่/การเก็บเกี่ยวเป็นไฟล์ CSV |
| **หลายภาษา** | ไทย, อังกฤษ, จีน |
| **การแจ้งเตือน** | แจ้งเตือนตามกำหนดการ |
| **ธีม สว่าง/มืด** | สลับในการตั้งค่าโปรไฟล์ |
| **อนิเมชัน** | แอนิเมชัน splash, fade-in, stagger |

---

## 🔧 เทคโนโลยีที่ใช้

| หมวดหมู่ | เทคโนโลยี | เวอร์ชั่น |
|----------|-----------|---------|
| **Framework** | React Native (Expo) | SDK 55 / RN 0.83 |
| **ภาษา** | TypeScript | ~5.9 |
| **ฐานข้อมูล** | Firebase Firestore (JS SDK) | ^12.11 |
| **การยืนยันตัวตน** | Firebase Authentication | ^12.11 |
| **การนำทาง** | React Navigation | v7 |
| **อนิเมชัน** | React Native Reanimated | 4.2 |
| **กราฟ** | react-native-chart-kit | ^6.12 |
| **การทดสอบ** | Jest + Testing Library | ^30.3 |
| **แพลตฟอร์ม** | Android + Web | ข้ามแพลตฟอร์ม |

---

## 🔐 ผู้ให้บริการการยืนยันตัวตน

| ผู้ให้บริการ | วิธีการ | สถานะ |
|----------|--------|--------|
| **อีเมล/รหัสผ่าน** | `signInWithEmailAndPassword` | ✅ พร้อมใช้งาน |
| **Google** | `signInWithPopup` (GoogleAuthProvider) | ✅ พร้อมใช้งาน |
| **Facebook** | `signInWithPopup` (FacebookAuthProvider) | ✅ พร้อมใช้งาน |
| **LINE** | `signInWithPopup` (OAuthProvider 'oidc.line') | ⚠️ ต้องตั้งค่า OIDC |

### การตั้งค่า LINE Login

1. สร้าง LINE Channel ที่ [LINE Developers Console](https://developers.line.biz/)
2. ใน Firebase Console → Authentication → Sign-in method → Add new provider
3. เลือก OpenID Connect → ใส่ Provider ID: `oidc.line`
4. ใส่ Client ID และ Client Secret จาก LINE Channel

### การตั้งค่า Facebook Login

1. สร้าง App ที่ [Facebook Developers](https://developers.facebook.com/)
2. ใน Firebase Console → Authentication → Sign-in method → Facebook
3. ใส่ App ID และ App Secret

---

## 🚀 เริ่มต้นใช้งาน

### ข้อกำหนดเบื้องต้น

- Node.js >= 18
- npm หรือ yarn
- โปรเจกต์ Firebase (ดูการตั้งค่าด้านล่าง)

### 1. Clone และติดตั้ง

```bash
git clone <repo-url>
cd Coffee_Project/frontend
npm install
```

### 2. ตั้งค่า Firebase

```bash
# คัดลอกเทมเพลต environment
cp ../.env.example ../.env

# แก้ไข .env ด้วยค่า config Firebase ของคุณ
# รับค่าจาก: Firebase Console → Project Settings → General
```

**ค่า .env ที่ต้องการ:**
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
```

### 3. เปิดใช้งานบริการ Firebase

1. **การยืนยันตัวตน**: Firebase Console → Authentication → เปิด Email/Password, Google, Facebook
2. **Firestore**: Firebase Console → Firestore Database → สร้างฐานข้อมูล

### 4. รันแอป

```bash
# Android
npx expo start --android

# Web
npx expo start --web

# Development (เลือกแพลตฟอร์ม)
npx expo start
```

---

## 🧪 การทดสอบ

### รันการทดสอบทั้งหมด

```bash
cd frontend
npm test
```

### รันพร้อม Coverage

```bash
npm run test:coverage
```

### โครงสร้างการทดสอบ

```
src/__tests__/
├── components/
│   ├── Button.test.tsx          # ทดสอบคอมโพเนนต์ Button
│   ├── Input.test.tsx           # ทดสอบคอมโพเนนต์ Input
│   └── PasswordStrength.test.tsx # ทดสอบความแข็งแรงรหัสผ่าน
├── context/
│   └── AuthContext.test.tsx      # ทดสอบ Auth context + ผู้ให้บริการทั้งหมด
├── lib/
│   ├── firebaseDb.test.ts       # FarmService + HarvestService CRUD
│   ├── exportService.test.ts    # ทดสอบการส่งออก CSV
│   └── offlineService.test.ts   # ทดสอบแคชออฟไลน์
└── screens/
    ├── HomeScreen.test.tsx       # ทดสอบหน้าแดชบอร์ด
    ├── HarvestScreen.test.tsx    # ทดสอบหน้าการเก็บเกี่ยว
    ├── PriceScreen.test.tsx      # ทดสอบหน้าวิเคราะห์
    └── ProfileScreen.test.tsx    # ทดสอบหน้าโปรไฟล์
```

### สรุปการทดสอบ

| โมดูล | การทดสอบ | กรณีทดสอบ |
|--------|-------|-------|
| **FarmService** | getAll, getById, create, update, delete, count | 12 |
| **HarvestService** | getAll, getById, create, update, delete, getSummary | 12 |
| **AuthContext** | signIn, signUp, signOut, resetPassword, Google, Facebook, LINE | 14 |
| **ExportService** | farmsToCSV, harvestsToCSV, exportFarms, exportHarvests, exportAll | 10 |
| **OfflineService** | cacheFarms, getCachedFarms, cacheHarvests, getCachedHarvests, clearCache, isCacheStale | 12 |
| **Components** | Button, Input, PasswordStrength | 15+ |
| **Screens** | Home, Harvest, Price, Profile | 8+ |
| **รวม** | | **80+** |

---

## 📁 โครงสร้างโปรเจกต์

```
Coffee_Project/
├── .agent/                        # ระบบ Context สำหรับ AI
├── .env                           # ตัวแปรสภาพแวดล้อม (ไม่ commit)
├── .env.example                   # เทมเพลตสภาพแวดล้อม
├── firestore.rules                # กฎความปลอดภัย Firestore
├── frontend/                      # แอป React Native (Expo)
│   ├── App.tsx                    # คอมโพเนนต์หลัก
│   ├── app.json                   # ค่ากำหนด Expo
│   ├── google-services.json       # ค่ากำหนด Firebase สำหรับ Android
│   ├── assets/                    # ไอคอนแอป, splash screen
│   └── src/
│       ├── components/
│       │   ├── AnimatedScreen.tsx  # เครื่องมืออนิเมชัน
│       │   ├── AnalyticsChart.tsx  # คอมโพเนนต์กราฟ
│       │   ├── Button.tsx         # ปุ่มใช้ซ้ำได้
│       │   ├── Input.tsx          # ช่องใส่ข้อมูลใช้ซ้ำได้
│       │   ├── PasswordStrength.tsx
│       │   └── SplashAnimation.tsx # หน้าจอ splash แอนิเมชัน
│       ├── constants/             # ธีม, สี, ระยะห่าง
│       ├── context/
│       │   ├── AuthContext.tsx     # Firebase Auth (ผู้ให้บริการทั้งหมด)
│       │   ├── LanguageContext.tsx # รองรับหลายภาษา
│       │   └── ThemeContext.tsx    # ธีม สว่าง/มืด
│       ├── lib/
│       │   ├── firebase.ts        # การเริ่มต้น Firebase JS SDK
│       │   ├── firebaseDb.ts      # บริการ Firestore
│       │   ├── exportService.ts   # ส่งออก CSV
│       │   ├── notificationService.ts
│       │   └── offlineService.ts  # แคชออฟไลน์
│       ├── navigation/            # React Navigation v7
│       ├── screens/
│       │   ├── auth/              # ล็อกอิน, สมัครสมาชิก, Welcome, ForgotPassword
│       │   ├── home/              # แดชบอร์ด
│       │   ├── farm/              # CRUD ไร่กาแฟ (ฟอร์ม 4 ขั้นตอน)
│       │   ├── harvest/           # จัดการการเก็บเกี่ยว
│       │   ├── price/             # วิเคราะห์และกราฟ
│       │   └── profile/           # การตั้งค่าผู้ใช้
│       ├── types/                 # นิยาม TypeScript
│       └── __tests__/             # การทดสอบหน่วย
└── backend/                       # Express API (ไม่บังคับใช้)
```

---

## 🔥 Collections ของ Firestore

### `farms` (ไร่กาแฟ)
```typescript
{
  id: string;
  name: string;                    // ชื่อไร่
  area: number;                    // พื้นที่ (ไร่)
  soil_type: string | null;        // ประเภทดิน
  water_source: string | null;     // แหล่งน้ำ
  province: string;                // จังหวัด
  district: string | null;         // อำเภอ
  altitude: number | null;         // ระดับความสูง (เมตร)
  variety: string | null;          // สายพันธุ์กาแฟ
  tree_count: number | null;       // จำนวนต้น
  planting_year: number | null;    // ปีที่ปลูก
  notes: string | null;            // หมายเหตุ
  user_id: string;                 // รหัสผู้ใช้
  created_at: Timestamp;           // วันที่สร้าง
}
```

### `harvests` (การเก็บเกี่ยว)
```typescript
{
  id: string;
  farm_id: string;                 // รหัสไร่ที่เก็บเกี่ยว
  harvest_date: string;            // วันที่เก็บเกี่ยว
  variety: string | null;          // สายพันธุ์
  weight_kg: number;               // น้ำหนัก (กิโลกรัม)
  income: number;                  // รายได้ (บาท)
  shift: string;                   // กะ (เช้า/บ่าย)
  notes: string | null;            // หมายเหตุ
  user_id: string;                 // รหัสผู้ใช้
  created_at: Timestamp;           // วันที่สร้าง
}
```

---

## 🛡️ ความปลอดภัย

- ต้องมีการยืนยันตัวตน Firebase สำหรับทุกการดำเนินการ
- กฎ Firestore จำกัดการเข้าถึงเฉพาะข้อมูลของเจ้าของเท่านั้น
- ตัวแปรสภาพแวดล้อมใน `.env` (ไม่ commit)
- `google-services.json` ควรอยู่ใน `.gitignore` สำหรับ production

---

## 👤 ผู้พัฒนา

- **Owner:** qqkiller2006
- **Created:** March 2026
- **License:** MIT
