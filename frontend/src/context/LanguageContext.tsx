import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'th' | 'en' | 'zh';

interface Translations {
  [key: string]: {
    th: string;
    en: string;
    zh: string;
  };
}

const translations: Translations = {
  // Common
  'app.name': { th: 'สวนกาแฟเลย', en: 'Coffee Farm', zh: '咖啡农场' },
  'common.save': { th: 'บันทึก', en: 'Save', zh: '保存' },
  'common.cancel': { th: 'ยกเลิก', en: 'Cancel', zh: '取消' },
  'common.delete': { th: 'ลบ', en: 'Delete', zh: '删除' },
  'common.edit': { th: 'แก้ไข', en: 'Edit', zh: '编辑' },
  'common.loading': { th: 'กำลังโหลด...', en: 'Loading...', zh: '加载中...' },
  'common.error': { th: 'เกิดข้อผิดพลาด', en: 'Error', zh: '错误' },
  'common.success': { th: 'สำเร็จ', en: 'Success', zh: '成功' },

  // Navigation
  'nav.home': { th: 'หน้าหลัก', en: 'Home', zh: '首页' },
  'nav.farms': { th: 'สวน', en: 'Farms', zh: '农场' },
  'nav.harvests': { th: 'ผลผลิต', en: 'Harvests', zh: '收获' },
  'nav.price': { th: 'ราคา', en: 'Price', zh: '价格' },
  'nav.settings': { th: 'ตั้งค่า', en: 'Settings', zh: '设置' },

  // Farm
  'farm.add': { th: 'เพิ่มสวน', en: 'Add Farm', zh: '添加农场' },
  'farm.name': { th: 'ชื่อสวน', en: 'Farm Name', zh: '农场名称' },
  'farm.area': { th: 'พื้นที่ (ไร่)', en: 'Area (Rai)', zh: '面积 (莱)' },
  'farm.variety': { th: 'สายพันธุ์', en: 'Variety', zh: '品种' },
  'farm.treeCount': { th: 'จำนวนต้น', en: 'Tree Count', zh: '棵树' },

  // Harvest
  'harvest.add': { th: 'เพิ่มผลผลิต', en: 'Add Harvest', zh: '添加收获' },
  'harvest.date': { th: 'วันที่', en: 'Date', zh: '日期' },
  'harvest.weight': { th: 'น้ำหนัก', en: 'Weight', zh: '重量' },
  'harvest.income': { th: 'รายได้', en: 'Income', zh: '收入' },

  // Auth
  'auth.login': { th: 'เข้าสู่ระบบ', en: 'Login', zh: '登录' },
  'auth.register': { th: 'สมัครสมาชิก', en: 'Register', zh: '注册' },
  'auth.logout': { th: 'ออกจากระบบ', en: 'Logout', zh: '退出' },
  'auth.email': { th: 'อีเมล', en: 'Email', zh: '邮箱' },
  'auth.password': { th: 'รหัสผ่าน', en: 'Password', zh: '密码' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'app_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('th');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved && ['th', 'en', 'zh'].includes(saved)) {
        setLanguageState(saved as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;
