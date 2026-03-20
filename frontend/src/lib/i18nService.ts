// Internationalization Service for Coffee Farm Management App

export type Language = 'th' | 'en' | 'zh';

export interface Translation {
  [key: string]: string | Translation;
}

export const translations: Record<Language, Translation> = {
  th: {
    // Navigation
    home: 'หน้าแรก',
    farms: 'ไร่ของฉัน',
    harvest: 'การเก็บเกี่ยว',
    price: 'ราคาและวิเคราะห์',
    profile: 'โปรไฟล์',
    settings: 'การตั้งค่า',

    // Auth
    welcome: 'ยินดีต้อนรับ',
    login: 'เข้าสู่ระบบ',
    register: 'สมัครสมาชิก',
    logout: 'ออกจากระบบ',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    forgotPassword: 'ลืมรหัสผ่าน?',
    signInWithGoogle: 'เข้าสู่ระบบด้วย Google',
    signInWithFacebook: 'เข้าสู่ระบบด้วย Facebook',
    signInWithLine: 'เข้าสู่ระบบด้วย LINE',

    // Farm Management
    addFarm: 'เพิ่มไร่',
    farmName: 'ชื่อไร่',
    area: 'พื้นที่ (ไร่)',
    soilType: 'ประเภทดิน',
    waterSource: 'แหล่งน้ำ',
    province: 'จังหวัด',
    district: 'อำเภอ',
    altitude: 'ระดับความสูง (เมตร)',
    variety: 'สายพันธุ์',
    treeCount: 'จำนวนต้น',
    plantingYear: 'ปีที่ปลูก',
    notes: 'หมายเหตุ',
    
    // Harvest
    harvestDate: 'วันที่เก็บเกี่ยว',
    weight: 'น้ำหนัก (กก.)',
    income: 'รายได้ (บาท)',
    shift: 'กะ',
    morningShift: 'เช้า',
    afternoonShift: 'บ่าย',
    addHarvest: 'เพิ่มข้อมูลการเก็บเกี่ยว',
    
    // Analytics
    totalIncome: 'รายได้รวม',
    totalYield: 'ผลผลิตรวม',
    averagePrice: 'ราคาเฉลี่ย',
    monthlyRevenue: 'รายได้รายเดือน',
    yieldTrend: 'แนวโน้มผลผลิต',
    priceTrend: 'แนวโน้มราคา',
    
    // Notifications
    harvestReminder: 'แจ้งเตือนการเก็บเกี่ยว',
    careReminder: 'แจ้งเตือนการดูแล',
    weatherAlert: 'แจ้งเตือนสภาพอากาศ',
    priceAlert: 'แจ้งเตือนราคา',
    
    // Weather
    temperature: 'อุณหภูมิ',
    humidity: 'ความชื้น',
    rainfall: 'ปริมาณฝน',
    windSpeed: 'ความเร็วลม',
    weatherForecast: 'พยากรณ์อากาศ',
    
    // AI Insights
    aiInsights: 'ข้อมูลเชิงลึก AI',
    yieldPrediction: 'พยากรณ์ผลผลิต',
    diseaseRisk: 'ความเสี่ยงโรค',
    optimization: 'การปรับปรุง',
    marketTrends: 'แนวโน้มตลาด',
    careRecommendations: 'คำแนะนำการดูแล',
    
    // Common
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    delete: 'ลบ',
    edit: 'แก้ไข',
    add: 'เพิ่ม',
    search: 'ค้นหา',
    filter: 'กรอง',
    refresh: 'รีเฟรช',
    loading: 'กำลังโหลด...',
    error: 'ข้อผิดพลาด',
    success: 'สำเร็จ',
    confirm: 'ยืนยัน',
    yes: 'ใช่',
    no: 'ไม่',
    ok: 'ตกลง',
    
    // Messages
    noData: 'ไม่มีข้อมูล',
    noFarms: 'ยังไม่มีข้อมูลไร่กาแฟ',
    noHarvests: 'ยังไม่มีข้อมูลการเก็บเกี่ยว',
    farmAdded: 'เพิ่มข้อมูลไร่สำเร็จ',
    harvestAdded: 'เพิ่มข้อมูลการเก็บเกี่ยวสำเร็จ',
    dataDeleted: 'ลบข้อมูลสำเร็จ',
    
    // Settings
    language: 'ภาษา',
    theme: 'ธีม',
    darkMode: 'โหมดมืด',
    lightMode: 'โหมดสว่าง',
    notifications: 'การแจ้งเตือน',
    enableNotifications: 'เปิดการแจ้งเตือน',
    
    // Forms
    required: 'จำเป็น',
    optional: 'ไม่จำเป็น',
    step: 'ขั้นตอน',
    next: 'ถัดไป',
    previous: 'ก่อนหน้า',
    finish: 'เสร็จสิ้น',
    
    // Photo
    takePhoto: 'ถ่ายรูป',
    selectFromLibrary: 'เลือกจากคลังภาพ',
    uploadPhoto: 'อัปโหลดรูปภาพ',
    photoGallery: 'แกลเลอรี่รูปภาพ',
    
    // Export
    exportCSV: 'ส่งออก CSV',
    exportPDF: 'ส่งออก PDF',
    exportData: 'ส่งออกข้อมูล',
    
    // Error Messages
    networkError: 'ข้อผิดพลาดเครือข่าย',
    authenticationError: 'ข้อผิดพลาดการยืนยันตัวตน',
    validationError: 'ข้อมูลไม่ถูกต้อง',
    permissionDenied: 'ไม่ได้รับอนุญาต',
    
    // Success Messages
    loginSuccess: 'เข้าสู่ระบบสำเร็จ',
    logoutSuccess: 'ออกจากระบบสำเร็จ',
    dataSaved: 'บันทึกข้อมูลสำเร็จ',
    photoUploaded: 'อัปโหลดรูปภาพสำเร็จ',
    
    // Units
    kilogram: 'กิโลกรัม',
    rai: 'ไร่',
    baht: 'บาท',
    celsius: 'องศาเซลเซียส',
    meter: 'เมตร',
    kilometer: 'กิโลเมตร',
  },

  en: {
    // Navigation
    home: 'Home',
    farms: 'My Farms',
    harvest: 'Harvest',
    price: 'Price & Analytics',
    profile: 'Profile',
    settings: 'Settings',

    // Auth
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    signInWithGoogle: 'Sign in with Google',
    signInWithFacebook: 'Sign in with Facebook',
    signInWithLine: 'Sign in with LINE',

    // Farm Management
    addFarm: 'Add Farm',
    farmName: 'Farm Name',
    area: 'Area (Rai)',
    soilType: 'Soil Type',
    waterSource: 'Water Source',
    province: 'Province',
    district: 'District',
    altitude: 'Altitude (meters)',
    variety: 'Variety',
    treeCount: 'Tree Count',
    plantingYear: 'Planting Year',
    notes: 'Notes',
    
    // Harvest
    harvestDate: 'Harvest Date',
    weight: 'Weight (kg)',
    income: 'Income (THB)',
    shift: 'Shift',
    morningShift: 'Morning',
    afternoonShift: 'Afternoon',
    addHarvest: 'Add Harvest',
    
    // Analytics
    totalIncome: 'Total Income',
    totalYield: 'Total Yield',
    averagePrice: 'Average Price',
    monthlyRevenue: 'Monthly Revenue',
    yieldTrend: 'Yield Trend',
    priceTrend: 'Price Trend',
    
    // Notifications
    harvestReminder: 'Harvest Reminder',
    careReminder: 'Care Reminder',
    weatherAlert: 'Weather Alert',
    priceAlert: 'Price Alert',
    
    // Weather
    temperature: 'Temperature',
    humidity: 'Humidity',
    rainfall: 'Rainfall',
    windSpeed: 'Wind Speed',
    weatherForecast: 'Weather Forecast',
    
    // AI Insights
    aiInsights: 'AI Insights',
    yieldPrediction: 'Yield Prediction',
    diseaseRisk: 'Disease Risk',
    optimization: 'Optimization',
    marketTrends: 'Market Trends',
    careRecommendations: 'Care Recommendations',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    
    // Messages
    noData: 'No Data',
    noFarms: 'No Coffee Farms Yet',
    noHarvests: 'No Harvest Data Yet',
    farmAdded: 'Farm Added Successfully',
    harvestAdded: 'Harvest Added Successfully',
    dataDeleted: 'Data Deleted Successfully',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    notifications: 'Notifications',
    enableNotifications: 'Enable Notifications',
    
    // Forms
    required: 'Required',
    optional: 'Optional',
    step: 'Step',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    
    // Photo
    takePhoto: 'Take Photo',
    selectFromLibrary: 'Select from Library',
    uploadPhoto: 'Upload Photo',
    photoGallery: 'Photo Gallery',
    
    // Export
    exportCSV: 'Export CSV',
    exportPDF: 'Export PDF',
    exportData: 'Export Data',
    
    // Error Messages
    networkError: 'Network Error',
    authenticationError: 'Authentication Error',
    validationError: 'Validation Error',
    permissionDenied: 'Permission Denied',
    
    // Success Messages
    loginSuccess: 'Login Successful',
    logoutSuccess: 'Logout Successful',
    dataSaved: 'Data Saved Successfully',
    photoUploaded: 'Photo Uploaded Successfully',
    
    // Units
    kilogram: 'Kilogram',
    rai: 'Rai',
    baht: 'Baht',
    celsius: 'Celsius',
    meter: 'Meter',
    kilometer: 'Kilometer',
  },

  zh: {
    // Navigation
    home: '首页',
    farms: '我的农场',
    harvest: '收获',
    price: '价格与分析',
    profile: '个人资料',
    settings: '设置',

    // Auth
    welcome: '欢迎',
    login: '登录',
    register: '注册',
    logout: '登出',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    forgotPassword: '忘记密码？',
    signInWithGoogle: '使用Google登录',
    signInWithFacebook: '使用Facebook登录',
    signInWithLine: '使用LINE登录',

    // Farm Management
    addFarm: '添加农场',
    farmName: '农场名称',
    area: '面积 (莱)',
    soilType: '土壤类型',
    waterSource: '水源',
    province: '省份',
    district: '区县',
    altitude: '海拔 (米)',
    variety: '品种',
    treeCount: '树木数量',
    plantingYear: '种植年份',
    notes: '备注',
    
    // Harvest
    harvestDate: '收获日期',
    weight: '重量 (公斤)',
    income: '收入 (泰铢)',
    shift: '班次',
    morningShift: '上午',
    afternoonShift: '下午',
    addHarvest: '添加收获',
    
    // Analytics
    totalIncome: '总收入',
    totalYield: '总产量',
    averagePrice: '平均价格',
    monthlyRevenue: '月收入',
    yieldTrend: '产量趋势',
    priceTrend: '价格趋势',
    
    // Notifications
    harvestReminder: '收获提醒',
    careReminder: '护理提醒',
    weatherAlert: '天气警报',
    priceAlert: '价格警报',
    
    // Weather
    temperature: '温度',
    humidity: '湿度',
    rainfall: '降雨量',
    windSpeed: '风速',
    weatherForecast: '天气预报',
    
    // AI Insights
    aiInsights: 'AI洞察',
    yieldPrediction: '产量预测',
    diseaseRisk: '疾病风险',
    optimization: '优化',
    marketTrends: '市场趋势',
    careRecommendations: '护理建议',
    
    // Common
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    filter: '筛选',
    refresh: '刷新',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    confirm: '确认',
    yes: '是',
    no: '否',
    ok: '确定',
    
    // Messages
    noData: '无数据',
    noFarms: '暂无咖啡农场',
    noHarvests: '暂无收获数据',
    farmAdded: '农场添加成功',
    harvestAdded: '收获添加成功',
    dataDeleted: '数据删除成功',
    
    // Settings
    language: '语言',
    theme: '主题',
    darkMode: '深色模式',
    lightMode: '浅色模式',
    notifications: '通知',
    enableNotifications: '启用通知',
    
    // Forms
    required: '必填',
    optional: '选填',
    step: '步骤',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    
    // Photo
    takePhoto: '拍照',
    selectFromLibrary: '从相册选择',
    uploadPhoto: '上传照片',
    photoGallery: '照片库',
    
    // Export
    exportCSV: '导出CSV',
    exportPDF: '导出PDF',
    exportData: '导出数据',
    
    // Error Messages
    networkError: '网络错误',
    authenticationError: '身份验证错误',
    validationError: '验证错误',
    permissionDenied: '权限被拒绝',
    
    // Success Messages
    loginSuccess: '登录成功',
    logoutSuccess: '登出成功',
    dataSaved: '数据保存成功',
    photoUploaded: '照片上传成功',
    
    // Units
    kilogram: '公斤',
    rai: '莱',
    baht: '泰铢',
    celsius: '摄氏度',
    meter: '米',
    kilometer: '公里',
  },
};

