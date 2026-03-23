// Security Service for Coffee Farm Management App

export interface SecurityAudit {
  timestamp: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'data' | 'network' | 'storage' | 'permissions';
  message: string;
  recommendation: string;
  resolved: boolean;
}

export interface SecurityMetrics {
  authenticationScore: number; // 0-100
  dataProtectionScore: number; // 0-100
  networkSecurityScore: number; // 0-100
  overallScore: number; // 0-100
  lastAudit: string;
  openIssues: number;
}

export class SecurityService {
  private static auditLog: SecurityAudit[] = [];
  
  // Authentication security
  static validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isValid: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // Length check
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push('รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 15;
    } else {
      feedback.push('ควรมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 15;
    } else {
      feedback.push('ควรมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว');
    }
    
    // Number check
    if (/\d/.test(password)) {
      score += 15;
    } else {
      feedback.push('ควรมีตัวเลขอย่างน้อย 1 ตัว');
    }
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 15;
    } else {
      feedback.push('ควรมีอักขระพิเศษอย่างน้อย 1 ตัว');
    }
    
    // Common patterns check
    const commonPatterns = [
      'password', '123456', 'qwerty', 'admin', 'coffee', 'farm'
    ];
    
    if (commonPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    )) {
      score -= 20;
      feedback.push('หลีกเลี่ยงรหัสผ่านที่พบได้ทั่วไป');
    }
    
    // Sequential characters check
    if (/(.)\1{2,}/.test(password)) { // Repeated characters
      score -= 10;
      feedback.push('หลีกเลี่ยงตัวอักษรที่ซ้ำกันติดต่อกัน');
    }
    
    const isValid = score >= 60;
    
    return { score: Math.max(0, score), feedback, isValid };
  }
  
  // Data validation
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }
  
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^0[6-9]\d{8}$/; // Thai mobile numbers
    return phoneRegex.test(phone);
  }
  
  // Session security
  static isSessionValid(): boolean {
    try {
      const sessionStart = localStorage.getItem('session_start');
      const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionStart) {
        const elapsed = Date.now() - parseInt(sessionStart);
        return elapsed < sessionTimeout;
      }
    } catch (error) {
      console.warn('Session validation error:', error);
    }
    
    return false;
  }
  
  static extendSession(): void {
    try {
      localStorage.setItem('session_start', Date.now().toString());
    } catch (error) {
      console.warn('Failed to extend session:', error);
    }
  }
  
  // Data encryption (basic)
  static encryptData(data: string): string {
    try {
      // Simple XOR encryption for demonstration
      // In production, use proper encryption libraries
      const key = 'coffee-farm-2024';
      let encrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        const charCode = data.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode ^ keyChar);
      }
      
      return btoa(encrypted); // Base64 encode
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }
  
  static decryptData(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData); // Base64 decode
      const key = 'coffee-farm-2024';
      let decrypted = '';
      
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode ^ keyChar);
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData;
    }
  }
  
  // Security audit
  static performSecurityAudit(): SecurityAudit[] {
    const audits: SecurityAudit[] = [];
    
    // Authentication audit
    audits.push(...this.auditAuthentication());
    
    // Data protection audit
    audits.push(...this.auditDataProtection());
    
    // Network security audit
    audits.push(...this.auditNetworkSecurity());
    
    // Storage security audit
    audits.push(...this.auditStorageSecurity());
    
    // Permission audit
    audits.push(...this.auditPermissions());
    
    this.auditLog = audits;
    return audits;
  }
  
  private static auditAuthentication(): SecurityAudit[] {
    const audits: SecurityAudit[] = [];
    
    // Check session timeout
    if (!this.isSessionValid()) {
      audits.push({
        timestamp: new Date().toISOString(),
        level: 'high',
        category: 'authentication',
        message: 'Session expired or invalid',
        recommendation: 'Implement proper session management',
        resolved: false,
      });
    }
    
    // Check for stored credentials
    try {
      const storedCredentials = localStorage.getItem('credentials');
      if (storedCredentials) {
        audits.push({
          timestamp: new Date().toISOString(),
          level: 'critical',
          category: 'authentication',
          message: 'Credentials stored in localStorage',
          recommendation: 'Remove stored credentials and use secure tokens',
          resolved: false,
        });
      }
    } catch (error) {
      // localStorage not available
    }
    
    return audits;
  }
  
  private static auditDataProtection(): SecurityAudit[] {
    const audits: SecurityAudit[] = [];
    
    // Check for sensitive data in URL
    if (window.location.search.includes('password') || 
        window.location.search.includes('token')) {
      audits.push({
        timestamp: new Date().toISOString(),
        level: 'high',
        category: 'data',
        message: 'Sensitive data in URL parameters',
        recommendation: 'Remove sensitive data from URLs',
        resolved: false,
      });
    }
    
    // Check console for sensitive data
    const originalConsole = console.log;
    let hasSensitiveData = false;
    
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('password') || message.includes('token')) {
        hasSensitiveData = true;
      }
      originalConsole.apply(console, args);
    };
    
    setTimeout(() => {
      console.log = originalConsole;
      if (hasSensitiveData) {
        audits.push({
          timestamp: new Date().toISOString(),
          level: 'medium',
          category: 'data',
          message: 'Sensitive data logged to console',
          recommendation: 'Remove sensitive data from console logs',
          resolved: false,
        });
      }
    }, 100);
    
    return audits;
  }
  
  private static auditNetworkSecurity(): SecurityAudit[] {
    const audits: SecurityAudit[] = [];
    
    // Check for HTTP requests (insecure)
    if (window.location.protocol === 'http:') {
      audits.push({
        timestamp: new Date().toISOString(),
        level: 'high',
        category: 'network',
        message: 'Application running on HTTP',
        recommendation: 'Use HTTPS for all communications',
        resolved: false,
      });
    }
    
    // Check for mixed content
    if (window.location.protocol === 'https:') {
      // This would require checking all loaded resources
      // For simplicity, we'll just note that it should be checked
    }
    
    return audits;
  }
  
  private static auditStorageSecurity(): SecurityAudit[] {
    const audits: SecurityAudit[] = [];
    
    // Check localStorage for sensitive data
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('password') || key.includes('token'))) {
          audits.push({
            timestamp: new Date().toISOString(),
            level: 'high',
            category: 'storage',
            message: `Sensitive data stored in localStorage: ${key}`,
            recommendation: 'Use secure storage for sensitive data',
            resolved: false,
          });
        }
      }
    } catch (error) {
      // localStorage not available
    }
    
    return audits;
  }
  
  private static auditPermissions(): SecurityAudit[] {
    const audits: SecurityAudit[] = [];
    
    // Check for excessive permissions
    // This would require checking app permissions
    // For now, we'll just note that it should be monitored
    
    return audits;
  }
  
  // Security metrics
  static getSecurityMetrics(): SecurityMetrics {
    const audits = this.auditLog.length > 0 ? this.auditLog : this.performSecurityAudit();
    
    const authenticationIssues = audits.filter(a => a.category === 'authentication').length;
    const dataIssues = audits.filter(a => a.category === 'data').length;
    const networkIssues = audits.filter(a => a.category === 'network').length;
    
    const authenticationScore = Math.max(0, 100 - (authenticationIssues * 20));
    const dataProtectionScore = Math.max(0, 100 - (dataIssues * 15));
    const networkSecurityScore = Math.max(0, 100 - (networkIssues * 25));
    
    const overallScore = Math.round(
      (authenticationScore + dataProtectionScore + networkSecurityScore) / 3
    );
    
    const criticalIssues = audits.filter(a => a.level === 'critical').length;
    const highIssues = audits.filter(a => a.level === 'high').length;
    
    return {
      authenticationScore,
      dataProtectionScore,
      networkSecurityScore,
      overallScore,
      lastAudit: new Date().toISOString(),
      openIssues: criticalIssues + highIssues,
    };
  }
  
  // Security recommendations
  static getSecurityRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getSecurityMetrics();
    
    if (metrics.authenticationScore < 80) {
      recommendations.push('ปรับปรุงความปลอดภัยการยืนยันตัวตน');
      recommendations.push('ใช้การยืนยันตัวตนแบบ multi-factor');
      recommendations.push('ตั้งค่า session timeout ที่เหมาะสม');
    }
    
    if (metrics.dataProtectionScore < 80) {
      recommendations.push('เข้ารหัสข้อมูลที่ละเอียด');
      recommendations.push('หลีกเลี่ยงการจัดเก็บข้อมูลที่ละเอียดใน client-side');
      recommendations.push('ใช้ HTTPS สำหรับการสื่อสารทั้งหมด');
    }
    
    if (metrics.networkSecurityScore < 80) {
      recommendations.push('ใช้ HTTPS สำหรับการสื่อสารทั้งหมด');
      recommendations.push('ตรวจสอบการร้องข้อมูลที่เข้ามา');
      recommendations.push('ใช้ CORS อย่างเหมาะสม');
    }
    
    if (metrics.openIssues > 0) {
      recommendations.push('แก้ไขปัญหาความปลอดภัยที่ค้นพบ');
      recommendations.push('ทำ security audit เป็นประจำ');
    }
    
    return recommendations;
  }
  
  // Input validation helpers
  static validateFarmData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('ชื่อไร่ต้องไม่ว่างเปล่า');
    }
    
    if (data.area && (data.area < 0 || data.area > 10000)) {
      errors.push('พื้นที่ต้องอยู่ระหว่าง 0-10,000 ไร่');
    }
    
    if (data.altitude && (data.altitude < 0 || data.altitude > 3000)) {
      errors.push('ระดับความสูงต้องอยู่ระหว่าง 0-3,000 เมตร');
    }
    
    if (data.tree_count && (data.tree_count < 0 || data.tree_count > 100000)) {
      errors.push('จำนวนต้นต้องอยู่ระหว่าง 0-100,000 ต้น');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  static validateHarvestData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.harvest_date) {
      errors.push('วันที่เก็บเกี่ยวต้องไม่ว่างเปล่า');
    }
    
    if (!data.weight_kg || data.weight_kg <= 0 || data.weight_kg > 10000) {
      errors.push('น้ำหนักต้องอยู่ระหว่าง 0-10,000 กิโลกรัม');
    }
    
    if (!data.income || data.income < 0 || data.income > 1000000) {
      errors.push('รายได้ต้องอยู่ระหว่าง 0-1,000,000 บาท');
    }
    
    if (!data.shift || !['morning', 'afternoon'].includes(data.shift)) {
      errors.push('กะต้องเป็นเช้าหรือบ่าย');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  // Rate limiting
  private static requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  static checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  // Initialize security service
  static initialize(): void {
    // Perform initial security audit
    this.performSecurityAudit();
    
    // Set up session monitoring
    setInterval(() => {
      if (!this.isSessionValid()) {
        console.warn('Session expired - please log in again');
      }
    }, 60000); // Check every minute
    
    console.log('Security Service Initialized');
  }
}

export default SecurityService;
