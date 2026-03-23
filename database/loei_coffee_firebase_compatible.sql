-- =====================================================
-- Loei Coffee Database - Firebase Compatible Schema
-- =====================================================
-- Updated: March 2026
-- Compatible with Firebase Authentication & Firestore
-- Optimized for React Native Mobile Application
-- =====================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- =====================================================
-- CORE TABLES (ตาราง Core ที่ใช้งานจริงใน Firebase)
-- =====================================================

-- -----------------------------------------------------
-- Table: users (ผู้ใช้งาน - sync จาก Firebase Auth)
-- -----------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID',
  `email` VARCHAR(255) NOT NULL COMMENT 'อีเมล',
  `display_name` VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อที่แสดง',
  `photo_url` TEXT DEFAULT NULL COMMENT 'URL รูปโปรไฟล์',
  `phone_number` VARCHAR(20) DEFAULT NULL COMMENT 'เบอร์โทรศัพท์',
  `provider` ENUM('password', 'google', 'facebook', 'line') DEFAULT 'password' COMMENT 'ผู้ให้บริการ Auth',
  `email_verified` TINYINT(1) DEFAULT 0 COMMENT 'ยืนยันอีเมลแล้ว',
  `disabled` TINYINT(1) DEFAULT 0 COMMENT 'ปิดการใช้งาน',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง',
  `last_login` TIMESTAMP NULL DEFAULT NULL COMMENT 'เข้าสู่ระบบล่าสุด',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_provider` (`provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='ผู้ใช้งาน (sync จาก Firebase Auth)';

-- -----------------------------------------------------
-- Table: farms (ไร่กาแฟ - ตรงกับ Firestore collection)
-- -----------------------------------------------------
CREATE TABLE `farms` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Firestore Document ID',
  `user_id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID (เจ้าของไร่)',
  `name` VARCHAR(255) NOT NULL COMMENT 'ชื่อไร่',
  `area` DECIMAL(10,2) NOT NULL COMMENT 'พื้นที่ (ไร่)',
  `soil_type` VARCHAR(100) DEFAULT NULL COMMENT 'ประเภทดิน',
  `water_source` VARCHAR(100) DEFAULT NULL COMMENT 'แหล่งน้ำ',
  `province` VARCHAR(100) NOT NULL COMMENT 'จังหวัด',
  `district` VARCHAR(100) DEFAULT NULL COMMENT 'อำเภอ',
  `altitude` INT DEFAULT NULL COMMENT 'ระดับความสูง (เมตร)',
  `variety` VARCHAR(100) DEFAULT NULL COMMENT 'สายพันธุ์กาแฟ',
  `tree_count` INT DEFAULT NULL COMMENT 'จำนวนต้น',
  `planting_year` YEAR DEFAULT NULL COMMENT 'ปีที่ปลูก',
  `notes` TEXT DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'แก้ไขล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_province` (`province`),
  KEY `idx_variety` (`variety`),
  CONSTRAINT `fk_farms_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='ไร่กาแฟ (sync จาก Firestore farms collection)';

-- -----------------------------------------------------
-- Table: harvests (การเก็บเกี่ยว - ตรงกับ Firestore collection)
-- -----------------------------------------------------
CREATE TABLE `harvests` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Firestore Document ID',
  `user_id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID',
  `farm_id` VARCHAR(128) NOT NULL COMMENT 'รหัสไร่',
  `harvest_date` DATE NOT NULL COMMENT 'วันที่เก็บเกี่ยว',
  `variety` VARCHAR(100) DEFAULT NULL COMMENT 'สายพันธุ์',
  `weight_kg` DECIMAL(10,2) NOT NULL COMMENT 'น้ำหนัก (กิโลกรัม)',
  `income` DECIMAL(12,2) NOT NULL COMMENT 'รายได้ (บาท)',
  `shift` ENUM('morning', 'afternoon', 'evening') NOT NULL COMMENT 'กะ (เช้า/บ่าย/เย็น)',
  `notes` TEXT DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'แก้ไขล่าสุด',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_farm_id` (`farm_id`),
  KEY `idx_harvest_date` (`harvest_date`),
  CONSTRAINT `fk_harvests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_harvests_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='การเก็บเกี่ยว (sync จาก Firestore harvests collection)';

-- =====================================================
-- TIER 1: RECOMMENDED TABLES (แนะนำเพิ่มทันที)
-- =====================================================

