# 📊 Persona Database

> 300 realistic personas for Coffee Farm App testing

## Files

| File | Size | Description |
|------|------|-------------|
| `generate_realistic_personas.py` | 61KB | **v2** - Advanced generator with correlated attributes |
| `personas_300_realistic.json` | 786KB | **RECOMMENDED** - Realistic personas (v2) |
| `personas_300_realistic.ts` | 644KB | TypeScript types for v2 |
| `generate_personas.py` | 20KB | v1 - Basic generator |
| `personas_300.json` | 654KB | Basic personas (v1) |
| `personas_300.ts` | 618KB | TypeScript types for v1 |
| `README.md` | - | This file |

## v2 - Realistic Personas (Recommended)

### What's Different in v2

| Feature | v1 (Basic) | v2 (Realistic) |
|---------|------------|----------------|
| Names | Random combination | 200+ realistic Thai names |
| Addresses | Province only | Full address (village, district, province) |
| Attributes | Independent | **Correlated** (age → tech, experience → farm size) |
| Coffee Varieties | Random | **Region-based** (Arabica = North, Robusta = Northeast) |
| Pain Points | Generic | **Type-based** (elderly, busy, new farmer) |
| Goals | Generic | **Context-aware** (experience, farm size, age) |
| Bio | None | **Auto-generated** personal summaries |
| Big Five Traits | Random | **Correlated** with demographics |

### Correlation Matrix

```
Age ↑ → Tech Confidence ↓, Farm Size ↑, Patience ↑
Experience ↑ → Farm Size ↑, Tech Confidence ↑
Urban Province → iOS ↑, Internet quality ↑
North Thailand → Arabica coffee ↑
Northeast Thailand → Robusta coffee ↑
```

## Quick Start

```bash
# Generate realistic personas (v2)
python3 generate_realistic_personas.py

# Or basic version (v1)
python3 generate_personas.py
```

## v2 Sample Output

```json
{
  "id": "P001",
  "name": "นายเกษม แสนโพธิ์",
  "age": 78,
  "gender": "ชาย",
  "province": "นครศรีธรรมราช",
  "district": "ลานสกา",
  "village": "บ้านกว่าง",
  "full_address": "บ้านกว่าง ต.ลานสกา อ.นครศรีธรรมราช",
  "education": "ประถม",
  "occupation": "เกษตรกร + ค้าขาย",
  "farm_size": "อุตสาหกรรม (50+ ไร่)",
  "experience": "ผู้เชี่ยวชาญ",
  "farming_years": 58,
  "coffee_variety": ["โรบัสต้า"],
  "smartphone_os": "Android",
  "smartphone_level": "ต่ำ",
  "behavior_patterns": {
    "tech_confidence": 17,
    "patience_level": 87,
    "button_size_preference": "ใหญ่",
    "color_blind_friendly": false
  },
  "accessibility_needs": ["คอนทราสต์สูง"],
  "pain_points": [],
  "goals": ["รู้กำไรขาดทุนแท้จริง", "ทำให้ครอบครัวช่วยได้ง่าย"],
  "bio": "เกษม มีประสบการณ์ผู้เชี่ยวชาญ ในการทำสวนกาแฟ 78 ปี ในนครศรีธรรมราช ปัจจุบันดูแลสวนอุตสาหกรรม",
  "personality_traits": {
    "big_five_label": ["รักษาที่เดิม", "มีระเบียบ", "ใจดี", "มั่นคงทางอารมณ์"]
  }
}
```

## Demographics v2

| Metric | Value |
|--------|-------|
| **Total** | 300 |
| **Average Age** | 45.2 years |
| **Age 36-55** | 46% (realistic working age) |
| **Male/Female** | 154/146 |
| **Provinces** | 60/77 |
| **Accessibility Needs** | 78 (26%) |
| **Avg Tech Confidence** | 70% |
| **Arabica (North)** | Regional distribution |
| **Robusta (Northeast)** | Regional distribution |

## Testing Segments

### Accessibility Testing
```python
# 78 personas with accessibility needs
accessibility_personas = [p for p in personas if p['accessibility_needs']]

# Elderly (55+)
elderly = [p for p in personas if p['age'] >= 55]
```

### Tech Level Testing
```python
# By tech level
low_tech = [p for p in personas if p['smartphone_level'] == 'ต่ำ']
high_tech = [p for p in personas if p['smartphone_level'] == 'สูงมาก']

# By device
android_users = [p for p in personas if p['smartphone_os'] == 'Android']
ios_users = [p for p in personas if p['smartphone_os'] == 'iOS']
```

### Regional Testing
```python
# By region
north = ['เชียงใหม่', 'เชียงราย', 'ลำปาง', 'ลำพูน', 'แม่ฮ่องสอน', 'น่าน']
northeast = ['ขอนแก่น', 'อุดรธานี', 'มหาสารคาม', 'ร้อยเอ็ด']

arabica_farmers = [p for p in personas if 'อาราบิก้า' in p['coffee_variety']]
robusta_farmers = [p for p in personas if 'โรบัสต้า' in p['coffee_variety']]
```

### Use Case Testing
```python
# By occupation
full_time = [p for p in personas if 'เต็มเวลา' in p['occupation']]
part_time = [p for p in personas if '+' in p['occupation']]
retiree = [p for p in personas if 'บำนาญ' in p['occupation']]

# By farm size
small_farm = [p for p in personas if '1-5' in p['farm_size']]
large_farm = [p for p in personas if '50+' in p['farm_size']]
```

## TypeScript Usage

```typescript
import { PERSONAS } from './personas_300_realistic';

// Get persona by ID
const p001 = PERSONAS.find(p => p.id === 'P001');

// Filter by segment
const elderly = PERSONAS.filter(p => p.age >= 60);
const lowTech = PERSONAS.filter(p => p.smartphone_level === 'ต่ำ');
const arabicaFarmers = PERSONAS.filter(p => p.coffee_variety.includes('อาราบิก้า'));

// Find by name
const somchai = PERSONAS.find(p => p.name.includes('สมชาย'));
```

## Regenerate

```bash
# Regenerate with same seed (reproducible)
python3 generate_realistic_personas.py

# Or modify the seed in the script for different personas
# Line: random.seed(persona_id * 12345 + 67890)
```

## Quality Assurance

- 300 unique personas
- No duplicate names
- Age-experience correlation
- Region-coffee variety correlation
- Accessibility needs for elderly
- Full Thai addresses
- Realistic tech distribution
- Bio summaries for each persona

---

Generated: 2026-03-20
Generator: generate_realistic_personas.py v2.0
