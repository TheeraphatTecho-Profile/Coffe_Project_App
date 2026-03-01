---
description: อ่าน Agent Context — บังคับ AI อ่าน 3 files หลักทุกครั้งก่อนเริ่มทำงาน
---

# 🧠 Read Agent Context

> **เรียกใช้อัตโนมัติ** ทุกครั้งที่ AI รับ prompt ใหม่

// turbo-all

## ขั้นตอน (Steps)

1. อ่านไฟล์ `context.md` เพื่อเข้าใจบริบทของ project

```
view_file: .agent/context.md
```

2. อ่านไฟล์ `project-log.md` เพื่อรู้ว่าทำอะไรไปแล้ว

```
view_file: .agent/project-log.md
```

3. อ่านไฟล์ `rules.md` เพื่อรู้กฎที่ต้องปฏิบัติตาม

```
view_file: .agent/rules.md
```

4. หลังทำงานเสร็จ ให้อัปเดตไฟล์ที่เกี่ยวข้อง:
   - `project-log.md` — บันทึกสิ่งที่ทำ (อัปเดต **ทุกครั้ง**)
   - `context.md` — อัปเดต **ถ้า** มีการเปลี่ยนแปลง tech stack, โครงสร้าง, หรือ scope
   - `rules.md` — อัปเดต **ถ้า** มีกฎใหม่หรือแก้ไขกฎเดิม
