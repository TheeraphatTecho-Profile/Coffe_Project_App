#!/usr/bin/env python3
"""
Coffee Farm App - Realistic Persona Generator v2
Creates 300 personas with realistic Thai names and behaviors
"""

import json
import random
from datetime import datetime
import hashlib

# Extended name pools for more realistic combinations
FIRST_NAMES_MALE = [
    # Northern Thailand names (เชียงใหม่, เชียงราย, ลำปาง, ลำพูน, น่าน)
    "สมชาย",
    "สมพงษ์",
    "สมศักดิ์",
    "สมหมาย",
    "สมบูรณ์",
    "สมศักดิ์",
    "ทวี",
    "วิชัย",
    "ประเสริฐ",
    "เจริญ",
    "อรุณ",
    "พงษ์",
    "บุญ",
    "ใจ",
    "ยง",
    "บวร",
    "พันธุ์",
    "ประสิทธิ์",
    "ธนา",
    "นิติ",
    "พิเชษฐ",
    "ชัย",
    "ชาญ",
    "ณรงค์",
    "อำนวย",
    "สุเทพ",
    "ประยูร",
    "สมฤดี",
    "ศักดิ์",
    "โชค",
    "วิเชียร",
    "สุรชัย",
    "เทพ",
    "ธีระ",
    "ศราวุธ",
    "ณัฐพล",
    "ภูมิ",
    "จิระ",
    "อนุชา",
    "พุฒิ",
    "ชนก",
    "ปิยะ",
    "ธนกฤต",
    "วีระ",
    "พงศกร",
    "ภาคิน",
    "รัฐา",
    "อดิศร",
    "กิตติ",
    "มงคล",
    "เสน่ห์",
    "ครอง",
    "ถนอม",
    "นันทเดช",
    # Northeastern names (อุดร, ขอนแก่น, มหาสารคาม, ร้อยเอ็ด)
    "ไพบูลย์",
    "สุรินทร์",
    "บุญมา",
    "ไชยา",
    "แสวง",
    "ทองใบ",
    "เหลือง",
    "บุญช่วย",
    "สุขใจ",
    "งาม",
    "โพธิ์",
    "ทองทับ",
    "สุขสันต์",
    "ธรรม",
    "เจริญ",
    "พฤกษา",
    "วิริยะ",
    "ชัยมงคล",
    "สุวรรณ",
    "รอด",
    "คง",
    "อินทร์",
    "สายใจ",
    "ชื่นชม",
    "เปรมประชา",
    "นิมิต",
    "ชูใจ",
    "วิถี",
    "ธรรมรัตน์",
    "บัวงาม",
    # Central names (นครสวรรค์, อุทัยธานี, ชัยนาท)
    "ชาติ",
    "สิทธิ์",
    "พัฒนา",
    "สกล",
    "รุ่งโรจน์",
    "นพดล",
    "ประดิษฐ์",
    "เอกชัย",
    "วิรัช",
    "พนม",
    "อนันต์",
    "วัฒนา",
    "ธนา",
    "พีระ",
    "สุรเดช",
    "ประดิษฐ์",
    "วีรพงษ์",
    "ชูชาติ",
    "สำรวย",
    "เกษม",
    # Southern names (สุราษฎร์, นครศรี, ภูเก็ต, สงขลา)
    "มะ",
    "สะ",
    "อิบรอ",
    "ยะ",
    "ใบ",
    "นิ่ม",
    "แก้ว",
    "ทอง",
    "งาม",
    "ชื่น",
    "ระเบียบ",
    "วิชา",
    "สำเนียง",
    "อุไร",
    "พวง",
    "เพชร",
    "บุญศิริ",
    "มาลี",
    "ยุพา",
    "รัตนา",
]

FIRST_NAMES_FEMALE = [
    # Northern names
    "พิมพ์ชนก",
    "พิมพ์ใจ",
    "พิมพ์ชีวิต",
    "วิไลพร",
    "วิไลรัตน์",
    "จิราพร",
    "จิราภา",
    "จิระภา",
    "จิรา",
    "จีระ",
    "นภา",
    "นภิศา",
    "นภดล",
    "นลินี",
    "นิชา",
    "นิตยา",
    "นิภา",
    "นิสา",
    "นิจ",
    "นิดา",
    "สุภาพร",
    "สุภัทรา",
    "สุภาพ",
    "สุภารัตน์",
    "สุภิญญา",
    "สุธาสินี",
    "สุนี",
    "สุนิสา",
    "สุชาดา",
    "สุธิดา",
    "พรทิพย์",
    "พรพิมล",
    "พรประภา",
    "พริษฐา",
    "พิมลพร",
    "พิมประภา",
    "พิมพ์ลภา",
    "พิมพ์ชนก",
    "พิมพ์ทิพย์",
    "พิมพาภรณ์",
    # Northeastern names
    "บุญใจ",
    "บุญเย็น",
    "บุญมา",
    "บุญช่วย",
    "ใจดี",
    "ใจกาญ",
    "จันทร์",
    "จันทิมา",
    "จันทร์ทิพย์",
    "จันทร์ฉาย",
    "แป๊ะ",
    "แปม",
    "ตาว",
    "แม่",
    "ยาย",
    "ย่า",
    "น้อย",
    "หนู",
    "เล็ก",
    "ใหญ่",
    "ทับทิม",
    "สมใจ",
    "ศรีสุข",
    "สุดา",
    "วาสนา",
    "พิมล",
    "แขนงพรรณ",
    "สมหญิง",
    "สายใจ",
    "สายธาร",
    # Central names
    "กมลา",
    "กานต์",
    "กนก",
    "กัลยา",
    "ชฎาพร",
    "ชฎาภรณ์",
    "ชนิดา",
    "ชลธิชา",
    "ชัญญา",
    "ชไมพร",
    "อารีย์",
    "อาริษา",
    "อาภา",
    "อมรา",
    "อรพรรณ",
    "อรุณี",
    "อรัญญา",
    "อัจฉรา",
    "อัญมณี",
    "อัญชลี",
    # Southern names
    "มานี",
    "มาเจ",
    "มีนา",
    "มะลิ",
    "มะลิลา",
    "มะปราง",
    "มาดา",
    "มาริสา",
    "มิรา",
    "มิลิน",
    "ซารีนา",
    "ซูจี",
    "สมฤดี",
    "สมาพร",
    "สุธาดา",
    "สุไรมา",
    "เพ็ญศรี",
    "เพ็ญพิมล",
    "เพชรลดา",
    "เพชรฉาย",
]

