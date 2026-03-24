// Performance Optimization Service for Coffee Farm Management App

export interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  renderTime: {
    average: number;
    max: number;
    min: number;
  };
  networkRequests: {
    total: number;
    failed: number;
    averageResponseTime: number;
  };
  cacheHitRate: number;
  bundleSize: number;
}

export interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  size: number; // Size in bytes
}

export class PerformanceService {
  private static cache = new Map<string, CacheItem>();
  private static metrics: PerformanceMetrics = {
    memoryUsage: { used: 0, total: 0, percentage: 0 },
    renderTime: { average: 0, max: 0, min: Infinity },
    networkRequests: { total: 0, failed: 0, averageResponseTime: 0 },
    cacheHitRate: 0,
    bundleSize: 0,
  };
  private static renderTimes: number[] = [];
  private static networkRequestTimes: number[] = [];

  // Cache management
  static setCache(key: string, data: any, ttl: number = 300000): void { // Default 5 minutes
    const size = this.calculateSize(data);
    
    // Check cache size limit (50MB)
    if (this.getTotalCacheSize() + size > 50 * 1024 * 1024) {
      this.evictOldCache();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      size,
    });
  }

  static getCache(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item is expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update cache hit rate
    this.updateCacheHitRate(true);
    return item.data;
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static evictOldCache(): void {
    const now = Date.now();
    const items = Array.from(this.cache.entries());
    
    // Sort by timestamp (oldest first)
    items.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest items until cache is under limit
    let totalSize = this.getTotalCacheSize();
    const maxSize = 40 * 1024 * 1024; // 40MB limit
    
    for (const [key, item] of items) {
      if (totalSize <= maxSize) break;
      
      this.cache.delete(key);
      totalSize -= item.size;
    }
  }

  static getTotalCacheSize(): number {
    let total = 0;
    for (const item of this.cache.values()) {
      total += item.size;
    }
    return total;
  }

  private static calculateSize(data: any): number {
    // Rough estimation of object size in bytes
    return JSON.stringify(data).length * 2; // Approximate bytes per character
  }

  private static updateCacheHitRate(hit: boolean): void {
    const total = this.metrics.networkRequests.total;
    const hits = this.metrics.cacheHitRate * total;
    
    if (hit) {
      this.metrics.cacheHitRate = (hits + 1) / (total + 1);
    } else {
      this.metrics.cacheHitRate = hits / Math.max(1, total);
    }
  }

  // Performance monitoring
  static startRenderTimer(): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.renderTimes.push(renderTime);
      
      // Keep only last 100 measurements
      if (this.renderTimes.length > 100) {
        this.renderTimes.shift();
      }
      
      this.updateRenderMetrics();
    };
  }

  private static updateRenderMetrics(): void {
    if (this.renderTimes.length === 0) return;
    
    const sum = this.renderTimes.reduce((a, b) => a + b, 0);
    const avg = sum / this.renderTimes.length;
    const max = Math.max(...this.renderTimes);
    const min = Math.min(...this.renderTimes);
    
    this.metrics.renderTime = {
      average: avg,
      max,
      min,
    };
  }

  static startNetworkTimer(): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.networkRequestTimes.push(responseTime);
      this.metrics.networkRequests.total++;
      
      // Keep only last 50 measurements
      if (this.networkRequestTimes.length > 50) {
        this.networkRequestTimes.shift();
      }
      
      this.updateNetworkMetrics();
    };
  }

  static recordNetworkFailure(): void {
    this.metrics.networkRequests.total++;
    this.metrics.networkRequests.failed++;
    this.updateNetworkMetrics();
  }

  private static updateNetworkMetrics(): void {
    if (this.networkRequestTimes.length === 0) return;
    
    const sum = this.networkRequestTimes.reduce((a, b) => a + b, 0);
    this.metrics.networkRequests.averageResponseTime = sum / this.networkRequestTimes.length;
  }

  static getMemoryUsage(): { used: number; total: number; percentage: number } {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const percentage = (used / total) * 100;
      
      return { used, total, percentage };
    }
    
    return { used: 0, total: 0, percentage: 0 };
  }

  static updateMemoryMetrics(): void {
    this.metrics.memoryUsage = this.getMemoryUsage();
  }

  // Performance optimization utilities
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func.apply(this, args);
      cache.set(key, result);
      
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        if (firstKey) {
          cache.delete(firstKey);
        }
      }
      
      return result;
    }) as T;
  }

  // Lazy loading utility
  static lazyLoad<T>(
    loader: () => Promise<T>
  ): () => Promise<T> {
    let instance: T | null = null;
    let loading: Promise<T> | null = null;
    
    return async (): Promise<T> => {
      if (instance) return instance;
      
      if (loading) return loading;
      
      loading = loader();
      
      try {
        instance = await loading;
        return instance;
      } finally {
        loading = null;
      }
    };
  }

  // Image optimization
  static optimizeImageForDisplay(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  // Bundle optimization
  static async getBundleSize(): Promise<number> {
    if (typeof performance !== 'undefined' && (performance as any).getEntriesByType) {
      const entries = (performance as any).getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (entries.length > 0) {
        return entries[0].transferSize;
      }
    }
    
    return 0;
  }

  static updateBundleMetrics(): void {
    this.getBundleSize().then(size => {
      this.metrics.bundleSize = size;
    });
  }

  // Get all performance metrics
  static getMetrics(): PerformanceMetrics {
    this.updateMemoryMetrics();
    return { ...this.metrics };
  }

  // Performance recommendations
  static getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getMetrics();
    
    // Memory recommendations
    if (metrics.memoryUsage.percentage > 80) {
      recommendations.push('การใช้หน่วยความจำสูง - ควรลดการใช้งานหรือรีสตาร์ทแอป');
    }
    
    // Render performance recommendations
    if (metrics.renderTime.average > 16) { // 60fps = 16ms per frame
      recommendations.push('ประสิทธิภาพการแสดงผลต่ำ - ควรเพิ่มประสิทธิภาพคอมโพเนนต์');
    }
    
    // Network recommendations
    if (metrics.networkRequests.averageResponseTime > 1000) {
      recommendations.push('การตอบสนองเครือข่ายช้า - ควรตรวจสอบการเชื่อมต่อหรือใช้แคช');
    }
    
    if (metrics.networkRequests.failed / metrics.networkRequests.total > 0.1) {
      recommendations.push('อัตราความล้มเหลวของเครือข่ายสูง - ควรตรวจสอบ API หรือการเชื่อมต่อ');
    }
    
    // Cache recommendations
    if (metrics.cacheHitRate < 0.5) {
      recommendations.push('อัตราแคชต่ำ - ควรเพิ่มการใช้แคชเพื่อลดการร้องข้อมูล');
    }
    
    // Bundle size recommendations
    if (metrics.bundleSize > 5 * 1024 * 1024) { // 5MB
      recommendations.push('ขนาดบันเดิลใหญ่ - ควรพิจารณาการแบ่งไฟล์หรือ lazy loading');
    }
    
    return recommendations;
  }

  // Automatic performance monitoring
  static startPerformanceMonitoring(): void {
    // Monitor memory usage every 10 seconds
    setInterval(() => {
      this.updateMemoryMetrics();
    }, 10000);
    
    // Monitor bundle size every minute
    setInterval(() => {
      this.updateBundleMetrics();
    }, 60000);
    
    // Log performance warnings
    setInterval(() => {
      const recommendations = this.getPerformanceRecommendations();
      if (recommendations.length > 0) {
        console.warn('Performance Recommendations:', recommendations);
      }
    }, 30000);
  }

  // Cleanup old data
  static cleanup(): void {
    this.clearCache();
    this.renderTimes = [];
    this.networkRequestTimes = [];
    this.metrics = {
      memoryUsage: { used: 0, total: 0, percentage: 0 },
      renderTime: { average: 0, max: 0, min: Infinity },
      networkRequests: { total: 0, failed: 0, averageResponseTime: 0 },
      cacheHitRate: 0,
      bundleSize: 0,
    };
  }

  // Performance profiling
  static async profileFunction<T extends (...args: any[]) => any>(
    func: T,
    ...args: Parameters<T>
  ): Promise<{ result: ReturnType<T>; executionTime: number }> {
    const startTime = performance.now();
    const result = await func.apply(this, args);
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    return { result, executionTime };
  }

  // Component performance optimization
  static shouldComponentUpdate(
    prevProps: any,
    nextProps: any,
    prevState: any,
    nextState: any
  ): boolean {
    // Simple shallow comparison
    return (
      !this.shallowEqual(prevProps, nextProps) ||
      !this.shallowEqual(prevState, nextState)
    );
  }

  static shallowEqual(obj1: any, obj2: any): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) {
      return false;
    }
    
    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    
    return true;
  }

  // Resource optimization
  static preloadResources(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => {
        return new Promise<void>((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = url;
          link.as = url.endsWith('.js') ? 'script' : 'image';
          link.onload = () => resolve();
          link.onerror = reject;
          document.head.appendChild(link);
        });
      })
    );
  }

  // Initialize performance service
  static initialize(): void {
    this.startPerformanceMonitoring();
    
    // Log initial metrics
    console.log('Performance Service Initialized');
    console.log('Initial Metrics:', this.getMetrics());
  }
}

export default PerformanceService;
