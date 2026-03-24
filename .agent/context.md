# 📋 Project Context — บริบทของโปรเจกต์

> ⚠️ **AI ต้องอ่านไฟล์นี้ทุกครั้งที่รับ prompt ใหม่**
> ไฟล์นี้คือ "สมอง" ของ project — ถ้าไม่อ่าน จะทำงานผิด context

---

## 1. ข้อมูลทั่วไป (General Information)

| หัวข้อ            | รายละเอียด                             |
| ----------------- | -------------------------------------- |
| **ชื่อ Project**  | app_dev_mobile_coffee                  |
| **วันที่เริ่ม**   | 1 มีนาคม 2569                          |
| **เจ้าของ**       | qqkiller2006                           |
| **จุดประสงค์**    | พัฒนา mobile app สำหรับเชื่อมต่อข้อมูล coffee_สวน ให้ผู้ใช้จัดการผ่านโทรศัพท์ |
| **สถานะปัจจุบัน** | ✅ Phase 5 — Production Hardening & Architecture Cleanup |

---

## 2. จุดประสงค์และขอบเขต (Purpose & Scope)

### 2.1 เป้าหมายหลัก (Main Objectives)

- สร้าง React Native mobile app สำหรับ Android/iOS ให้เกษตรกรกาแฟบันทึกข้อมูลแปลง "coffee_สวน"
- ออกแบบ UX ที่ใช้งานง่ายบนหน้าจอสัมผัส พร้อมการแจ้งเตือนงานดูแลสวน
- เชื่อมต่อ API เพื่อนำเข้าข้อมูลผลผลิต/สภาพอากาศแบบ real-time โดยไม่ทำให้แอปค้าง

### 2.2 ขอบเขตงาน (Scope)

- **ในขอบเขต (In Scope):**
  - พัฒนา React Native application (Android/iOS)
  - ออกแบบ UI/UX responsive สำหรับผู้ใช้ภาคสนาม
  - เชื่อมต่อ backend/API สำหรับข้อมูล coffee_สวน และระบบแจ้งเตือน

- **นอกขอบเขต (Out of Scope):**
  - การพัฒนา web dashboard แยกต่างหาก
  - ระบบ ERP ภายในโรงคั่วหรือการเงินเชิงลึกที่ไม่เกี่ยวกับ coffee_สวน

---

## 3. Tech Stack & สถาปัตยกรรม (Architecture)

### 3.1 เทคโนโลยีที่ใช้

| ประเภท         | เทคโนโลยี | เวอร์ชัน | หมายเหตุ |
| -------------- | --------- | -------- | -------- |
| OS             | Android / iOS | —    | Mobile targets |
| Language       | TypeScript    | —    | ใช้กับ React Native |
| Framework      | Expo (React Native) | SDK 55 / RN 0.83 | Cross-platform Android + Web |
| Navigation     | React Navigation | v7 | Stack + Bottom Tabs |
| Database       | Firebase Firestore (JS SDK) | ^12.11 | เก็บข้อมูล coffee_สวน |
| Auth           | Firebase Authentication | ^12.11 | Email, Google, Facebook, LINE |
| Location       | expo-location | ~55.x | GPS coordinate fetching for farm mapping |
| PDF Export     | expo-print + expo-sharing | ~55.x | Generate and share PDF farm reports |
| Image Utils    | expo-image-manipulator | ~55.x | Compress uploaded images on native |
| Animations     | React Native Reanimated | 4.2 | Splash, fade-in, stagger |
| Testing        | Jest + custom mocks | ^29.7 | 47 suites, 481 tests |

### 3.2 แผนผังสถาปัตยกรรม (Architecture Diagram)

```
[Mobile App (Expo/RN)] — Android + Web (Serverless / No custom backend)
   ├── Auth Flow (Welcome → Login/Register → ForgotPassword)
   │   ├── Email/Password
   │   ├── Google (signInWithPopup)
   │   ├── Facebook (signInWithPopup)
   │   └── LINE (OAuthProvider OIDC)
   ├── Main Tabs (6 tabs)
   │   ├── Home (Dashboard with stats)
   │   ├── My Farms → Add Farm (Step 1-4 + GPS)
   │   ├── Harvest (full CRUD + summary)
   │   ├── Community (feed, posts, comments, groups)
   │   ├── Price/Analytics (charts + AI insights)
   │   └── Profile (settings + theme)
   ├── Services
   │   ├── firebaseDb.ts (Firestore CRUD)
   │   ├── communityService.ts (community posts/comments/groups)
   │   ├── productionService.ts (fresh sales, processed products, annual production)
   │   ├── userProfileService.ts (farmer profile + citizen ID validation)
   │   ├── locationService.ts (GPS coordinate fetching)
   │   ├── exportService.ts (CSV export)
   │   ├── pdfExportService.ts (HTML → PDF export + share)
   │   ├── imageUtils.ts (image compression / optimization)
   │   └── offlineService.ts (AsyncStorage cache)
   ├── Production Flows
   │   ├── Fresh Sale entry
   │   ├── Processed Product entry
   │   └── Annual Report export
   └── [Firebase Backend (Serverless)]
       ├── Auth (Firebase Authentication)
       └── Firestore (farms + harvests + community collections)
```

---

## 4. โครงสร้าง Directory (Project Structure)