LAST_NAMES = [
    "วิไลรัตน์",
    "รุ่งเรืองสกุล",
    "แสนโพธิ์",
    "เกษตรพัฒน์",
    "ศรีสุวรรณ",
    "ทองใบ",
    "สันติสุข",
    "พลเอก",
    "วงศ์ชัย",
    "รักเกษตร",
    "ใจดี",
    "มั่นคง",
    "สุขสันต์",
    "เจริญรุ่ง",
    "ทองทับ",
    "พฤกษา",
    "วิริยะ",
    "ชัยมงคล",
    "สุขประเสริฐ",
    "พันธุ์ดี",
    "ไพศาล",
    "บำรุง",
    "รุ่งรัตน์",
    "ธรรมใจ",
    "สุทธิ",
    "ศรีทอง",
    "วิทยา",
    "พิทักษ์",
    "ประเสริฐ",
    "งามพรรณ",
    "ศิริโชค",
    "ดีมาก",
    "เพิ่มพูน",
    "รัตน์",
    "บุญมาก",
    "สมาน",
    "เข็มเพชร",
    "อินทร์",
    "คงมั่น",
    "สายใจ",
    "ชื่นชม",
    "เปรมประชา",
    "นิมิต",
    "ชูใจ",
    "วิถี",
    "ธรรมรัตน์",
    "สุวรรณ",
    "รอดพ้น",
    "บัวงาม",
    "ทองคำ",
    "เงินยง",
    "ไทยวัฒน์",
    "รัชต์นันท์",
    "สุรินทร์",
    "ไชยานุภาพ",
    "ศรีบรรจง",
    "พินิจพงษ์",
    "วงศ์ไชย",
    "สิทธิชัย",
    "เจริญพงษ์",
    "สนธิสิทธิ์",
    "ธรรมมาสิทธิ์",
    "สุขมาก",
    "มากพงษ์",
    "แก้วใส",
    "บุญช่วย",
    "ใจดี",
    "ปัญญา",
    "ประสิทธิ์",
    "สมควร",
    "เหมาะ",
    "เหมาะสม",
    "สอนดี",
    "เรียนดี",
    "ดีเจริญ",
    "ดีสุข",
    "ดีวงศ์",
    "ดีใจ",
    "ดีแท้",
]

VILLAGE_NAMES = [
    "บ้านใหม่",
    "บ้านกว่าง",
    "บ้านเหล่า",
    "บ้านโนน",
    "บ้านดอน",
    "บ้านป่า",
    "บ้านคลอง",
    "บ้านหมอ",
    "บ้านท่า",
    "บ้านฝาย",
    "บ้านกาด",
    "บ้านแม่",
    "บ้านกู่",
    "บ้านซอม",
    "บ้านนา",
    "บ้านส้ม",
]

