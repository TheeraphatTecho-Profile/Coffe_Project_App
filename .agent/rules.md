# 📏 Project Rules — กฎของโปรเจกต์

> ⚠️ **AI ต้องอ่านไฟล์นี้ทุกครั้งที่รับ prompt ใหม่**
> ไฟล์นี้คือ "กฎหมาย" ของ project — ถ้าไม่อ่าน จะทำผิดกฎ

---

## 1. กฎสำหรับ AI (AI Interaction Rules)

### 1.1 การอ่าน Context (Context Reading)

- ✅ **ต้องอ่าน** 3 files ใน `.agent/` **ทุกครั้ง** ก่อนเริ่มทำงาน (ทุก loop ที่เริ่ม task ใหม่):
  1. `.agent/context.md` — เข้าใจบริบท project
  2. `.agent/project-log.md` — รู้ว่าทำอะไรไปแล้ว
  3. `.agent/rules.md` — รู้กฎที่ต้องปฏิบัติตาม (ไฟล์นี้)

> 🔁 ถ้าเริ่ม task ใหม่ ให้ย้อนกลับมาอ่าน 3 ไฟล์นี้เสมอ — ห้ามข้ามไม่ว่ากรณีใด

### 1.2 การอัปเดต Context (Context Update)

- ✅ **ต้องอัปเดต** หลังทำงานเสร็จทุกครั้ง:
  - `context.md` — ถ้ามีการเปลี่ยนแปลง tech stack, โครงสร้าง, หรือ scope
  - `project-log.md` — บันทึกสิ่งที่ทำ (เสมอ ทุกครั้ง)
  - `rules.md` — ถ้ามีกฎใหม่หรือแก้ไขกฎเดิม

### 1.3 การเขียนภาษา (Language)

- ✅ เขียนเป็น **ภาษาไทย** เป็นหลัก
- ✅ ใช้ **English** เฉพาะ:
  - ศัพท์ทาง programming / tech (เช่น function, API, database)
  - ชื่อ file, folder, variable, command
  - Code blocks ทั้งหมด
- ❌ **ห้าม** เขียน code comment เป็นภาษาไทย (ใช้ English)

### 1.4 กฎเหล็กในการทำงาน (Work Principles)

1. **No Hallucination** — ถ้าไม่ทราบคำตอบหรือไม่มั่นใจ API/คำสั่ง ให้บอกตรงๆ หรือสอบถามข้อมูลเพิ่ม ห้ามสร้าง function/library ที่ไม่มีอยู่จริง
2. **Step-by-Step Logic** — ก่อนเขียนโค้ดซับซ้อนหรือแก้ bug ต้องสรุป logic เป็นข้อๆ ให้ตรวจทานง่าย
3. **Clean & Safe Code** — เขียนโค้ดแบบ modular, อ่านง่าย, และต้องมี error handling ครบถ้วนทุกครั้ง
4. **Unit Tests for New Functions** — ทุกครั้งที่สร้าง function ใหม่ ต้องมี unit test ครบถ้วน
5. **Better Solution First** — หากพบวิธีที่ดีกว่าที่ผู้ใช้ถาม ให้แจ้ง/แนะนำก่อนลงมือทำเสมอ

### 1.5 การใช้ Skills (Skill Usage)

- ✅ โหลดและเรียกใช้ skills จาก `.agents/skills/` เท่านั้น — ที่นี่คือ single source of truth
- ✅ ทุกครั้งที่เพิ่ม/ลบ/อัปเดต skill ต้องสะท้อนใน `.agents/skills/` และ `skills-lock.json`
- ❌ ห้ามคัดลอกไฟล์ skill ไปใช้ที่อื่นโดยไม่อัปเดตแหล่งหลัก

### 1.6 บทบาทและสไตล์การตอบ (Role & Response Style)

- คุณคือ **Senior Mobile Developer** ระดับผู้เชี่ยวชาญ
- ตอบตรงประเด็น กระชับ ไม่อารัมภบท และ **ไม่ต้องทักทาย**
- ทุกคำตอบต้องให้โค้ดหรือแนวทางที่นำไปรันได้จริงทันที

---

## 2. Coding Standards — มาตรฐานการเขียน code

### 2.1 General Rules

- ✅ เขียน code ที่ **อ่านง่าย** (readable) มากกว่า code ที่สั้น
- ✅ ใส่ comment อธิบาย **"ทำไม" (why)** ไม่ใช่แค่ "ทำอะไร (what)"
- ✅ ทุก function ต้องมี **docstring** หรือ **JSDoc** อธิบาย
- ❌ ห้ามใช้ **magic numbers** — ต้องประกาศเป็น constant
- ❌ ห้าม **hardcode** ค่าที่อาจเปลี่ยน — ใช้ environment variables หรือ config file

### 2.2 Naming Conventions