```
Coffee_Project/
├── .agent/                       # 🧠 AI Context System (ห้ามลบ)
│   ├── context.md
│   ├── project-log.md
│   ├── rules.md
│   └── workflows/
├── .env                          # Environment variables (ไม่ commit)
├── .env.example                  # Template สำหรับ env
├── frontend/                     # 📱 Expo (React Native) app
│   ├── App.tsx                   # Root component
│   ├── app.json                  # Expo config
│   ├── package.json              # Frontend deps + Jest config
│   ├── src/
│   │   ├── constants/            # Theme, colors, spacing
│   │   ├── components/           # Reusable UI (Button, Input, PasswordStrength)
│   │   ├── __tests__/            # Frontend tests
│   │   │   ├── components/       # Button, Input, PasswordStrength tests
│   │   │   ├── lib/              # Service tests (locationService, etc.)
│   │   │   └── screens/          # Home, Harvest, Price, Profile tests
│   │   ├── hooks/                # Pagination and reusable hooks
│   │   ├── lib/                  # Firebase JS SDK + services
│   │   │   ├── locationService.ts # GPS coordinate fetching
│   │   │   ├── pdfExportService.ts # PDF report generation + sharing
│   │   │   ├── imageUtils.ts     # Image compression utilities
│   │   │   └── ...               # firebaseDb, community, export, offline, etc.
│   │   ├── types/                # Navigation type definitions
│   │   ├── navigation/           # AppNavigator, AuthStack, MainTabs, FarmStack
│   │   └── screens/
│   │       ├── auth/             # Welcome, Login, Register, ForgotPassword, PrivacyPolicy
│   │       ├── home/             # HomeScreen (Dashboard - dark theme)
│   │       ├── farm/             # FarmList, AddFarmStep1-4 (Step3 has GPS)
│   │       ├── harvest/          # HarvestScreen (full UI from mockup)
│   │       ├── price/            # PriceScreen/Analytics (full UI)
│   │       └── profile/          # ProfileScreen (full UI)
│   └── package.json
├── firestore.rules               # Firestore security rules
├── firebase.json                 # Firebase project config
└── skills-lock.json
```

> ⚠️ **หมายเหตุ:** โฟลเดอร์ `backend/` ถูกลบออกใน Sprint 5.5 เนื่องจากเป็นโค้ดร้าง (ทุก route คืน 501) — แอปใช้ Firebase JS SDK ยิงตรงจาก frontend

---

## 5. สภาพแวดล้อม (Environments)

| Environment | URL / Path                         | หมายเหตุ      |
| ----------- | ---------------------------------- | ------------- |
| Development | `/home/qqkiller2006/data/github_backup/Mobile-Application/Coffee_Project/frontend` | เครื่อง local |
| Staging     | (ระบุ เมื่อมี)                     | —             |
| Production  | (ระบุ เมื่อมี)                     | —             |

---

## 6. ข้อจำกัดและข้อควรระวัง (Constraints & Warnings)

### 6.1 ข้อจำกัดทางเทคนิค

- (ระบุข้อจำกัดที่สำคัญ)

### 6.2 ข้อควรระวัง

- ⚠️ ห้ามลบ folder `.agent/` — เป็น "สมอง" ของ project
- ⚠️ ห้ามแก้ไขโครงสร้างของ 3 files หลักใน `.agent/` โดยไม่แจ้งเจ้าของ
- ⚠️ AI ต้อง **อ่าน** 3 files ใน `.agent/` ทุกครั้งก่อนทำงาน
- ⚠️ AI ต้อง **อัปเดต** 3 files ใน `.agent/` หลังทำงานเสร็จทุกครั้ง

---

## 7. บันทึกการเปลี่ยนแปลง Context (Change Log)

| วันที่     | ผู้แก้ไข         | สิ่งที่เปลี่ยน                |
| ---------- | ---------------- | ----------------------------- |
| 2569-03-01 | AI (Antigravity) | สร้างไฟล์ context.md เริ่มต้น |
| 2569-03-18 | AI (Cascade)     | เพิ่มบทบาท/กฎ Senior Mobile Dev |
| 2569-03-19 | AI (Cascade)     | สร้าง Expo app ครบทุกหน้าจอจาก mockup, อัปเดต tech stack + directory structure |
| 2569-03-24 | AI (Antigravity) | ลบ backend/ (zombie code), เพิ่ม expo-location + GPS ใน AddFarmStep3, อัปเดต architecture diagram |
| 2569-03-24 | AI (Cascade)     | เพิ่ม expo-print / expo-sharing / expo-image-manipulator, อัปเดต test count เป็น 47 suites / 481 tests, เพิ่ม PDF/Image services |
| 2569-03-24 | AI (Cascade)     | เพิ่ม productionService / userProfileService, flow ขายผลสด-แปรรูป-รายงานรายปี, และ centralized logout |
| 2569-03-19 | AI (Cascade)     | Restructure frontend/backend, setup Node.js/Express API, Jest testing, full UI screens (Harvest/Price/Profile) |
| 2569-03-20 | AI (Cascade)     | Firebase migration: remove Supabase, use Firebase JS SDK for auth+db, add Facebook/LINE auth, animations, 105 unit tests |

---

> 📝 **วิธีอัปเดตไฟล์นี้:** เพิ่มข้อมูลในแต่ละ section ตามที่ project พัฒนาไป
> อย่าลบ section ที่ยังว่าง — ให้คง template ไว้เพื่อเติมข้อมูลในอนาคต