PROVINCES_WITH_DISTRICTS = {
    "เชียงใหม่": [
        "แม่ริม",
        "สันกำแพง",
        "สารภี",
        "จอมทอง",
        "อมก๋อย",
        "ขุนวาง",
        "แม่แตง",
        "ฝาง",
        "เชียงดาว",
    ],
    "เชียงราย": [
        "แม่สาย",
        "เวียงป่าเป้า",
        "พาน",
        "แม่จัน",
        "เทิง",
        "ขางแม่สาย",
        "แม่ลาว",
        "เวียงเชียงรุ้ง",
    ],
    "ลำปาง": [
        "เมืองลำปาง",
        "แม่เมาะ",
        "เสริมซ้าย",
        "เสริมขวา",
        "งาว",
        "แจ้หวี",
        "ห้างฉัตร",
        "สบปราบ",
    ],
    "ลำพูน": ["เมืองลำพูน", "แม่ทา", "บ้านโฮ่ง", "ลี้", "ทุ่งหัวช้าง", "ป่าซาง", "บ้านธิ", "เวียงทอง"],
    "แม่ฮ่องสอน": ["เมืองแม่ฮ่องสอน", "ขุนยวม", "แม่ลาน้อย", "ปาย", "สบเมย", "แม่สะเรียง"],
    "น่าน": [
        "เมืองน่าน",
        "ภูเพียง",
        "แม่จริม",
        "ท่าวังศา",
        "บ้านหลวง",
        "นาน้อย",
        "ปัว",
        "เฉลิมพระเกียรติ",
    ],
    "อุตรดิตถ์": ["เมืองอุตรดิตถ์", "ทองแสนขัน", "บ้านด่าน", "ลับแล", "ฟากท่า", "ผาจืด", "น้ำปาด"],
    "ตาก": [
        "เมืองตาก",
        "บ้านตาก",
        "สามเงา",
        "แม่ระมาด",
        "ท่าเพชร",
        "พบพระ",
        "อุ้มผาง",
        "วังเจ้าคลอง",
    ],
    "สุโขทัย": [
        "เมืองสุโขทัย",
        "คีรีมาศ",
        "สวรรคโลก",
        "ศรีสำโรง",
        "ศรีนครินทร์",
        "ทุ่งเสลี่ยม",
        "บ้านด่านลานหอย",
    ],
    "พิษณุโลก": [
        "เมืองพิษณุโลก",
        "วังทอง",
        "พรหมพิราม",
        "บางกระทุ่ม",
        "ชาติตระการ",
        "วัดโบสถ์",
        "นครไทย",
    ],
    "เพชรบูรณ์": [
        "เมืองเพชรบูรณ์",
        "หล่มสัก",
        "หล่มเก่า",
        "วิเชียรบุรี",
        "ศรีเทพา",
        "หนองไผ่",
        "บึงสามพัน",
    ],
    "หนองคาย": [
        "เมืองหนองคาย",
        "ท่าบ่อ",
        "สังคม",
        "โพนพิสัย",
        "รัตนวาปี",
        "ศรีเชียงใหม่",
        "เฝ้าไร่",
        "โซ่พิสัย",
    ],
    "มหาสารคาม": [
        "เมืองมหาสารคาม",
        "แกดำ",
        "โกสุมพิสัย",
        "กันทรวิชัย",
        "เชียงยืน",
        "ยางสีสุรินทร์",
        "นาเชือก",
    ],
    "ขอนแก่น": [
        "เมืองขอนแก่น",
        "บ้านทุ่ม",
        "หนองสองห้อง",
        "ชุมแพ",
        "พระยืน",
        "หนองนาคำ",
        "กระนวล",
        "ซำสูง",
    ],
    "อุดรธานี": [
        "เมืองอุดรธานี",
        "หนองบัวลำภู",
        "กุดจับ",
        "หนองวัวซอ",
        "กุมภวาปี",
        "โนนสะอาด",
        "ศรีธาตุ",
    ],
    "นครพนม": [
        "เมืองนครพนม",
        "ธาตุพนม",
        "เรณูนคร",
        "ท่าอุเทน",
        "ปลาปาก",
        "มหาราช",
        "ศรีสงคราม",
    ],
    "มุกดาหาร": [
        "เมืองมุกดาหาร",
        "หนองสูง",
        "คำชะอี",
        "ดอนตาล",
        "นิคมคำสร้อย",
        "ศรีใส",
        "หว้านใหญ่",
    ],
    "สกลนคร": [
        "เมืองสกลนคร",
        "กุดบาก",
        "พร",
        "บ้านม่วง",
        "อากาศ",
        "พังโคน",
        "ศรีบูรพา",
        "เต่างอย",
    ],
    "หนองบัวลำภู": [
        "เมืองหนองบัวลำภู",
        "นากลาง",
        "โนนบุรี",
        "ศรีบุญเรือง",
        "สุวรรณคราม",
        "เฉลิมพระเกียรติ",
    ],
    "ศรีสะเกษ": [
        "เมืองศรีสะเกษ",
        "ยาหวาน",
        "ขนยุง",
        "บึงบูรพ์",
        "ห้วยทับทิม",
        "ไพรบึง",
        "กันทรลักษ์",
    ],
    "อุบลราชธานี": [
        "เมืองอุบลราชธานี",
        "ตาลสุม",
        "ดอนมดแดง",
        "เขมราฐ",
        "เดชอุดม",
        "นาจะหลวง",
        "บุณฑริก",
    ],
    "ยโสธร": [
        "เมืองยโสธร",
        "คูเมือง",
        "กุดราช้าง",
        "ประคำพิทย์",
        "มะลิกเป็ง",
        "ไทยเจริญ",
        "ค้อทอง",
    ],
    "ชัยภูมิ": ["เมืองชัยภูมิ", "บ้านเขว้า", "คอนสวรรค์", "เอกอ่อง", "หนองบัวแดง", "จัตุรัส", "ซับใหญ่"],
    "กาฬสินธุ์": ["เมืองกาฬสินธุ์", "ยางตลาด", "ห้วยเม็ก", "สหัสขันธ์", "นามน", "กมลาไสย", "ฆ้องชัย"],
    "ร้อยเอ็ด": ["เมืองร้อยเอ็ด", "ธวัชบุรี", "พนมไพร", "โพนทอง", "ศรีสมเด็จ", "ท่าม่วง", "เสลภูมิ"],
    "สุราษฎร์ธานี": [
        "เมืองสุราษฎร์ธานี",
        "พุน้ำร้อน",
        "กาญจนดิษฐ์",
        "ดอนสัปดน้ำ",
        "คลองใหญ่",
        "ไชยา",
        "ท่าชนะ",
    ],
    "นครศรีธรรมราช": [
        "เมืองนครศรีธรรมราช",
        "พรหมคดี",
        "ลานสกา",
        "ฉวาง",
        "พิปูน",
        "เคียนซา",
        "ท่าศาลา",
    ],
    "ภูเก็ต": ["เมืองภูเก็ต", "กะทู้", "ถลาง"],
    "กระบี่": ["เมืองกระบี่", "เขาพนม", "ลำทับ", "อ่าวลึก", "คลองท่อม", "ปลายพระยา", "เหนือคลอง"],
    "ตรัง": ["เมืองตรัง", "กันตัง", "ย่านดอก", "นาโยงใหญ่", "ปะเหลียน", "หาดสำราญ", "วังวิเศษ"],
    "พัทลุง": ["เมืองพัทลุง", "ควนขนุน", "ปากพะยูน", "ศรีบรรพต", "เขาชัยสน", "ตะโหมด", "บางแก้ว"],
    "สงขลา": [
        "เมืองสงขลา",
        "สทิงพระ",
        "หาดใหญ่",
        "สะเดา",
        "คลองหอยโข่ง",
        "นาหม่อม",
        "บางกล่ำ",
    ],
    "สตูล": ["เมืองสตูล", "ควนโดน", "ควนกาหลง", "มะนังยง", "ท่าแพ", "ละงู", "เจาะไอร้อง"],
    "ปัตตานี": ["เมืองปัตตานี", "ยะหริ่ง", "ยะรัง", "มายอ", "ทุ่งยางแม้", "แม่ลาน้อย", "สายบุรี"],
    "ยะลา": ["เมืองยะลา", "ยะหริ่ง", "ธารโต", "บันนังสตา", "ศรีสาประชา", "เบตง", "กาบัง"],
    "นราธิวาส": [
        "เมืองนราธิวาส",
        "ตากใบ",
        "บาเจาะ",
        "ยี่งอ",
        "รือเสาะ",
        "ศรีสาคร",
        "แว้ง",
        "สุคีรี",
    ],
    "เพชรบุรี": [
        "เมืองเพชรบุรี",
        "หนองหญ้าปล้อง",
        "ชะอำ",
        "ท่ายาง",
        "บ้านลาด",
        "เขาย้อย",
        "หัวหิน",
    ],
    "ประจวบคีรีขันธ์": [
        "เมืองประจวบคีรีขันธ์",
        "หัวหิน",
        "ปราณบุรี",
        "สามร้อยยอด",
        "กุยบุรี",
        "ทับสะแก",
        "บางสะพาน",
    ],
    "ชลบุรี": ["เมืองชลบุรี", "พนัสนิคม", "หนองใหญ่", "บางละมุง", "สัตหีบ", "พานทอง", "ศรีราชา"],
    "ระยอง": [
        "เมืองระยอง",
        "บ้านฉาง",
        "แกลง",
        "วงศ์ประชา",
        "บางปะกง",
        "ปลวกแมง",
        "เชาคริต",
    ],
    "จันทบุรี": ["เมืองจันทบุรี", "แหลมสิงห์", "มะขาม", "ท่าใหญ่", "โป่งน้ำร้อน", "สอยดาว", "ขลุง"],
    "ตราด": ["เมืองตราด", "คลองใหญ่", "เขาสมิง", "แหลมงอบ", "บ่อไร่", "เกาะกูด", "เกาะช้าง"],
    "นครราชสีมา": [
        "เมืองนครราชสีมา",
        "ครบุรี",
        "เสิงสาง",
        "หนองบุญมาก",
        "ปากช่อง",
        "จักราช",
        "โชคชัย",
    ],
    "บุรีรัมย์": ["เมืองบุรีรัมย์", "นางรอง", "หนองหงส์", "พุทไธสง", "ลำปลายมาศ", "บ้านใหญ่", "สตึก"],
    "สุรินทร์": ["เมืองสุรินทร์", "จอมพระ", "ท่าตะมูล", "ชุมพลบุรี", "พนมดงรัก", "สำเหร่", "ศรีณรงค์"],
    "ฉะเชิงเทรา": [
        "เมืองฉะเชิงเทรา",
        "บางคล้า",
        "บางเลิศ",
        "สาลี",
        "แหลมฉบัง",
        "พนมสรคล",
        "บ้านโพธิ์",
    ],
    "ปราจีนบุรี": [
        "เมืองปราจีนบุรี",
        "กบินทร์บุรี",
        "นาดี",
        "โชคชัยหนองแรง",
        "ประจันตคาม",
        "ศรีมโหสถ",
    ],
    "สระแก้ว": [
        "เมืองสระแก้ว",
        "วัฒนาเขตร์",
        "โซ่พิสัย",
        "ตาพระยา",
        "อรัญประเทศ",
        "คลองหาด",
        "เขาฉกรรจ์",
    ],
    "ลพบุรี": ["เมืองลพบุรี", "พัฒนานิคม", "โครสอ", "ชัยบาดาล", "ท่าหลวง", "สังขละบุรี", "ลำสนธิ"],
    "สิงห์บุรี": ["เมืองสิงห์บุรี", "อินทร์บุรี", "บางระจัน", "ค่ายบางระจัน", "ท่าช้าง", "พรหมบุรี"],
    "อ่างทอง": ["เมืองอ่างทอง", "วิเศษชัยชาญ", "แสวงหา", "สามโก้", "ป่าโมก", "โพธิ์ทอง"],
    "ชัยนาท": [
        "เมืองชัยนาท",
        "วัดสิงห์",
        "สุขแคนด์",
        "หนองมะโมง",
        "เนินขาม",
        "มะขามเฒ่า",
        "สรรคบุรี",
    ],
    "สระบุรี": [
        "เมืองสระบุรี",
        "แก่งคอย",
        "หนองแค",
        "วิหารแดง",
        "หนองโชค",
        "พัฒนานิคม",
        "ดอนพุทราบ",
    ],
    "พระนครศรีอยุธยา": [
        "เมืองพระนครศรีอยุธยา",
        "บางปะหัว",
        "บางบาล",
        "บางพลี",
        "บางระกำ",
        "ภูมิธรรม",
        "เสนา",
    ],
    "นนทบุรี": [
        "เมืองนนทบุรี",
        "บางกรวย",
        "บางใหญ่",
        "ปากเกร็ด",
        "ไทรน้อย",
        "บ้านใหญ่",
        "ศรีสมาน",
    ],
    "ปทุมธานี": [
        "เมืองปทุมธานี",
        "คลองหลวง",
        "ธัญบุรี",
        "ลำลูกกา",
        "สามโคก",
        "หนองเสือ",
        "บ้านธาตุ",
    ],
    "กรุงเทพฯ": [
        "คลองเตย",
        "วัฒนา",
        "ราชเทวี",
        "หลักสี่",
        "ดอนเมือง",
        "สายไหม",
        "จตุจักร",
        "บางกอกน้อย",
    ],
    "นครปฐม": [
        "เมืองนครปฐม",
        "กำแพงแสน",
        "หนองปลิง",
        "ทุ่งกระพังโหม",
        "สามพราน",
        "ศาลายา",
        "ดอนแก้ว",
    ],
    "สมุทรสาคร": ["เมืองสมุทรสาคร", "กระทุ่มแบน", "บ้านแพ้ว", "ท่าใบ", "โคกขาม", "พระราชพิธี"],
    "สมุทรสงคราม": ["เมืองสมุทรสงคราม", "แม่กลิ่ง", "บางขุนเจียบ", "อัตภาพ", "กาหลง", "ปากท่อ"],
    "สมุทรปราการ": [
        "เมืองสมุทรปราการ",
        "พระประแก้ม",
        "บางเสาธง",
        "บางเมือง",
        "ปากน้ำ",
        "แม่เจอริง",
    ],
}