export class I18nService {
  private static currentLanguage: Language = 'th';
  private static listeners: ((language: Language) => void)[] = [];

  static getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  static setLanguage(language: Language): void {
    this.currentLanguage = language;
    this.notifyListeners();
    this.saveLanguagePreference();
  }

  static translate(key: string, language?: Language): string {
    const lang = language || this.currentLanguage;
    const keys = key.split('.');
    let value: any = translations[lang];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  }

  static t(key: string): string {
    return this.translate(key);
  }

  static getAvailableLanguages(): { code: Language; name: string; nativeName: string }[] {
    return [
      { code: 'th', name: 'Thai', nativeName: 'ไทย' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
    ];
  }

  static addLanguageChangeListener(listener: (language: Language) => void): void {
    this.listeners.push(listener);
  }

  static removeLanguageChangeListener(listener: (language: Language) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  private static saveLanguagePreference(): void {
    try {
      localStorage.setItem('coffee_app_language', this.currentLanguage);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }

  static loadLanguagePreference(): Language {
    try {
      const saved = localStorage.getItem('coffee_app_language');
      if (saved && ['th', 'en', 'zh'].includes(saved)) {
        return saved as Language;
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error);
    }
    
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('th')) return 'th';
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('zh')) return 'zh';
    
    return 'th'; // Default to Thai
  }

  static initialize(): void {
    const savedLanguage = this.loadLanguagePreference();
    this.setLanguage(savedLanguage);
  }

  // Format numbers based on language
  static formatNumber(number: number): string {
    const lang = this.currentLanguage;
    
    if (lang === 'th') {
      return number.toLocaleString('th-TH');
    } else if (lang === 'zh') {
      return number.toLocaleString('zh-CN');
    } else {
      return number.toLocaleString('en-US');
    }
  }

  // Format currency based on language
  static formatCurrency(amount: number): string {
    const lang = this.currentLanguage;
    
    if (lang === 'th') {
      return amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
    } else if (lang === 'zh') {
      return `¥${amount.toLocaleString('zh-CN')}`;
    } else {
      return `฿${amount.toLocaleString('en-US')}`;
    }
  }

  // Format date based on language
  static formatDate(date: Date): string {
    const lang = this.currentLanguage;
    
    if (lang === 'th') {
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (lang === 'zh') {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  // Get localized text for weather conditions
  static getWeatherCondition(condition: string): string {
    const weatherTranslations = {
      th: {
        sunny: 'แดดจ้า',
        cloudy: 'มีเมฆ',
        rainy: 'ฝนตก',
        stormy: 'พายุ',
        foggy: 'หมอก',
      },
      en: {
        sunny: 'Sunny',
        cloudy: 'Cloudy',
        rainy: 'Rainy',
        stormy: 'Stormy',
        foggy: 'Foggy',
      },
      zh: {
        sunny: '晴天',
        cloudy: '多云',
        rainy: '雨天',
        stormy: '暴风雨',
        foggy: '有雾',
      },
    };

    return weatherTranslations[this.currentLanguage][condition as keyof typeof weatherTranslations.th] || condition;
  }

  // Get localized text for coffee varieties
  static getCoffeeVariety(variety: string): string {
    const varietyTranslations = {
      th: {
        arabica: 'อาราบิก้า',
        robusta: 'โรบัสตา',
        liberica: 'ลิเบริก้า',
        excelsa: 'เอกเซลซา',
      },
      en: {
        arabica: 'Arabica',
        robusta: 'Robusta',
        liberica: 'Liberica',
        excelsa: 'Excelsa',
      },
      zh: {
        arabica: '阿拉比卡',
        robusta: '罗布斯塔',
        liberica: '利比里卡',
        excelsa: '艾克塞尔萨',
      },
    };

    return varietyTranslations[this.currentLanguage][variety.toLowerCase() as keyof typeof varietyTranslations.th] || variety;
  }
}

export default I18nService;
