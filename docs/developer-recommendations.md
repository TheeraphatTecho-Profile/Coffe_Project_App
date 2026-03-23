# 🛠️ Developer Recommendations — สวนกาแฟเลย App

> เอกสารนี้รวบรวมคำแนะนำจากการรีวิวโค้ดและทดสอบฟีเจอร์ทั้งหมด  
> วันที่ตรวจสอบ: 23 มีนาคม 2569

---

## 📊 Bug Priority Matrix (Severity)

| Bug | Severity | Screen | สถานะ | วิธีแก้ |
|-----|----------|--------|-------|---------|
| Blank screen crash after Google auth failure | **CRITICAL** | WelcomeScreen, LoginScreen | ✅ Fixed (ErrorBoundary) | Added `ErrorBoundary` component at root |
| ข้อมูล CRUD ไม่บันทึก / โหลดไม่ได้ | **CRITICAL** | ทุกหน้าจอที่มีข้อมูล | ⚠️ Pending Rules Deploy | ไฟล์ `firestore.rules` ยังไม่ถูก deploy ขึ้น Firebase (Missing Permissions) + แก้ type `harvest_date` แล้ว |
| Dual ThemeProvider (context ซ้อน) | **HIGH** | App.tsx | ✅ Fixed | Merged ThemeContext → drives RichThemeProvider |
| Tab bar ไม่เปลี่ยนสีตาม dark mode | **HIGH** | MainTabs | ✅ Fixed | ใช้ `useTheme()` hook แทน static COLORS |
| Debug console.log ในโค้ด production | **MEDIUM** | googleAuth.ts | ✅ Fixed | ลบ Sprint 4.13 instrumentation logs |
| `Alert.alert()` ไม่ทำงานบน Web | **MEDIUM** | หลายหน้าจอ | ⚠️ Partial | ใช้ `Platform.OS === 'web' ? globalThis.confirm(...)` |
| `window.location.href` missing on iOS | **LOW** | googleAuth.ts | ✅ OK | มี `typeof window !== 'undefined'` guard |

---

## 🚀 Performance Recommendations

### 1. Lazy Load Screens (Bundle Size)

**ปัจจุบัน:** `AppNavigator.tsx` import ทุก screen พร้อมกันที่ startup  
**แนะนำ:** ใช้ `React.lazy()` + `Suspense` สำหรับ screens ที่ไม่ใช้บ่อย

```tsx
// Before
import { MarketIntelligenceScreen } from '../screens/market/MarketIntelligenceScreen';

// After
const MarketIntelligenceScreen = React.lazy(
  () => import('../screens/market/MarketIntelligenceScreen')
);
```

**Impact:** ลด Initial bundle size ~20–30% → แอปโหลดเร็วขึ้น

---

### 2. Memoize Expensive Renders

**ปัจจุบัน:** `HomeScreen`, `HarvestScreen` re-render ทุกครั้งที่ parent state เปลี่ยน  
**แนะนำ:** ใช้ `React.memo()` สำหรับ list item components

```tsx
// Wrap harvest row items
const HarvestRow = React.memo(({ harvest }: { harvest: Harvest }) => {
  // ...
});
```

**Impact:** ลด unnecessary re-renders ใน list screens

---

### 3. Firestore Query Optimization

**ปัจจุบัน:** `HomeScreen` เรียก 3 Firestore queries พร้อมกัน (`count`, `getSummary`, `getAll`)  
**แนะนำ:**
1. Cache ผล query ใน `offlineService.ts` (AsyncStorage) TTL 5 นาที
2. Paginate `getAll` — ดึงแค่ 20 items แรก แล้ว load more เมื่อ scroll

```ts
// Add pagination
HarvestService.getPage(userId, { limit: 20, startAfter: lastDoc })
```

**Impact:** ลด Firestore reads → ลดค่าใช้จ่าย + เร็วขึ้นบน 3G

---

### 4. Image Optimization (photoService)

**ปัจจุบัน:** อัปโหลด full-resolution รูปไปยัง Firebase Storage  
**แนะนำ:** บีบอัดก่อน upload ด้วย `expo-image-manipulator` (ทำอยู่แล้วใน `photoService.ts`) — ตรวจว่า max width ≤ 1024px

```ts
// photoService.ts — ตรวจสอบว่ามี compression ทุก path
await manipulateAsync(uri, [{ resize: { width: 1024 } }], {
  compress: 0.7,
  format: SaveFormat.JPEG,
});
```

---

### 5. Avoid Anonymous Functions in render()