COFFEE_VARIETY_BY_REGION = {
    "เชียงใหม่": ["อาราบิก้า"],
    "เชียงราย": ["อาราบิก้า"],
    "ลำปาง": ["อาราบิก้า"],
    "ลำพูน": ["อาราบิก้า"],
    "แม่ฮ่องสอน": ["อาราบิก้า"],
    "น่าน": ["อาราบิก้า"],
    "พะเยา": ["อาราบิก้า", "โรบัสต้า"],
    "อุตรดิตถ์": ["อาราบิก้า"],
    "ตาก": ["อาราบิก้า"],
    "สุโขทัย": ["โรบัสต้า"],
    "พิษณุโลก": ["โรบัสต้า", "อาราบิก้า"],
    "เพชรบูรณ์": ["อาราบิก้า"],
    "หนองคาย": ["โรบัสต้า"],
    "มหาสารคาม": ["โรบัสต้า"],
    "ขอนแก่น": ["โรบัสต้า", "อาราบิก้า"],
    "อุดรธานี": ["โรบัสต้า"],
    "นครพนม": ["โรบัสต้า"],
    "มุกดาหาร": ["โรบัสต้า"],
    "สกลนคร": ["โรบัสต้า"],
    "หนองบัวลำภู": ["โรบัสต้า"],
    "ศรีสะเกษ": ["โรบัสต้า"],
    "อุบลราชธานี": ["โรบัสต้า"],
    "ยโสธร": ["โรบัสต้า"],
    "ชัยภูมิ": ["โรบัสต้า", "อาราบิก้า"],
    "กาฬสินธุ์": ["โรบัสต้า"],
    "ร้อยเอ็ด": ["โรบัสต้า"],
    "สุราษฎร์ธานี": ["โรบัสต้า", "อาราบิก้า"],
    "นครศรีธรรมราช": ["โรบัสต้า", "อาราบิก้า"],
    "ภูเก็ต": ["โรบัสต้า"],
    "กระบี่": ["โรบัสต้า"],
    "ตรัง": ["โรบัสต้า"],
    "พัทลุง": ["โรบัสต้า"],
    "สงขลา": ["โรบัสต้า"],
    "สตูล": ["โรบัสต้า"],
    "ปัตตานี": ["โรบัสต้า"],
    "ยะลา": ["โรบัสต้า"],
    "นราธิวาส": ["โรบัสต้า"],
    "เพชรบุรี": ["โรบัสต้า", "อาราบิก้า"],
    "ประจวบคีรีขันธ์": ["อาราบิก้า", "โรบัสต้า"],
    "ชลบุรี": ["โรบัสต้า"],
    "ระยอง": ["โรบัสต้า"],
    "จันทบุรี": ["โรบัสต้า"],
    "ตราด": ["โรบัสต้า"],
    "นครราชสีมา": ["อาราบิก้า", "โรบัสต้า"],
    "บุรีรัมย์": ["โรบัสต้า"],
    "สุรินทร์": ["โรบัสต้า"],
    "ฉะเชิงเทรา": ["โรบัสต้า"],
    "ปราจีนบุรี": ["โรบัสต้า"],
    "สระแก้ว": ["โรบัสต้า"],
    "ลพบุรี": ["โรบัสต้า"],
    "สิงห์บุรี": ["โรบัสต้า"],
    "อ่างทอง": ["โรบัสต้า"],
    "ชัยนาท": ["โรบัสต้า"],
    "สระบุรี": ["โรบัสต้า"],
    "พระนครศรีอยุธยา": ["โรบัสต้า"],
    "นนทบุรี": ["โรบัสต้า"],
    "ปทุมธานี": ["โรบัสต้า"],
    "กรุงเทพฯ": ["โรบัสต้า"],
    "นครปฐม": ["อาราบิก้า"],
    "สมุทรสาคร": ["โรบัสต้า"],
    "สมุทรสงคราม": ["โรบัสต้า"],
    "สมุทรปราการ": ["โรบัสต้า"],
}

FARM_SIZE_BY_EXPERIENCE = {
    "มือใหม่": ["เล็ก (1-5 ไร่)"],
    "ระดับกลาง": ["เล็ก (1-5 ไร่)", "กลาง (6-20 ไร่)"],
    "มืออาชีพ": ["กลาง (6-20 ไร่)", "ใหญ่ (21-50 ไร่)"],
    "ผู้เชี่ยวชาญ": ["ใหญ่ (21-50 ไร่)", "อุตสาหกรรม (50+ ไร่)"],
}