-- -----------------------------------------------------
-- Table: user_profiles (โปรไฟล์เกษตรกร - ข้อมูลเพิ่มเติม)
-- -----------------------------------------------------
CREATE TABLE `user_profiles` (
  `user_id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID',
  `full_name` VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อ-นามสกุล',
  `birthday` DATE DEFAULT NULL COMMENT 'วันเกิด',
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL COMMENT 'เพศ',
  `national_id` VARCHAR(13) DEFAULT NULL COMMENT 'เลขบัตรประชาชน',
  `farmer_id` VARCHAR(50) DEFAULT NULL COMMENT 'เลขทะเบียนเกษตรกร',
  `address` TEXT DEFAULT NULL COMMENT 'ที่อยู่',
  `province` VARCHAR(100) DEFAULT NULL COMMENT 'จังหวัด',
  `district` VARCHAR(100) DEFAULT NULL COMMENT 'อำเภอ',
  `subdistrict` VARCHAR(100) DEFAULT NULL COMMENT 'ตำบล',
  `postal_code` VARCHAR(10) DEFAULT NULL COMMENT 'รหัสไปรษณีย์',
  `accept_terms` TINYINT(1) DEFAULT 0 COMMENT 'ยอมรับข้อตกลง',
  `accept_data_usage` TINYINT(1) DEFAULT 0 COMMENT 'ยินยอมใช้ข้อมูล',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `idx_national_id` (`national_id`),
  UNIQUE KEY `idx_farmer_id` (`farmer_id`),
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='โปรไฟล์เกษตรกร (ข้อมูลเพิ่มเติม)';

-- -----------------------------------------------------
-- Table: expenses (ค่าใช้จ่าย)
-- -----------------------------------------------------
CREATE TABLE `expenses` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Document ID',
  `user_id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID',
  `farm_id` VARCHAR(128) DEFAULT NULL COMMENT 'รหัสไร่ (ถ้ามี)',
  `expense_date` DATE NOT NULL COMMENT 'วันที่จ่าย',
  `category` ENUM('fertilizer', 'pesticide', 'labor', 'equipment', 'transport', 'other') NOT NULL COMMENT 'หมวดหมู่',
  `description` VARCHAR(255) NOT NULL COMMENT 'รายละเอียด',
  `amount` DECIMAL(12,2) NOT NULL COMMENT 'จำนวนเงิน (บาท)',
  `notes` TEXT DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_farm_id` (`farm_id`),
  KEY `idx_expense_date` (`expense_date`),
  KEY `idx_category` (`category`),
  CONSTRAINT `fk_expenses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_expenses_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='ค่าใช้จ่าย (ปุ๋ย, ยา, แรงงาน, ฯลฯ)';

-- -----------------------------------------------------
-- Table: weather_logs (บันทึกสภาพอากาศ)
-- -----------------------------------------------------
CREATE TABLE `weather_logs` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Document ID',
  `farm_id` VARCHAR(128) NOT NULL COMMENT 'รหัสไร่',
  `log_date` DATE NOT NULL COMMENT 'วันที่บันทึก',
  `temperature_min` DECIMAL(5,2) DEFAULT NULL COMMENT 'อุณหภูมิต่ำสุด (°C)',
  `temperature_max` DECIMAL(5,2) DEFAULT NULL COMMENT 'อุณหภูมิสูงสุด (°C)',
  `rainfall_mm` DECIMAL(8,2) DEFAULT NULL COMMENT 'ปริมาณฝน (มม.)',
  `humidity_percent` DECIMAL(5,2) DEFAULT NULL COMMENT 'ความชื้น (%)',
  `weather_condition` ENUM('sunny', 'cloudy', 'rainy', 'stormy') DEFAULT NULL COMMENT 'สภาพอากาศ',
  `notes` TEXT DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_farm_id` (`farm_id`),
  KEY `idx_log_date` (`log_date`),
  CONSTRAINT `fk_weather_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='บันทึกสภาพอากาศ';

-- =====================================================
-- TIER 2: ADVANCED FEATURES (ฟีเจอร์ขั้นสูง)
-- =====================================================

-- -----------------------------------------------------
-- Table: farm_activities (กิจกรรมในไร่)
-- -----------------------------------------------------
CREATE TABLE `farm_activities` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Document ID',
  `user_id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID',
  `farm_id` VARCHAR(128) NOT NULL COMMENT 'รหัสไร่',
  `activity_date` DATE NOT NULL COMMENT 'วันที่ทำกิจกรรม',
  `activity_type` ENUM('pruning', 'fertilizing', 'spraying', 'weeding', 'planting', 'other') NOT NULL COMMENT 'ประเภทกิจกรรม',
  `description` TEXT NOT NULL COMMENT 'รายละเอียด',
  `labor_hours` DECIMAL(5,2) DEFAULT NULL COMMENT 'ชั่วโมงแรงงาน',
  `cost` DECIMAL(10,2) DEFAULT NULL COMMENT 'ค่าใช้จ่าย (บาท)',
  `notes` TEXT DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_farm_id` (`farm_id`),
  KEY `idx_activity_date` (`activity_date`),
  CONSTRAINT `fk_activities_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_activities_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='กิจกรรมในไร่ (ตัดแต่ง, ใส่ปุ๋ย, ฉีดพ่น, ฯลฯ)';

-- -----------------------------------------------------
-- Table: coffee_prices (ราคากาแฟตลาด)
-- -----------------------------------------------------
CREATE TABLE `coffee_prices` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'รหัส',
  `price_date` DATE NOT NULL COMMENT 'วันที่',
  `variety` VARCHAR(100) NOT NULL COMMENT 'สายพันธุ์',
  `grade` VARCHAR(50) DEFAULT NULL COMMENT 'เกรด',
  `price_per_kg` DECIMAL(10,2) NOT NULL COMMENT 'ราคา/กก. (บาท)',
  `market_location` VARCHAR(100) DEFAULT NULL COMMENT 'ตลาด/สถานที่',
  `source` VARCHAR(255) DEFAULT NULL COMMENT 'แหล่งข้อมูล',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_price_date` (`price_date`),
  KEY `idx_variety` (`variety`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='ราคากาแฟตลาด (อ้างอิง)';

-- -----------------------------------------------------
-- Table: products (สินค้ากาแฟ - สำหรับขาย)
-- -----------------------------------------------------
CREATE TABLE `products` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Document ID',
  `user_id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID (เจ้าของ)',
  `farm_id` VARCHAR(128) DEFAULT NULL COMMENT 'รหัสไร่ต้นทาง',
  `product_name` VARCHAR(255) NOT NULL COMMENT 'ชื่อสินค้า',
  `product_type` ENUM('green_bean', 'roasted', 'ground', 'instant', 'other') NOT NULL COMMENT 'ประเภทสินค้า',
  `variety` VARCHAR(100) DEFAULT NULL COMMENT 'สายพันธุ์',
  `roast_level` ENUM('light', 'medium', 'dark') DEFAULT NULL COMMENT 'ระดับคั่ว',
  `weight_g` INT DEFAULT NULL COMMENT 'น้ำหนัก (กรัม)',
  `stock_quantity` INT DEFAULT 0 COMMENT 'จำนวนสต็อก',
  `price` DECIMAL(10,2) NOT NULL COMMENT 'ราคา (บาท)',
  `description` TEXT DEFAULT NULL COMMENT 'รายละเอียด',
  `is_gi_certified` TINYINT(1) DEFAULT 0 COMMENT 'ได้รับ GI',
  `is_organic` TINYINT(1) DEFAULT 0 COMMENT 'ออร์แกนิก',
  `for_sale` TINYINT(1) DEFAULT 1 COMMENT 'พร้อมขาย',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_farm_id` (`farm_id`),
  KEY `idx_product_type` (`product_type`),
  CONSTRAINT `fk_products_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_products_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='สินค้างาแฟ (สำหรับขาย)';

-- =====================================================
-- TIER 3: PREMIUM FEATURES (ฟีเจอร์พรีเมียม)
-- =====================================================

-- -----------------------------------------------------
-- Table: certifications (ใบรับรอง)
-- -----------------------------------------------------
CREATE TABLE `certifications` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Document ID',
  `user_id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID',
  `farm_id` VARCHAR(128) DEFAULT NULL COMMENT 'รหัสไร่',
  `cert_type` ENUM('organic', 'gi', 'gap', 'rainforest', 'fairtrade', 'other') NOT NULL COMMENT 'ประเภทใบรับรอง',
  `cert_number` VARCHAR(100) DEFAULT NULL COMMENT 'เลขที่ใบรับรอง',
  `issued_by` VARCHAR(255) DEFAULT NULL COMMENT 'หน่วยงานออก',
  `issue_date` DATE DEFAULT NULL COMMENT 'วันที่ออก',
  `expiry_date` DATE DEFAULT NULL COMMENT 'วันหมดอายุ',
  `document_url` TEXT DEFAULT NULL COMMENT 'URL เอกสาร',
  `status` ENUM('active', 'expired', 'pending', 'revoked') DEFAULT 'active' COMMENT 'สถานะ',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_farm_id` (`farm_id`),
  KEY `idx_cert_type` (`cert_type`),
  CONSTRAINT `fk_certs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_certs_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='ใบรับรอง (Organic, GI, GAP, ฯลฯ)';

-- -----------------------------------------------------
-- Table: soil_tests (ผลตรวจดิน)
-- -----------------------------------------------------
CREATE TABLE `soil_tests` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Document ID',
  `farm_id` VARCHAR(128) NOT NULL COMMENT 'รหัสไร่',
  `test_date` DATE NOT NULL COMMENT 'วันที่ตรวจ',
  `ph_level` DECIMAL(4,2) DEFAULT NULL COMMENT 'ค่า pH',
  `nitrogen_ppm` DECIMAL(8,2) DEFAULT NULL COMMENT 'ไนโตรเจน (ppm)',
  `phosphorus_ppm` DECIMAL(8,2) DEFAULT NULL COMMENT 'ฟอสฟอรัส (ppm)',
  `potassium_ppm` DECIMAL(8,2) DEFAULT NULL COMMENT 'โพแทสเซียม (ppm)',
  `organic_matter_percent` DECIMAL(5,2) DEFAULT NULL COMMENT 'อินทรียวัตถุ (%)',
  `lab_name` VARCHAR(255) DEFAULT NULL COMMENT 'ห้องแล็บ',
  `recommendations` TEXT DEFAULT NULL COMMENT 'คำแนะนำ',
  `document_url` TEXT DEFAULT NULL COMMENT 'URL เอกสาร',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_farm_id` (`farm_id`),
  KEY `idx_test_date` (`test_date`),
  CONSTRAINT `fk_soiltest_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='ผลตรวจดิน';

-- -----------------------------------------------------
-- Table: notifications (การแจ้งเตือน)
-- -----------------------------------------------------
CREATE TABLE `notifications` (
  `id` VARCHAR(128) NOT NULL COMMENT 'Document ID',
  `user_id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID',
  `title` VARCHAR(255) NOT NULL COMMENT 'หัวข้อ',
  `message` TEXT NOT NULL COMMENT 'ข้อความ',
  `type` ENUM('info', 'warning', 'success', 'error', 'reminder') DEFAULT 'info' COMMENT 'ประเภท',
  `related_type` ENUM('farm', 'harvest', 'expense', 'weather', 'price', 'other') DEFAULT NULL COMMENT 'เกี่ยวข้องกับ',
  `related_id` VARCHAR(128) DEFAULT NULL COMMENT 'รหัสที่เกี่ยวข้อง',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT 'อ่านแล้ว',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='การแจ้งเตือน';

-- =====================================================
-- VIEWS (สำหรับ Analytics และ Reporting)
-- =====================================================

-- View: รายงานผลผลิตรายไร่
CREATE OR REPLACE VIEW `v_farm_harvest_summary` AS
SELECT 
  f.id AS farm_id,
  f.name AS farm_name,
  f.user_id,
  YEAR(h.harvest_date) AS harvest_year,
  COUNT(h.id) AS total_harvests,
  SUM(h.weight_kg) AS total_weight_kg,
  SUM(h.income) AS total_income,
  AVG(h.weight_kg) AS avg_weight_per_harvest,
  AVG(h.income) AS avg_income_per_harvest
FROM farms f
LEFT JOIN harvests h ON f.id = h.farm_id
GROUP BY f.id, f.name, f.user_id, YEAR(h.harvest_date);

-- View: รายงานค่าใช้จ่ายรายไร่
CREATE OR REPLACE VIEW `v_farm_expense_summary` AS
SELECT 
  f.id AS farm_id,
  f.name AS farm_name,
  f.user_id,
  YEAR(e.expense_date) AS expense_year,
  e.category,
  COUNT(e.id) AS total_expenses,
  SUM(e.amount) AS total_amount
FROM farms f
LEFT JOIN expenses e ON f.id = e.farm_id
GROUP BY f.id, f.name, f.user_id, YEAR(e.expense_date), e.category;

-- View: กำไร/ขาดทุนรายไร่
CREATE OR REPLACE VIEW `v_farm_profit_loss` AS
SELECT 
  f.id AS farm_id,
  f.name AS farm_name,
  f.user_id,
  YEAR(h.harvest_date) AS year,
  COALESCE(SUM(h.income), 0) AS total_income,
  COALESCE(SUM(e.amount), 0) AS total_expense,
  COALESCE(SUM(h.income), 0) - COALESCE(SUM(e.amount), 0) AS net_profit
FROM farms f
LEFT JOIN harvests h ON f.id = h.farm_id
LEFT JOIN expenses e ON f.id = e.farm_id AND YEAR(h.harvest_date) = YEAR(e.expense_date)
GROUP BY f.id, f.name, f.user_id, YEAR(h.harvest_date);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