**ปัจจุบัน:** `MainTabs` สร้าง `screenOptions` function ใหม่ทุก render  
**แนะนำ:** ย้าย static values ออกไปนอก component

---

## ⚡ Speed Optimizations

### Network

| เรื่อง | แนะนำ | Priority |
|--------|--------|----------|
| Firestore offline persistence | เปิด `enableIndexedDbPersistence()` บน web | HIGH |
| Prefetch ข้อมูล home ตอน splash | Background fetch ระหว่าง splash animation | MEDIUM |
| Debounce search inputs | ใช้ `debounce(fn, 300ms)` ใน Community search | MEDIUM |
| Compress images before upload | Max 1024px, quality 70% | HIGH |

### React Native / Expo

| เรื่อง | แนะนำ | Priority |
|--------|--------|----------|
| `FlatList` แทน `ScrollView` สำหรับ lists | HarvestScreen, CommunityScreen | HIGH |
| `useCallback` สำหรับ event handlers | HomeScreen `fetchData`, `onRefresh` | MEDIUM |
| `useMemo` สำหรับ `createStyles()` | ทุก screen ที่ใช้ pattern นี้ | LOW |
| Move heavy computation to `useWorker` or background | aiInsightsService, marketService | LOW |

---

## 🔒 Security Checklist

- [x] `.env` ไม่ถูก commit ใน git
- [x] Firestore rules ตรวจ `request.auth.uid` ก่อนทุก operation
- [x] Input sanitization ใน `securityService.ts`
- [ ] **TODO:** Rate limiting บน web auth (ป้องกัน brute force)
- [ ] **TODO:** Content Security Policy header สำหรับ web deploy
- [ ] **TODO:** ตรวจ Firebase App Check เพื่อป้องกัน unauthorized API calls

---

## 🧪 Testing Coverage Gaps & Current Blockers

### 💥 บล็อคเกอร์ปัจจุบัน (Blocker)
จากการทดสอบ CRUD Feature ในบราวเซอร์ พบว่า **การอ่านเขียนข้อมูลทั้งหมดล้มเหลว** ด้วย Error `Missing or insufficient permissions`
**สาเหตุและวิธีแก้:**
1. ✅ **แก้ Data Type:** ไฟล์ `firestore.rules` เดิมกำหนดให้ `harvest_date` เป็น `timestamp` แต่ฝั่ง Frontend ส่งค่าเป็น `string` (แก้ไขกฎให้รองรับ string แล้ว)
2. ⚠️ **Deploy Rules:** ตัวแอปใช้งาน Firebase Live Database ที่ยังใช้ rules เดิมอยู่ ต้องรันคำสั่ง deployment ผ่าน Firebase CLI

**ผู้พัฒนาต้องรันคำสั่งนี้ที่ Terminal ทันที:**
```bash
firebase login
firebase deploy --only firestore:rules
```
*(สร้างไฟล์ `firebase.json` เตรียมไว้ให้แล้ว)*

### Testing Coverage

| Feature | Test Status | Priority |
|---------|-------------|----------|
| Community CRUD (post, comment, like) | ❌ ไม่มี test | HIGH |
| Messaging (send/receive) | ❌ ไม่มี test | HIGH |
| Offline service (cache staleness) | ✅ มี test | — |
| Firebase Firestore CRUD | ✅ 26 tests | — |
| AuthContext | ✅ 39 tests | — |
| photoService compression | ❌ ไม่มี test | MEDIUM |
| i18nService language switch | ❌ ไม่มี test | LOW |

---

## 📁 Folder/File Cleanup Done

| Action | ไฟล์/Folder |
|--------|------------|
| ✅ Removed dead imports | `MainTabs.tsx` (StyleSheet, View, COLORS, FONTS) |
| ✅ Removed debug logs | `googleAuth.ts` |
| ✅ Consolidated ThemeProvider | `App.tsx` |
| ✅ Added ErrorBoundary | `src/components/ErrorBoundary.tsx` |

---

## 📱 Next Sprint Recommendations

1. **เพิ่ม PDF Export** สำหรับ harvest reports (งานค้างจาก backlog)
2. **GPS Mapping** สำหรับ farm location บน AddFarmStep3
3. **FlatList migration** สำหรับ HarvestScreen + CommunityScreen (performance critical)
4. **Firestore offline persistence** เปิด `enableIndexedDbPersistence()` ใน `firebase.ts`
5. **Add Community + Messaging tests** เพิ่มก่อน release

---

> 📝 อัปเดต: 23 มีนาคม 2569 | ผู้ตรวจสอบ: AI (Antigravity)