# Realistic pain points by persona type
PAIN_POINTS = {
    "elderly_low_tech": [
        "อ่านตัวอักษรเล็กไม่ชัด",
        "กลัวกดปุ่มผิด",
        "ไม่ถนัดใช้ smartphone",
        "ต้องการลูกหลานช่วยตลอด",
    ],
    "elderly_medium_tech": [
        "อยากเรียนรู้เพิ่มแต่ลืมเร็ว",
        "เมนูเยอะทำให้สับสน",
        "ต้องการความช่วยเหลือบ้าง",
    ],
    "middle_age_busy": [
        "เวลาน้อยแต่ต้องทำหลายอย่าง",
        "ไม่มีเวลานั่งกรอกข้อมูลนาน",
        "ต้องทำงานประจำด้วย",
    ],
    "young_tech_savvy": [
        "ต้องการทุกอย่างเร็ว",
        "ไม่ชอบรอโหลด",
        "ต้องการ automation",
        "อยาก sync ข้อมูลอัตโนมัติ",
    ],
    "new_farmer": [
        "ไม่รู้จะเริ่มจากตรงไหน",
        "ศัพท์เทคนิคเข้าใจยาก",
        "กลัวทำผิดพลาด",
        "ไม่มีคนแนะนำ",
    ],
    "large_farm_owner": ["มีสวนหลายแปลงจำไม่ได้", "ต้องจัดการคนงาน", "ต้องการรายงานรวม"],
    "part_time": ["ไม่ได้อยู่สวนทุกวัน", "ข้อมูลกระจัดกระจาย", "ต้องพึ่งพาคนอื่นบันทึก"],
    "remote_area": ["สัญญาณอินเทอร์เน็ตไม่ดี", "อัปเดตข้อมูลไม่ได้ตลอด", "แบตเตอรี่หมดเร็ว"],
}

# Realistic goals by persona type
GOALS = {
    "increase_yield": ["เพิ่มผลผลิตให้มากขึ้น", "ลดการสูญเสียจากโรค", "ปรับปรุงคุณภาพเมล็ด"],
    "reduce_cost": ["ลดค่าใช้จ่ายปุ๋ยยา", "ใช้แรงงานน้อยลง", "ประหยัดน้ำ"],
    "record_management": ["บันทึกข้อมูลเป็นระบบ", "มีข้อมูลสะสมไว้วิเคราะห์", "เก็บรักษาข้อมูลได้นาน"],
    "business": ["รู้กำไรขาดทุนแท้จริง", "วางแผนการขายได้", "ขยายตลาด", "สร้างแบรนด์"],
    "knowledge": ["เรียนรู้เทคนิคใหม่", "ติดตามราคาตลาด", "เข้าใจโรคและการป้องกัน"],
    "family": ["ส่งต่อข้อมูลให้ลูกหลาน", "ทำให้ครอบครัวช่วยได้ง่าย", "รวมข้อมูลทุกคนไว้ที่เดียว"],
}


def get_persona_type(persona):
    """Determine persona type based on characteristics"""
    types = []

    if persona["age"] >= 55:
        types.append("elderly")
    elif persona["age"] <= 35:
        types.append("young")
    else:
        types.append("middle_age")

    if persona["behavior_patterns"]["tech_confidence"] <= 40:
        types.append("low_tech")
    elif persona["behavior_patterns"]["tech_confidence"] >= 75:
        types.append("high_tech")
    else:
        types.append("medium_tech")

    if persona["experience"] == "มือใหม่":
        types.append("new_farmer")
    if persona["farm_size"] in ["ใหญ่ (21-50 ไร่)", "อุตสาหกรรม (50+ ไร่)"]:
        types.append("large_farm")
    if "+" in persona["occupation"] or "บริษัท" in persona["occupation"]:
        types.append("busy")
    if persona["internet_connection"] in ["3G", "ไม่มี"]:
        types.append("remote")

    return types