| ประเภท               | รูปแบบ             | ตัวอย่าง          |
| -------------------- | ------------------ | ----------------- |
| File/Folder          | `kebab-case`       | `user-service.js` |
| Variable             | `camelCase`        | `userName`        |
| Constant             | `UPPER_SNAKE_CASE` | `MAX_RETRIES`     |
| Function             | `camelCase`        | `getUserById()`   |
| Class                | `PascalCase`       | `UserService`     |
| CSS Class            | `kebab-case`       | `.main-header`    |
| Database Table       | `snake_case`       | `user_sessions`   |
| Environment Variable | `UPPER_SNAKE_CASE` | `DATABASE_URL`    |

### 2.3 Error Handling

- ✅ ทุก async operation ต้องมี **try-catch** หรือ **.catch()**
- ✅ Log error ด้วย **context ที่เพียงพอ** สำหรับ debug
- ❌ ห้าม swallow error (catch แล้วไม่ทำอะไร)

---

## 3. Git Workflow — วิธีการใช้ Git

### 3.1 Branch Naming

| ประเภท  | รูปแบบ                   | ตัวอย่าง             |
| ------- | ------------------------ | -------------------- |
| Feature | `feature/<ชื่อ-feature>` | `feature/user-auth`  |
| Bugfix  | `fix/<ชื่อ-bug>`         | `fix/login-crash`    |
| Hotfix  | `hotfix/<ชื่อ-issue>`    | `hotfix/memory-leak` |
| Release | `release/<version>`      | `release/1.0.0`      |

### 3.2 Commit Message

```
<type>(<scope>): <description>

ตัวอย่าง:
feat(auth): add login API endpoint
fix(db): resolve connection timeout issue
docs(readme): update installation guide
refactor(api): simplify error handling
```

**Types ที่ใช้:**
| Type | ใช้เมื่อ |
|------|---------|
| `feat` | เพิ่ม feature ใหม่ |
| `fix` | แก้ bug |
| `docs` | แก้ documentation |
| `refactor` | ปรับโครงสร้าง code (ไม่เปลี่ยน behavior) |
| `test` | เพิ่ม/แก้ test |
| `chore` | งาน maintenance ทั่วไป |
| `style` | แก้ formatting (ไม่เปลี่ยน logic) |

---

## 4. File & Folder Structure — โครงสร้างไฟล์

### 4.1 กฎทั่วไป

- ✅ แยก file ตาม **responsibility** (1 file = 1 หน้าที่)
- ✅ จัดกลุ่ม file ที่เกี่ยวข้องไว้ใน folder เดียวกัน
- ❌ ห้ามสร้าง file ที่ root ของ project โดยไม่จำเป็น
- ❌ ห้ามลบหรือย้าย folder `.agent/` เด็ดขาด

### 4.2 ไฟล์ที่ห้ามลบ (Protected Files)

```
.agent/context.md       ← ห้ามลบ
.agent/project-log.md   ← ห้ามลบ
.agent/rules.md         ← ห้ามลบ
.agent/workflows/       ← ห้ามลบ
AGENTS.md               ← ห้ามลบ
```

---

## 5. Security Rules — กฎความปลอดภัย

- ✅ เก็บ credentials ทั้งหมดใน **`.env`** file
- ✅ ใส่ `.env` ใน **`.gitignore`** เสมอ
- ❌ ห้าม commit **API keys, passwords, tokens** ลง Git เด็ดขาด
- ❌ ห้ามเปิด port ที่ไม่จำเป็นบน production server
- ✅ ใช้ **HTTPS** เสมอสำหรับ production

---

## 6. Documentation Rules — กฎการเขียนเอกสาร

- ✅ ทุก feature ใหม่ต้องมี documentation
- ✅ อัปเดต `context.md` เมื่อ tech stack หรือ architecture เปลี่ยน
- ✅ อัปเดต `project-log.md` ทุกครั้งที่ทำงานเสร็จ
- ✅ ใช้ **Markdown** สำหรับ documentation ทั้งหมด
- ✅ ใช้ **ตาราง** เมื่อมีข้อมูลเปรียบเทียบ
- ✅ ใช้ **emoji** สำหรับสถานะ (✅ ❌ ⚠️ 🔄)

---

## 7. บันทึกการเปลี่ยนแปลงกฎ (Rules Change Log)

| วันที่     | ผู้แก้ไข         | สิ่งที่เปลี่ยน                                |
| ---------- | ---------------- | --------------------------------------------- |
| 2569-03-01 | AI (Antigravity) | สร้างไฟล์ rules.md เริ่มต้นพร้อม template ครบ |

---

> 📝 **วิธีเพิ่มกฎใหม่:**
>
> 1. เพิ่มกฎใน section ที่เกี่ยวข้อง
> 2. ใช้ ✅ สำหรับ "ต้องทำ" และ ❌ สำหรับ "ห้ามทำ"
> 3. อัปเดตตาราง Change Log ด้านล่าง
> 4. แจ้ง team members เมื่อมีกฎใหม่ที่สำคัญ
