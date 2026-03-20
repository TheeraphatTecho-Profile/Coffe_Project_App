#!/usr/bin/env python3
"""
Coffee Farm App - Persona Generator
Generates 300 unique personas for testing
"""

import json
import random
from datetime import datetime

# Data pools for generating unique combinations
FIRST_NAMES_MALE = [
    "สมชาย", "สุรชัย", "วิชัย", "ทองดี", "เฉลิม", "ประเสริฐ", "ธนา", "พงศ์", "รัชชา", "สนิท",
    "บุญช่วย", "เจริญ", "โชคดี", "ศักดิ์", "ไพศาล", "สมบูรณ์", "พิเชษฐ", "ชัยวัฒน์", "ปรานต์", "อรรถ",
    "ณรงค์", "สมศักดิ์", "อำนวย", "วิเชียร", "สุขใจ", "มานะ", "ประหยัด", "นิรันดร์", "สมเกียรติ", "ถนอม",
    "ทรงยศ", "ประสิทธิ์", "ชาญชัย", "สมบัติ", "วีระ", "พร้อม", "เสน่ห์", "มงคล", "ครองชีพ", "เจตนา",
    "ธีระ", "ศราวุฒิ", "นันทกร", "พิชัย", "วิรุฬห์", "ธนกฤต", "ปิยะ", "อนุชา", "พุฒิ", "ชนก"
]

FIRST_NAMES_FEMALE = [
    "พิมพ์ชนก", "สุภาพร", "จิราพร", "นภา", "สมหญิง", "วิไล", "สุนี", "นลินี", "พรทิพย์", "อารีย์",
    "ชนิดา", "กมลา", "บุญใจ", "ทับทิม", "สมใจ", "ศรีสุข", "สุดา", "วาสนา", "พิมล", "แขนงพรรณ",
    "สุภัทรา", "ชฎาพร", "กัลยา", "ศิริพร", "อรุณี", "นิตยา", "ประนอม", "มาลี", "ยุพา", "รัตนา",
    "สุธาสินี", "พิไลพรรณ", "วันทนา", "ณัฐฐาวลี", "นงลักษณ์", "ปัทมา", "สุภาพ", "ลัดดาวรรณ", "ปิยะมาศ", "สุชาดา",
    "อมรา", "ธัญญา", "พัชรี", "เพ็ญศรี", "จันทิรา", "เสาวลักษณ์", "สุนันทา", "นิภา", "สมทรง", "จำปา"
]

LAST_NAMES = [
    "วิไลรัตน์", "รุ่งเรืองสกุล", "แสนโพธิ์", "เกษตรพัฒน์", "ศรีสุวรรณ", "ทองใบ", "สันติสุข", "พลเอก", "วงศ์ชัย",
    "รักเกษตร", "ใจดี", "มั่นคง", "สุขสันต์", "เจริญรุ่ง", "ทองทับ", "พฤกษา", "วิริยะ", "ชัยมงคล", "สุขประเสริฐ",
    "พันธุ์ดี", "ไพศาล", "บำรุง", "รุ่งรัตน์", "ธรรมใจ", "สุทธิ", "ศรีทอง", "วิทยา", "พิทักษ์", "ประเสริฐ",
    "งามพรรณ", "ศิริโชค", "ดีมาก", "เพิ่มพูน", "รัตน์", "บุญมาก", "สมาน", "เข็มเพชร", "อินทร์", "คงมั่น",
    "สายใจ", "ชื่นชม", "เปรมประชา", "นิมิต", "ชูใจ", "วิถี", "ธรรมรัตน์", "สุวรรณ", "รอดพ้น", "บัวงาม"
]

PROVINCES = [
    "เชียงใหม่", "เชียงราย", "พะเยา", "ลำปาง", "ลำพูน",
    "แม่ฮ่องสอน", "น่าน", "อุตรดิตถ์", "ตาก", "สุโขทัย",
    "พิษณุโลก", "เพชรบูรณ์", "หนองคาย", "มหาสารคาม", "ขอนแก่น",
    "อุดรธานี", "นครพนม", "มุกดาหาร", "สกลนคร", "หนองบัวลำภู",
    "ศรีสะเกษ", "อุบลราชธานี", "ยโสธร", "ชัยภูมิ", "กาฬสินธุ์",
    "ร้อยเอ็ด", "สุราษฎร์ธานี", "นครศรีธรรมราช", "ภูเก็ต", "กระบี่",
    "ตรัง", "พัทลุง", "สงขลา", "สตูล", "ปัตตานี", "ยะลา", "นราธิวาส",
    "เพชรบุรี", "ประจวบคีรีขันธ์", "ชลบุรี", "ระยอง", "จันทบุรี", "ตราด",
    "นครราชสีมา", "บุรีรัมย์", "สุรินทร์", "ฉะเชิงเทรา", "ปราจีนบุรี", "สระแก้ว",
    "ลพบุรี", "สิงห์บุรี", "อ่างทอง", "ชัยนาท", "สระบุรี", "พระนครศรีอยุธยา", 
    "นนทบุรี", "ปทุมธานี", "กรุงเทพฯ", "นครปฐม", "สมุทรสาคร", "สมุทรสงคราม", "สมุทรปราการ"
]