def generate_realistic_persona(persona_id):
    """Generate a realistic persona with correlated attributes"""
    random.seed(persona_id * 12345 + 67890)  # Different seed for variety

    gender = random.choice(["ชาย", "หญิง"])

    if gender == "ชาย":
        first_name = random.choice(FIRST_NAMES_MALE)
        prefix = "นาย"
    else:
        first_name = random.choice(FIRST_NAMES_FEMALE)
        prefix = random.choice(["นาง", "นางสาว"])

    last_name = random.choice(LAST_NAMES)

    # Age - realistic distribution (Thai farmers average ~50)
    age_ranges = [
        (18, 25, 0.08),
        (26, 35, 0.15),
        (36, 45, 0.22),
        (46, 55, 0.25),
        (56, 65, 0.20),
        (66, 80, 0.10),
    ]
    age_range = random.choices(
        [x[:2] for x in age_ranges], weights=[x[2] for x in age_ranges]
    )[0]
    age = random.randint(age_range[0], age_range[1])

    # Province - weighted towards coffee-growing regions
    province_weights = {
        "เชียงใหม่": 12,
        "เชียงราย": 10,
        "ลำปาง": 8,
        "ลำพูน": 7,
        "แม่ฮ่องสอน": 6,
        "น่าน": 5,
        "พะเยา": 5,
        "ตาก": 4,
        "อุตรดิตถ์": 3,
        "สุโขทัย": 3,
        "ขอนแก่น": 8,
        "อุดรธานี": 7,
        "มหาสารคาม": 6,
        "ร้อยเอ็ด": 5,
        "กาฬสินธุ์": 4,
        "นครราชสีมา": 6,
        "บุรีรัมย์": 5,
        "สุรินทร์": 5,
        "ชัยภูมิ": 4,
        "สุราษฎร์ธานี": 5,
        "นครศรีธรรมราช": 4,
        "ภูเก็ต": 3,
        "กระบี่": 3,
        "เพชรบุรี": 4,
        "ประจวบคีรีขันธ์": 4,
        "ชลบุรี": 4,
        "ระยอง": 3,
        "ฉะเชิงเทรา": 3,
        "ปราจีนบุรี": 3,
        "สระแก้ว": 3,
        "นนทบุรี": 2,
        "ปทุมธานี": 2,
        "กรุงเทพฯ": 1,
        "นครปฐม": 2,
        # Other provinces
        "พิษณุโลก": 3,
        "เพชรบูรณ์": 3,
        "หนองคาย": 3,
        "นครพนม": 3,
        "มุกดาหาร": 2,
        "สกลนคร": 2,
        "หนองบัวลำภู": 2,
        "ศรีสะเกษ": 2,
        "อุบลราชธานี": 2,
        "ยโสธร": 2,
        "ตรัง": 2,
        "พัทลุง": 2,
        "สงขลา": 2,
        "สตูล": 1,
        "ปัตตานี": 1,
        "ยะลา": 1,
        "นราธิวาส": 1,
        "จันทบุรี": 2,
        "ตราด": 1,
        "ลพบุรี": 2,
        "สิงห์บุรี": 1,
        "อ่างทอง": 2,
        "ชัยนาท": 1,
        "สระบุรี": 2,
        "พระนครศรีอยุธยา": 1,
        "สมุทรสาคร": 1,
        "สมุทรสงคราม": 1,
        "สมุทรปราการ": 1,
    }
    province = random.choices(
        list(province_weights.keys()), weights=list(province_weights.values())
    )[0]

    # Get district
    districts = PROVINCES_WITH_DISTRICTS.get(province, ["เมือง"])
    district = random.choice(districts)
    village = random.choice(VILLAGE_NAMES)

    # Education - correlated with age (younger = more educated)
    if age <= 30:
        education_choices = ["มัธยม", "ปวช.", "ปวส.", "ปริญญาตรี"]
        education_weights = [0.2, 0.2, 0.3, 0.3]
    elif age <= 45:
        education_choices = ["มัธยม", "ปวส.", "ปริญญาตรี", "ปริญญาโท"]
        education_weights = [0.3, 0.25, 0.35, 0.1]
    elif age <= 60:
        education_choices = ["ประถม", "มัธยม", "ปวช.", "ปริญญาตรี"]
        education_weights = [0.3, 0.4, 0.15, 0.15]
    else:
        education_choices = ["ประถม", "มัธยม", "มัธยม"]
        education_weights = [0.5, 0.4, 0.1]

    education = random.choices(education_choices, weights=education_weights)[0]

    # Experience - correlated with age
    if age <= 25:
        experience_choices = ["มือใหม่", "ระดับกลาง"]
        experience_weights = [0.6, 0.4]
    elif age <= 40:
        experience_choices = ["มือใหม่", "ระดับกลาง", "มืออาชีพ"]
        experience_weights = [0.2, 0.4, 0.4]
    elif age <= 55:
        experience_choices = ["ระดับกลาง", "มืออาชีพ", "ผู้เชี่ยวชาญ"]
        experience_weights = [0.2, 0.5, 0.3]
    else:
        experience_choices = ["มืออาชีพ", "ผู้เชี่ยวชาญ"]
        experience_weights = [0.4, 0.6]

    experience = random.choices(experience_choices, weights=experience_weights)[0]

    # Farm size - correlated with experience
    farm_sizes = FARM_SIZE_BY_EXPERIENCE.get(experience, ["เล็ก (1-5 ไร่)"])
    farm_size = random.choice(farm_sizes)

    # Occupation - realistic combinations
    if experience in ["มือใหม่", "ระดับกลาง"] and age <= 35:
        occupations = [
            "เกษตรกรช่วยครอบครัว",
            "ลูกเกษตรกร",
            "พนักงานบริษัท + เกษตรกร",
            "เกษตรกร + งานออนไลน์",
        ]
    elif experience in ["มืออาชีพ", "ผู้เชี่ยวชาญ"] and age >= 50:
        occupations = ["เกษตรกรเต็มเวลา", "ข้าราชการบำนาญ + เกษตรกร", "เกษตรกร + ค้าขาย"]
    else:
        occupations = [
            "เกษตรกรเต็มเวลา",
            "เกษตรกรช่วยครอบครัว",
            "เกษตรกร + ค้าขาย",
            "ธุรกิจส่วนตัว + เกษตรกร",
        ]

    occupation = random.choice(occupations)

    # Coffee variety - based on region
    varieties = COFFEE_VARIETY_BY_REGION.get(province, ["โรบัสต้า"])
    coffee_variety = random.sample(
        varieties, min(len(varieties), random.choice([1, 1, 2]))
    )

    # Tech level - correlated with age and education
    base_tech = 100 - (age - 18) * 1.2
    if education in ["ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก"]:
        base_tech += 10
    if "บริษัท" in occupation or "ออนไลน์" in occupation:
        base_tech += 8

    tech_confidence = max(15, min(100, int(base_tech + random.randint(-12, 15))))

    if tech_confidence <= 35:
        smartphone_level = "ต่ำ"
    elif tech_confidence <= 60:
        smartphone_level = "กลาง"
    elif tech_confidence <= 80:
        smartphone_level = "สูง"
    else:
        smartphone_level = "สูงมาก"

    # Smartphone OS - slightly more Android in rural areas
    if province in ["เชียงใหม่", "เชียงราย", "กรุงเทพฯ", "นนทบุรี", "ปทุมธานี"]:
        smartphone_os = random.choices(["Android", "iOS"], weights=[0.55, 0.45])[0]
    else:
        smartphone_os = random.choices(["Android", "iOS"], weights=[0.75, 0.25])[0]

    # Internet connection - based on province and area
    if province in ["กรุงเทพฯ", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "เชียงใหม่"]:
        internet_weights = [0.05, 0.30, 0.45, 0.20]
    elif province in ["ชลบุรี", "ระยอง", "นครปฐม", "ภูเก็ต"]:
        internet_weights = [0.10, 0.40, 0.35, 0.15]
    else:
        internet_weights = [0.25, 0.40, 0.25, 0.10]

    internet_connection = random.choices(
        ["2G", "3G", "4G", "5G/WiFi"], weights=internet_weights
    )[0]

    # Daily usage hours
    if occupation in ["ข้าราชการบำนาญ", "เกษตรกรเต็มเวลา"]:
        daily_usage = random.choices([1, 2, 3, 4], weights=[0.3, 0.4, 0.2, 0.1])[0]
    else:
        daily_usage = random.choices(
            [1, 2, 3, 4, 5, 6], weights=[0.15, 0.25, 0.25, 0.2, 0.1, 0.05]
        )[0]

    # Accessibility needs - more likely for elderly
    if age >= 60:
        accessibility_choices = [
            ["ต้องการตัวอักษรใหญ่"],
            ["ต้องการตัวอักษรใหญ่มาก", "ปุ่มใหญ่"],
            ["คอนทราสต์สูง"],
            ["ต้องการตัวอักษรใหญ่", "คอนทราสต์สูง"],
        ]
    elif age >= 50:
        accessibility_choices = [[], [], [], [], ["ต้องการตัวอักษรใหญ่"]]
    elif tech_confidence <= 30:
        accessibility_choices = [[], [], [], ["ต้องการตัวอักษรใหญ่"]]
    else:
        accessibility_choices = [[], [], [], [], [], []]

    accessibility_needs = random.choice(accessibility_choices)

    # Patience - generally higher with age
    patience_base = 45 + (age - 18) * 0.5
    patience_level = min(100, int(patience_base + random.randint(-10, 12)))

    # Button preference
    if age >= 60 or accessibility_needs:
        button_prefs = ["ใหญ่", "ใหญ่มาก"]
    elif tech_confidence <= 40:
        button_prefs = ["ใหญ่", "ปกติ"]
    elif tech_confidence >= 80:
        button_prefs = ["ปกติ", "เล็ก"]
    else:
        button_prefs = ["ปกติ", "ใหญ่"]

    button_preference = random.choice(button_prefs)

    # Reading speed
    if age >= 55 or accessibility_needs:
        reading_speed = random.choice(["ช้า", "ช้า", "ปานกลาง"])
    elif tech_confidence >= 75:
        reading_speed = random.choice(["เร็ว", "เร็วมาก", "ปานกลาง"])
    else:
        reading_speed = random.choice(["ปานกลาง", "เร็ว", "ช้า"])

    # Notification preference
    if patience_level >= 70:
        notification_preference = random.choice(["รายวัน", "รายวัน", "2-3 วัน"])
    else:
        notification_preference = random.choice(["ทันที", "ทันที", "รายวัน"])

    # Color blind
    color_blind = random.random() < 0.03  # ~3% of population

    # Pain points - based on persona type
    persona_types = get_persona_type(
        {
            "age": age,
            "behavior_patterns": {"tech_confidence": tech_confidence},
            "experience": experience,
            "farm_size": farm_size,
            "occupation": occupation,
            "internet_connection": internet_connection,
        }
    )

    all_pain_points = []
    for pt in persona_types:
        if pt in PAIN_POINTS:
            all_pain_points.extend(PAIN_POINTS[pt])
    pain_points = list(
        set(random.sample(all_pain_points, min(2, len(all_pain_points))))
    )

    # Goals - based on persona type
    all_goals = []
    if experience in ["มือใหม่", "ระดับกลาง"]:
        all_goals.extend(GOALS["record_management"] + GOALS["knowledge"])
    if farm_size in ["ใหญ่ (21-50 ไร่)", "อุตสาหกรรม (50+ ไร่)"]:
        all_goals.extend(GOALS["business"])
    if age >= 50:
        all_goals.extend(GOALS["family"])
    if random.random() < 0.5:
        all_goals.extend(GOALS["increase_yield"])
    if random.random() < 0.3:
        all_goals.extend(GOALS["reduce_cost"])

    goals = list(set(random.sample(all_goals, min(2, len(all_goals)))))

    # Testing approach
    testing_approaches = [
        "ทดสอบการใช้งานจริงในสวน",
        "ทดสอบความเร็วและประสิทธิภาพ",
        "ทดสอบ accessibility สำหรับผู้สูงอายุ",
        "ทดสอบกับผู้ใช้หลายวัย",
        "ทดสอบ offline mode และ sync",
        "ทดสอบ push notifications",
        "ทดสอบ dark mode",
        "ทดสอบ export ข้อมูล",
        "ทดสอบ multi-farm management",
        "ทดสอบ AI insights และ charts",
        "ทดสอบการบันทึกผลผลิต",
        "ทดสอบ financial reports",
    ]

    if age >= 55:
        testing_approach = "ทดสอบ accessibility สำหรับผู้สูงอายุ"
    elif smartphone_level == "ต่ำ":
        testing_approach = "ทดสอบการใช้งานจริงในสวน"
    elif smartphone_level == "สูงมาก":
        testing_approach = random.choice(
            [
                "ทดสอบ AI insights และ charts",
                "ทดสอบความเร็วและประสิทธิภาพ",
                "ทดสอบ automation",
            ]
        )
    else:
        testing_approach = random.choice(testing_approaches[:7])

    # Feedback style
    if age >= 55:
        feedback_style = random.choice(["ช้าแต่ชัดเจน", "ถ้อยคำง่ายๆ", "ช้าแต่ตรงไปตรงมา"])
    elif patience_level >= 70:
        feedback_style = random.choice(["ละเอียดและเป็นระบบ", "เน้นความเป็นระเบียบ"])
    else:
        feedback_style = random.choice(
            ["เร็วและตรงประเด็น", "เน้นประสิทธิภาพ", "ให้ความสำคัญกับ UX", "เน้นตัวเลขและรายได้"]
        )

    # Personality traits - correlated with age and tech level
    base_openness = 50 + (35 - age) * 0.3 if age < 35 else 50 + (age - 35) * 0.2
    openness = max(30, min(100, int(base_openness + random.randint(-15, 15))))

    base_conscientiousness = 50 + (age - 25) * 0.5
    conscientiousness = max(
        30, min(100, int(base_conscientiousness + random.randint(-10, 10)))
    )

    extraversion = max(25, min(100, int(50 + random.randint(-20, 20))))
    agreeableness = max(35, min(100, int(60 + random.randint(-15, 15))))

    base_neuroticism = 50 - (age - 25) * 0.4 if age > 25 else 50 + (25 - age) * 0.5
    neuroticism = max(15, min(85, int(base_neuroticism + random.randint(-12, 12))))

    # Device info
    if age >= 50:
        device_type = random.choices(["สมาร์ทโฟน", "แท็บเล็ต"], weights=[0.7, 0.3])[0]
        device_age = random.randint(2, 5)
    else:
        device_type = random.choices(
            ["สมาร์ทโฟน", "แท็บเล็ต", "ทั้งสองอย่าง"], weights=[0.75, 0.1, 0.15]
        )[0]
        device_age = random.randint(1, 4)

    has_camera = random.random() < 0.85

    if device_age <= 2:
        storage_choices = ["มาก", "ปานกลาง", "มาก"]
    elif device_age <= 4:
        storage_choices = ["น้อย", "ปานกลาง", "ปานกลาง"]
    else:
        storage_choices = ["น้อย", "น้อย", "ปานกลาง"]

    storage_available = random.choice(storage_choices)

    # Usage context
    if occupation in ["ข้าราชการบำนาญ", "เกษตรกรเต็มเวลา"]:
        primary_location = random.choice(["ในสวน", "บ้าน", "ในสวน"])
        time_of_day = random.choice(["เช้า", "เย็น", "เช้า,เย็น"])
    elif "บริษัท" in occupation:
        primary_location = random.choice(["เดินทาง", "ที่ทำงาน", "หลายที่"])
        time_of_day = random.choice(["ดึก", "เย็น", "หลายช่วง"])
    else:
        primary_location = random.choice(["บ้าน", "ในสวน", "หลายที่"])
        time_of_day = random.choice(["เช้า", "เย็น", "หลายช่วง"])

    session_duration = random.choice([5, 10, 15, 30, 30, 60])
    multitasking = random.choice([True, False]) if age <= 45 else False

    return {
        "id": f"P{persona_id:03d}",
        "name": f"{prefix}{first_name} {last_name}",
        "age": age,
        "gender": gender,
        "province": province,
        "district": district,
        "village": village,
        "full_address": f"{village} ต.{district} อ.{province}",
        "education": education,
        "occupation": occupation,
        "farm_size": farm_size,
        "experience": experience,
        "coffee_variety": coffee_variety,
        "farming_years": max(1, age - 20)
        if experience in ["มืออาชีพ", "ผู้เชี่ยวชาญ"]
        else random.randint(1, 5),
        "smartphone_os": smartphone_os,
        "smartphone_level": smartphone_level,
        "internet_connection": internet_connection,
        "daily_usage_hours": daily_usage,
        "preferred_language": random.choice(["ไทย", "ไทย", "ไทย", "อังกฤษ"]),
        "accessibility_needs": accessibility_needs,
        "behavior_patterns": {
            "tech_confidence": tech_confidence,
            "patience_level": patience_level,
            "reading_speed": reading_speed,
            "button_size_preference": button_preference,
            "notification_preference": notification_preference,
            "color_blind_friendly": color_blind,
            "screen_size_preference": "ใหญ่"
            if age >= 50
            else random.choice(["เล็ก", "ใหญ่", "ปกติ"]),
            "font_preference": "sans-serif"
            if tech_confidence >= 60
            else random.choice(["sans-serif", "ไม่มีความชอบ"]),
        },
        "pain_points": pain_points,
        "goals": goals,
        "testing_approach": testing_approach,
        "feedback_style": feedback_style,
        "personality_traits": {
            "openness": openness,
            "conscientiousness": conscientiousness,
            "extraversion": extraversion,
            "agreeableness": agreeableness,
            "neuroticism": neuroticism,
            "big_five_label": get_big_five_label(
                openness, conscientiousness, extraversion, agreeableness, neuroticism
            ),
        },
        "device_info": {
            "device_type": device_type,
            "device_age_years": device_age,
            "has_camera": has_camera,
            "storage_available_gb": {
                "น้อย": random.randint(2, 8),
                "ปานกลาง": random.randint(8, 20),
                "มาก": random.randint(20, 60),
            }[storage_available],
            "storage_label": storage_available,
        },
        "usage_context": {
            "primary_location": primary_location,
            "time_of_day": time_of_day,
            "session_duration_minutes": session_duration,
            "multitasking": multitasking,
            "typical_workflow": get_typical_workflow(occupation, farm_size),
        },
        "bio": generate_bio(
            age, gender, first_name, experience, farm_size, province, coffee_variety
        ),
    }


