# 🟢 LINE Login Setup Guide - Firebase Integration

## 📋 ภาพรวม

คู่มือการตั้งค่า LINE Login สำหรับ Coffee Project ผ่าน Firebase Authentication (OIDC Provider)

---

## 🎯 ขั้นตอนการตั้งค่า

### **Step 1: สร้าง LINE Login Channel**

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. Login ด้วย LINE Account
3. คลิก **"Create a new provider"** (ถ้ายังไม่มี)
   - Provider name: `Loei Coffee` (ตัวอย่าง)
4. คลิก **"Create a LINE Login channel"**
   - Channel type: **LINE Login**
   - Channel name: `Loei Coffee Login`
   - Channel description: `LINE Login for Loei Coffee Farm Management App`
   - App types: เลือก **Web app**

---

### **Step 2: ตั้งค่า Callback URL**

ใน LINE Login Channel → **LINE Login** tab:

1. **Callback URL** (สำคัญมาก!):
   ```
   https://coffee-project-cfcc7.firebaseapp.com/__/auth/handler
   ```

2. **Email address permission**: เปิดใช้งาน (ถ้าต้องการเก็บอีเมล)

3. **OpenID Connect**: เปิดใช้งาน

4. บันทึกการตั้งค่า

---

### **Step 3: รับ Channel ID และ Channel Secret**

1. ไปที่ **Basic settings** tab
2. คัดลอก:
   - **Channel ID** (ตัวเลข 10 หลัก)
   - **Channel secret** (คลิก "Issue" ถ้ายังไม่มี)

---

### **Step 4: ตั้งค่า Firebase Console**

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์: **coffee-project-cfcc7**
3. ไปที่ **Authentication** → **Sign-in method**
4. คลิก **"Add new provider"**
5. เลือก **OpenID Connect**

#### การตั้งค่า OIDC Provider:

| ฟิลด์ | ค่า |
|------|-----|
| **Name** | `LINE` |
| **Provider ID** | `oidc.line` |
| **Client ID** | `{YOUR_LINE_CHANNEL_ID}` |
| **Client secret** | `{YOUR_LINE_CHANNEL_SECRET}` |
| **Issuer (URL)** | `https://access.line.me` |

6. คลิก **Save**

---

### **Step 5: ตั้งค่า Environment Variables**

เพิ่มใน `.env`:

```bash
# --- LINE Login ---
EXPO_PUBLIC_LINE_CHANNEL_ID=YOUR_LINE_CHANNEL_ID
```

---

### **Step 6: ทดสอบ LINE Login**

1. รัน Frontend:
   ```bash
   cd frontend
   npx expo start --web
   ```

2. เปิด browser ไปที่ `http://localhost:8081`

3. คลิกปุ่ม **"LINE"** ในหน้า Login

4. ควรเห็นหน้า LINE Login popup

5. Login ด้วย LINE Account

6. ยินยอมการเข้าถึงข้อมูล

7. ถ้าสำเร็จจะกลับมาที่แอปพร้อม user logged in

---

## 🔧 Troubleshooting

### ❌ Error: `redirect_uri_mismatch`

**สาเหตุ**: Callback URL ไม่ตรงกับที่ตั้งค่าใน LINE Console

**แก้ไข**:
1. ตรวจสอบ Callback URL ใน LINE Console ต้องเป็น:
   ```
   https://coffee-project-cfcc7.firebaseapp.com/__/auth/handler
   ```
2. ไม่มี trailing slash `/` ท้าย URL
3. ต้องใช้ `https://` (ไม่ใช่ `http://`)

---

### ❌ Error: `invalid_client`

**สาเหตุ**: Channel ID หรือ Channel Secret ผิด

**แก้ไข**:
1. ตรวจสอบ Channel ID และ Channel Secret ใน Firebase Console
2. คัดลอกใหม่จาก LINE Developers Console
3. ลบ space หรือ newline ที่อาจติดมา

---

### ❌ Error: `invalid_scope`

**สาเหตุ**: Scope ที่ขอไม่ถูกต้อง

**แก้ไข**:
1. ตรวจสอบ `AuthContext.tsx`:
   ```typescript
   provider.addScope('profile');
   provider.addScope('openid');
   provider.addScope('email');
   ```
2. ตรวจสอบว่า LINE Channel เปิดใช้งาน OpenID Connect

---

### ❌ Error: `popup_closed_by_user`

**สาเหตุ**: ผู้ใช้ปิด popup ก่อนเสร็จ

**แก้ไข**: ไม่ต้องแก้ไข (เป็น user action)

---

## 📱 LINE Login Flow

```
1. User คลิกปุ่ม "LINE"
   ↓
2. App เรียก signInWithLine()
   ↓
3. Firebase เปิด popup → LINE Login
   ↓
4. User login ด้วย LINE Account
   ↓
5. LINE ส่ง authorization code → Firebase
   ↓
6. Firebase แลก code → LINE access token
   ↓
7. Firebase สร้าง Firebase User
   ↓
8. App ได้รับ user object (logged in)
```

---

## 🔐 ข้อมูลที่ได้จาก LINE

```typescript
{
  uid: "line:U1234567890abcdef",  // Firebase UID
  displayName: "John Doe",         // ชื่อ LINE
  email: "john@example.com",       // อีเมล (ถ้ามี)
  photoURL: "https://...",         // รูปโปรไฟล์ LINE
  providerId: "oidc.line"          // Provider
}
```

---

## 📝 Checklist

- [ ] สร้าง LINE Login Channel
- [ ] ตั้งค่า Callback URL: `https://coffee-project-cfcc7.firebaseapp.com/__/auth/handler`
- [ ] เปิดใช้งาน OpenID Connect ใน LINE Channel
- [ ] คัดลอก Channel ID และ Channel Secret
- [ ] เพิ่ม OIDC Provider ใน Firebase Console
  - Provider ID: `oidc.line`
  - Issuer: `https://access.line.me`
- [ ] เพิ่ม LINE_CHANNEL_ID ใน `.env`
- [ ] ทดสอบ LINE Login บน Web
- [ ] ทดสอบ LINE Login บน Android (ถ้ามี)

---

## 🌐 URLs สำคัญ

| Service | URL |
|---------|-----|
| LINE Developers Console | https://developers.line.biz/console/ |
| Firebase Console | https://console.firebase.google.com/ |
| Firebase Auth Handler | https://coffee-project-cfcc7.firebaseapp.com/__/auth/handler |
| LINE OIDC Issuer | https://access.line.me |
| LINE OIDC Discovery | https://access.line.me/.well-known/openid-configuration |

---

## 📚 เอกสารอ้างอิง

- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)
- [Firebase OIDC Provider](https://firebase.google.com/docs/auth/web/openid-connect)
- [LINE OIDC Specification](https://developers.line.biz/en/docs/line-login/integrate-line-login/#using-openid-connect)

---

## ✅ สรุป

หลังจากตั้งค่าเสร็จแล้ว:

1. ✅ ผู้ใช้สามารถ Login ด้วย LINE Account
2. ✅ ข้อมูลโปรไฟล์ถูก sync จาก LINE
3. ✅ Firebase สร้าง User ใหม่อัตโนมัติ
4. ✅ รองรับทั้ง Web และ Mobile (Android/iOS)

**Next Step**: ทดสอบ LINE Login และตรวจสอบว่า user data ถูกบันทึกใน Firestore ถูกต้อง