EDUCATIONS = ["ประถม", "มัธยม", "ปวช.", "ปวส.", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก"]
OCCUPATIONS = [
    "เกษตรกรเต็มเวลา", "เกษตรกรช่วยครอบครัว", "ข้าราชการบำนาญ + เกษตรกร",
    "พนักงานบริษัท + เกษตรกร", "ธุรกิจส่วนตัว + เกษตรกร", "ลูกเกษตรกร",
    "เกษตรกร + ค้าขาย", "เกษตรกร + งานออนไลน์", "เกษตรกร + สอนหนักสือ"
]
FARM_SIZES = ["เล็ก (1-5 ไร่)", "กลาง (6-20 ไร่)", "ใหญ่ (21-50 ไร่)", "อุตสาหกรรม (50+ ไร่)"]
EXPERIENCE_LEVELS = ["มือใหม่", "ระดับกลาง", "มืออาชีพ", "ผู้เชี่ยวชาญ"]
COFFEE_VARIETIES = [["อาราบิก้า"], ["โรบัสต้า"], ["อาราบิก้า", "โรบัสต้า"]]
SMARTPHONE_OS = ["Android", "iOS"]
SMARTPHONE_LEVELS = ["ต่ำ", "กลาง", "สูง", "สูงมาก"]
INTERNET_CONNECTIONS = ["3G", "4G", "5G", "WiFi"]
DAILY_HOURS = list(range(1, 8))
PREFERRED_LANGUAGES = ["ไทย", "อังกฤษ", "ไทย+อังกฤษ"]
ACCESSIBILITY_OPTIONS = [
    [], 
    ["ต้องการตัวอักษรใหญ่"], 
    ["ต้องการตัวอักษรใหญ่มาก"], 
    ["ปุ่มใหญ่"],
    ["คอนทราสต์สูง"],
    ["ต้องการตัวอักษรใหญ่", "ปุ่มใหญ่"]
]

# Pain points pools
PAIN_POINT_POOLS = [
    ["การจดบันทึกผลผลิตที่ยุ่งยาก", "การคำนวณต้นทุน"],
    ["เวลาว่างน้อย", "ต้องดูแลหลายอย่างพร้อมกัน"],
    ["ใช้ smartphone ยาก", "หน้าจอเล็กมองไม่ชัด"],
    ["ต้องการทุกอย่างอัตโนมัติ", "ไม่มีเวลานั่งพิมพ์เยอะ"],
    ["ต้องการความเรียบง่าย", "ไม่ชอบฟีเจอร์ซับซ้อน"],
    ["อ่านหน้าจอยาก", "กลัวกดปุ่มผิด"],
    ["มีสวนเยอะ", "ยากที่จะจำทุกอย่าง"],
    ["ต้องบริหารเงินและสวนพร้อมกัน", "ไม่รู้กำไรขาดทุน"],
    ["ไม่มีเวลาดูแลสวนเต็มเวลา", "ข้อมูลกระจัดกระจาย"],
    ["ต้องพึ่งพาลูกหลานช่วย", "ไม่มั่นใจในข้อมูล"],
    ["พื้นที่ไม่มีสัญญาณ", "อัปเดตข้อมูลไม่ได้ตลอด"],
    ["กลัวข้อมูลหาย", "ต้องการ backup"],
    ["ต้องการแชร์ข้อมูลให้คนอื่นง่าย", "ทำรายงานให้สมาชิกสหกรณ์"]
]

# Goals pools
GOALS_POOLS = [
    ["เพิ่มประสิทธิภาพการผลิต", "ลดต้นทุน"],
    ["หารายได้เสริม", "ขยายสวน"],
    ["เก็บข้อมูลง่ายขึ้น", "ส่งต่อให้ลูกหลาน"],
    ["ระบบอัตโนมัติทั้งหมด", "ดูแลสวนจากที่ไหนก็ได้"],
    ["บันทึกข้อมูลสะดวก", "ดูสถิติง่าย"],
    ["บริหารเวลาได้ดีขึ้น", "รู้สถานการณ์สวนตลอด"],
    ["รวมข้อมูลทุกสวนในที่เดียว", "วางแผนได้ดีขึ้น"],
    ["รู้กำไรขาดทุนแบบเรียลไทม์", "วิเคราะห์ได้ลึกขึ้น"],
    ["ลดการพึ่งพาคนอื่น", "ทำงานได้ด้วยตัวเอง"],
    ["ส่งออกรายงานสวยๆ", "แชร์ให้คนอื่นง่าย"]
]

# Testing approaches
TESTING_APPROACHES = [
    "ทดสอบการใช้งานจริงในสวน",
    "ทดสอบความเร็วและการทำงานพร้อมกันหลายอย่าง",
    "ทดสอบกับผู้สูงอายุ",
    "ทดสอบ automation และ sync ข้อมูล",
    "ทดสอบความเรียบง่ายของ UI",
    "ทดสอบกับผู้ใช้หลายวัย",
    "ทดสอบ accessibility สำหรับผู้สูงอายุ",
    "ทดสอบ push notifications และ dashboard",
    "ทดสอบการจัดการหลายสวน",
    "ทดสอบรายงานการเงิน",
    "ทดสอบ offline mode",
    "ทดสอบ export และ import ข้อมูล",
    "ทดสอบ dark mode",
    "ทดสอบ multi-language"
]

# Feedback styles
FEEDBACK_STYLES = [
    "ตรงไปตรงมา",
    "ละเอียดและเป็นระบบ",
    "ช้าแต่ชัดเจน",
    "เร็วและตรงประเด็น",
    "เน้นความสะดวก",
    "ให้ความสำคัญกับ UX",
    "ถ้อยคำง่ายๆ",
    "เน้นประสิทธิภาพ",
    "เน้นความเป็นระเบียบ",
    "เน้นตัวเลขและรายได้"
]

def generate_persona(persona_id):
    """Generate a unique persona with deterministic randomness based on ID"""
    random.seed(persona_id * 17 + 42)  # Seed for reproducibility
    
    gender = random.choice(["ชาย", "หญิง"])
    
    if gender == "ชาย":
        first_name = random.choice(FIRST_NAMES_MALE)
        prefix = "นาย"
    else:
        first_name = random.choice(FIRST_NAMES_FEMALE)
        prefix = random.choice(["นาง", "นางสาว"])
    
    last_name = random.choice(LAST_NAMES)
    
    # Age distribution weighted towards working age
    age_weights = [10, 20, 25, 20, 15, 7, 3]  # Corresponding to age ranges
    age_ranges = [(18,25), (26,35), (36,45), (46,55), (56,65), (66,75), (76,80)]
    age_range = random.choices(age_ranges, weights=age_weights)[0]
    age = random.randint(age_range[0], age_range[1])
    
    # Tech confidence inversely correlated with age
    base_tech = max(20, 100 - (age - 18) * 1.5)
    tech_confidence = min(100, int(base_tech + random.randint(-10, 15)))
    
    # Patience positively correlated with age
    base_patience = 40 + (age - 18) * 0.8
    patience_level = min(100, int(base_patience + random.randint(-10, 10)))
    
    # Generate behavior patterns
    button_prefs = ["เล็ก", "ปกติ", "ใหญ่", "ใหญ่มาก"]
    button_pref = button_prefs[min(3, max(0, 3 - (100 - tech_confidence) // 30))]
    
    reading_speeds = ["ช้า", "ปานกลาง", "เร็ว", "เร็วมาก"]
    reading_speed = reading_speeds[min(3, max(0, tech_confidence // 30 - 1))]
    
    notification_prefs = ["รายวัน", "ทันที"]
    notification_pref = notification_prefs[0] if patience_level > 70 else notification_prefs[1]
    
    return {
        "id": f"P{persona_id:03d}",
        "name": f"{prefix}{first_name} {last_name}",
        "age": age,
        "gender": gender,
        "province": random.choice(PROVINCES),
        "education": random.choice(EDUCATIONS),
        "occupation": random.choice(OCCUPATIONS),
        "farm_size": random.choice(FARM_SIZES),
        "experience": random.choice(EXPERIENCE_LEVELS),
        "coffee_variety": random.choice(COFFEE_VARIETIES),
        "smartphone_os": random.choice(SMARTPHONE_OS),
        "smartphone_level": random.choice(SMARTPHONE_LEVELS),
        "internet_connection": random.choice(INTERNET_CONNECTIONS),
        "daily_usage_hours": random.choice(DAILY_HOURS),
        "preferred_language": random.choice(PREFERRED_LANGUAGES),
        "accessibility_needs": random.choice(ACCESSIBILITY_OPTIONS),
        "behavior_patterns": {
            "tech_confidence": tech_confidence,
            "patience_level": patience_level,
            "reading_speed": reading_speed,
            "button_size_preference": button_pref,
            "notification_preference": notification_pref,
            "color_blind_friendly": random.choice([True, False]),
            "screen_size_preference": random.choice(["เล็ก", "ใหญ่", "ใหญ่มาก"]),
            "font_preference": random.choice(["sans-serif", "serif", "ไม่มีความชอบ"])
        },
        "pain_points": random.choice(PAIN_POINT_POOLS),
        "goals": random.choice(GOALS_POOLS),
        "testing_approach": random.choice(TESTING_APPROACHES),
        "feedback_style": random.choice(FEEDBACK_STYLES),
        "personality_traits": {
            "openness": random.randint(40, 100),
            "conscientiousness": random.randint(40, 100),
            "extraversion": random.randint(40, 100),
            "agreeableness": random.randint(40, 100),
            "neuroticism": random.randint(20, 80)
        },
        "device_info": {
            "device_type": random.choice(["สมาร์ทโฟน", "แท็บเล็ต", "ทั้งสองอย่าง"]),
            "device_age_years": random.randint(1, 5),
            "has_camera": random.choice([True, True, False]),
            "storage_available": random.choice(["น้อย", "ปานกลาง", "มาก"])
        },
        "usage_context": {
            "primary_location": random.choice(["ในสวน", "บ้าน", "เดินทาง", "หลายที่"]),
            "time_of_day": random.choice(["เช้า", "กลางวัน", "เย็น", "ดึก", "หลายช่วง"]),
            "session_duration_minutes": random.choice([5, 10, 15, 30, 60]),
            "multitasking": random.choice([True, False])
        }
    }

def generate_all_personas(count=300):
    """Generate all personas"""
    personas = []
    
    for i in range(1, count + 1):
        persona = generate_persona(i)
        personas.append(persona)
    
    return personas

def main():
    print("Generating 300 unique personas...")
    
    personas = generate_all_personas(300)
    
    # Create demographic distribution summary
    age_ranges = {"18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56-65": 0, "65+": 0}
    for p in personas:
        age = p["age"]
        if age <= 25: age_ranges["18-25"] += 1
        elif age <= 35: age_ranges["26-35"] += 1
        elif age <= 45: age_ranges["36-45"] += 1
        elif age <= 55: age_ranges["46-55"] += 1
        elif age <= 65: age_ranges["56-65"] += 1
        else: age_ranges["65+"] += 1
    
    output = {
        "version": "1.0",
        "total": 300,
        "generated_at": datetime.now().isoformat(),
        "generator": "persona_generator.py",
        "description": "300 unique personas for Coffee Farm App testing",
        "demographics_distribution": {
            "age_ranges": age_ranges,
            "provinces_count": len(set(p["province"] for p in personas)),
            "gender_distribution": {
                "male": sum(1 for p in personas if p["gender"] == "ชาย"),
                "female": sum(1 for p in personas if p["gender"] == "หญิง")
            }
        },
        "personas": personas
    }
    
    # Write to file
    with open("personas_300.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"Generated {len(personas)} personas")
    print(f"Output: personas_300.json")
    print(f"\nDemographics:")
    for range_name, count in age_ranges.items():
        print(f"  {range_name}: {count}")
    
    # Also create personas.ts for TypeScript usage
    with open("personas_300.ts", "w", encoding="utf-8") as f:
        f.write("// Auto-generated personas for testing\n")
        f.write("// Run: python3 generate_personas.py\n\n")
        f.write("export interface Persona {\n")
        f.write("  id: string;\n")
        f.write("  name: string;\n")
        f.write("  age: number;\n")
        f.write("  gender: string;\n")
        f.write("  province: string;\n")
        f.write("  education: string;\n")
        f.write("  occupation: string;\n")
        f.write("  farm_size: string;\n")
        f.write("  experience: string;\n")
        f.write("  coffee_variety: string[];\n")
        f.write("  smartphone_os: string;\n")
        f.write("  smartphone_level: string;\n")
        f.write("  internet_connection: string;\n")
        f.write("  daily_usage_hours: number;\n")
        f.write("  preferred_language: string;\n")
        f.write("  accessibility_needs: string[];\n")
        f.write("  behavior_patterns: {\n")
        f.write("    tech_confidence: number;\n")
        f.write("    patience_level: number;\n")
        f.write("    reading_speed: string;\n")
        f.write("    button_size_preference: string;\n")
        f.write("    notification_preference: string;\n")
        f.write("    color_blind_friendly: boolean;\n")
        f.write("    screen_size_preference: string;\n")
        f.write("    font_preference: string;\n")
        f.write("  };\n")
        f.write("  pain_points: string[];\n")
        f.write("  goals: string[];\n")
        f.write("  testing_approach: string;\n")
        f.write("  feedback_style: string;\n")
        f.write("}\n\n")
        f.write(f"export const PERSONAS: Persona[] = {json.dumps(personas, ensure_ascii=False, indent=2)} as const;\n")
    
    print("Also created: personas_300.ts (TypeScript)")
    print("\nDone!")

if __name__ == "__main__":
    main()