def get_big_five_label(o, c, e, a, n):
    labels = []
    if o >= 65:
        labels.append("เปิดรับประสบการณ์")
    elif o <= 40:
        labels.append("รักษาที่เดิม")
    if c >= 65:
        labels.append("มีระเบียบ")
    elif c <= 40:
        labels.append("ยืดหยุ่น")
    if e >= 65:
        labels.append("เข้าสังคมง่าย")
    elif e <= 40:
        labels.append("สงบเงียบ")
    if a >= 65:
        labels.append("ใจดี")
    elif a <= 40:
        labels.append("วิพากษ์")
    if n >= 60:
        labels.append("รู้สึกอ่อนไหว")
    elif n <= 35:
        labels.append("มั่นคงทางอารมณ์")
    return labels if labels else ["สมดุล"]


def get_typical_workflow(occupation, farm_size):
    workflows = {
        "เช้า": ["ตื่น 05:00", "ไปสวน", "บันทึกข้อมูล", "กลับบ้าน"],
        "เย็น": ["ตื่น 06:00", "ทำงานประจำ", "กลับบ้าน", "เช็คข้อมูลสวน"],
        "เสาร์อาทิตย์": ["ไปสวนเช้า", "บันทึกผลผลิต", "พักผ่อน"],
        "ทุกวัน": ["เช็คราคาตลาด", "ดูสถิติ", "บันทึกง่ายๆ"],
    }
    return random.choice(["เช้า", "เย็น", "เสาร์อาทิตย์", "ทุกวัน"])


