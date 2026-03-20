import React, { useCallback, useMemo } from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static start(label: string): void {
    this.timers.set(label, performance.now());
  }

  static end(label: string): number {
    const start = this.timers.get(label);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    this.timers.delete(label);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

// Memoized Thai year conversion with caching
const thaiYearCache = new Map<string, string>();
const maxCacheSize = 1000;

export const toThaiYearCached = (dateValue?: string | Date | null): string => {
  if (!dateValue) return '';
  
  const cacheKey = typeof dateValue === 'string' ? dateValue : dateValue.toISOString();
  
  if (thaiYearCache.has(cacheKey)) {
    return thaiYearCache.get(cacheKey)!;
  }

  try {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const year = date.getFullYear();
    if (Number.isNaN(year)) return '';
    
    const thaiYear = String(year + 543);
    
    // Limit cache size
    if (thaiYearCache.size >= maxCacheSize) {
      const firstKey = thaiYearCache.keys().next().value;
      if (firstKey) thaiYearCache.delete(firstKey);
    }
    
    thaiYearCache.set(cacheKey, thaiYear);
    return thaiYear;
  } catch {
    return '';
  }
};

// Memoized shift normalization
const shiftCache = new Map<string, string>();

export const normalizeShiftCached = (shift?: string | null): string => {
  if (!shift) return '';
  
  if (shiftCache.has(shift)) {
    return shiftCache.get(shift)!;
  }

  const normalized = shift.toLowerCase();
  
  if (shiftCache.size >= maxCacheSize) {
    const firstKey = shiftCache.keys().next().value;
    if (firstKey) shiftCache.delete(firstKey);
  }
  
  shiftCache.set(shift, normalized);
  return normalized;
};

// Optimized array filtering with early termination
export const filterArrayOptimized = <T>(
  array: T[],
  predicate: (item: T, index: number) => boolean,
  limit?: number
): T[] => {
  if (limit !== undefined && limit <= 0) return [];
  
  const result: T[] = [];
  const arrayLength = array.length;
  
  for (let i = 0; i < arrayLength; i++) {
    if (predicate(array[i], i)) {
      result.push(array[i]);
      
      if (limit !== undefined && result.length >= limit) {
        break;
      }
    }
  }
  
  return result;
};

// Debounced function for search input
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttled function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling utilities
export interface VirtualScrollItem {
  id: string;
  height: number;
  data: any;
}

export class VirtualScrollManager {
  private itemHeights: Map<string, number> = new Map();
  private containerHeight: number = 0;
  private scrollTop: number = 0;
  private overscan: number = 5;

  setContainerHeight(height: number): void {
    this.containerHeight = height;
  }

  setScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  setItemHeight(id: string, height: number): void {
    this.itemHeights.set(id, height);
  }

  getVisibleItems<T extends VirtualScrollItem>(
    items: T[],
    itemHeight: number
  ): { startIndex: number; endIndex: number; visibleItems: T[] } {
    const startIndex = Math.max(0, Math.floor(this.scrollTop / itemHeight) - this.overscan);
    const visibleCount = Math.ceil(this.containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + this.overscan * 2);

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
    };
  }

  getTotalHeight(itemCount: number, itemHeight: number): number {
    return itemCount * itemHeight;
  }
}

// React hooks for performance optimization
export const usePerformanceMonitor = (label: string) => {
  return useCallback((fn: () => void) => {
    PerformanceMonitor.measure(label, fn);
  }, [label]);
};

export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  return useMemo(() => debounce(callback, delay), [callback, delay]) as T;
};

export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T => {
  return useMemo(() => throttle(callback, limit), [callback, limit]) as T;
};

// Memory usage monitoring
export const getMemoryUsage = (): { used: number; total: number } => {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
    };
  }
  
  return { used: 0, total: 0 };
};

export const logMemoryUsage = (label: string): void => {
  if (process.env.NODE_ENV === 'development') {
    const { used, total } = getMemoryUsage();
    console.log(`💾 ${label} - Memory: ${(used / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB`);
  }
};

// Batch state updates
export const batchUpdates = <T>(updates: (() => void)[]): void => {
  updates.forEach(update => update());
};

// Optimized re-render prevention
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps) as T;
};

// Lazy initialization
export const useLazyInit = <T>(factory: () => T): (() => T) => {
  const ref = React.useRef<T | null>(null);
  
  return useCallback(() => {
    if (!ref.current) {
      ref.current = factory();
    }
    return ref.current;
  }, [factory]);
};