def generate_bio(
    age, gender, first_name, experience, farm_size, province, coffee_variety
):
    templates = [
        f"{first_name} เกษตรกรวัย {age} ปี จาก{province} ปลูก{coffee_variety[0]}มา{experience} มีสวนขนาด{farm_size.split('(')[0].strip()}",
        f"{first_name} มีประสบการณ์{experience} ในการทำสวนกาแฟ {age} ปี ใน{province} ปัจจุบันดูแลสวน{farm_size.split('(')[0].strip()}",
        f"{first_name} {age} ปี เป็นเกษตรกรที่{province} ชอบปลูก{', '.join(coffee_variety)} สวน{farm_size.split('(')[0].strip()}",
    ]
    return random.choice(templates)


def main():
    print("Generating 300 realistic personas...")

    personas = [generate_realistic_persona(i) for i in range(1, 301)]

    # Analyze distribution
    age_ranges = {"18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56-65": 0, "65+": 0}
    provinces_count = {}
    tech_dist = {"ต่ำ": 0, "กลาง": 0, "สูง": 0, "สูงมาก": 0}
    gender_dist = {"ชาย": 0, "หญิง": 0}
    farm_dist = {}
    variety_dist = {}
    accessibility_count = 0

    for p in personas:
        age = p["age"]
        if age <= 25:
            age_ranges["18-25"] += 1
        elif age <= 35:
            age_ranges["26-35"] += 1
        elif age <= 45:
            age_ranges["36-45"] += 1
        elif age <= 55:
            age_ranges["46-55"] += 1
        elif age <= 65:
            age_ranges["56-65"] += 1
        else:
            age_ranges["65+"] += 1

        provinces_count[p["province"]] = provinces_count.get(p["province"], 0) + 1
        tech_dist[p["smartphone_level"]] += 1
        gender_dist[p["gender"]] += 1
        farm_dist[p["farm_size"]] = farm_dist.get(p["farm_size"], 0) + 1
        for v in p["coffee_variety"]:
            variety_dist[v] = variety_dist.get(v, 0) + 1
        if p["accessibility_needs"]:
            accessibility_count += 1

    output = {
        "version": "2.0",
        "total": 300,
        "generated_at": datetime.now().isoformat(),
        "generator": "generate_realistic_personas.py v2",
        "description": "300 realistic personas for Coffee Farm App testing - with correlated attributes and regional data",
        "demographics_distribution": {
            "age_ranges": age_ranges,
            "provinces_count": len(provinces_count),
            "provinces": dict(
                sorted(provinces_count.items(), key=lambda x: -x[1])[:15]
            ),
            "gender_distribution": gender_dist,
            "tech_level_distribution": tech_dist,
            "farm_size_distribution": farm_dist,
            "coffee_variety_distribution": variety_dist,
            "accessibility_needs": accessibility_count,
            "average_age": round(sum(p["age"] for p in personas) / len(personas), 1),
            "average_tech_confidence": round(
                sum(p["behavior_patterns"]["tech_confidence"] for p in personas)
                / len(personas),
                1,
            ),
        },
        "personas": personas,
    }

    # Write JSON
    with open("personas_300_realistic.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Generated {len(personas)} realistic personas")
    print(f"📁 Output: personas_300_realistic.json")

    print(f"\n📊 Demographics:")
    print(
        f"   Total: 300 | Avg Age: {output['demographics_distribution']['average_age']} | Avg Tech: {output['demographics_distribution']['average_tech_confidence']:.0f}%"
    )
    print(f"   Male: {gender_dist['ชาย']} | Female: {gender_dist['หญิง']}")
    print(
        f"   Provinces: {len(provinces_count)} | Accessibility: {accessibility_count} ({accessibility_count / 3:.1f}%)"
    )

    print(f"\n👥 Age Distribution:")
    for r, c in age_ranges.items():
        bar = "█" * (c // 3) + f" {c} ({c / 3:.1f}%)"
        print(f"   {r:>8}: {bar}")

    print(f"\n📱 Tech Level:")
    for level, count in tech_dist.items():
        bar = "█" * (count // 3) + f" {count}"
        print(f"   {level:>6}: {bar}")

    print(f"\n☕ Top Provinces:")
    for prov, count in list(provinces_count.items())[:10]:
        bar = "█" * count + f" {count}"
        print(f"   {prov:>15}: {bar}")

    # Generate TypeScript file
    ts_output = "export interface Persona {\n"
    for key, val in personas[0].items():
        if isinstance(val, dict):
            ts_output += f"  {key}: {{\n"
            for k, v in val.items():
                ts_output += f"    {k}: {get_ts_type(v)};\n"
            ts_output += "  };\n"
        elif isinstance(val, list):
            ts_output += f"  {key}: {get_ts_type(val)};\n"
        else:
            ts_output += f"  {key}: {get_ts_type(val)};\n"
    ts_output += "}\n\n"
    ts_output += f"export const PERSONAS: Persona[] = {json.dumps(personas, ensure_ascii=False)} as const;\n"

    with open("personas_300_realistic.ts", "w", encoding="utf-8") as f:
        f.write(ts_output)

    print(f"\n📄 Also created: personas_300_realistic.ts")


def get_ts_type(val):
    if isinstance(val, bool):
        return "boolean"
    if isinstance(val, int):
        return "number"
    if isinstance(val, float):
        return "number"
    if isinstance(val, str):
        return "string"
    if isinstance(val, list):
        if val:
            return f"({get_ts_type(val[0])})[]"
        return "any[]"
    return "any"


if __name__ == "__main__":
    main()
