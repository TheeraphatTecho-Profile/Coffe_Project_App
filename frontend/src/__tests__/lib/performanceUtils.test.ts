import {
  PerformanceMonitor,
  toThaiYearCached,
  normalizeShiftCached,
  filterArrayOptimized,
  debounce,
  throttle,
  VirtualScrollManager,
  getMemoryUsage,
  logMemoryUsage,
} from '../../lib/performanceUtils';

// Mock performance.now
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

describe('PerformanceUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockClear();
    // Reset timers for each test
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('PerformanceMonitor', () => {
    it('should measure execution time', () => {
      mockPerformanceNow.mockReturnValue(100);
      
      const result = PerformanceMonitor.measure('test-label', () => {
        mockPerformanceNow.mockReturnValue(150);
        return 'test-result';
      });
      
      expect(result).toBe('test-result');
    });

    it('should handle async measurement', async () => {
      mockPerformanceNow.mockReturnValue(200);
      
      const result = await PerformanceMonitor.measureAsync('async-test', async () => {
        mockPerformanceNow.mockReturnValue(300);
        return 'async-result';
      });
      
      expect(result).toBe('async-result');
    });

    it('should handle missing end timer', () => {
      mockPerformanceNow.mockReturnValue(100);
      
      const duration = PerformanceMonitor.end('non-existent-timer');
      expect(duration).toBe(0);
    });
  });

  describe('toThaiYearCached', () => {
    it('should cache Thai year conversion', () => {
      const date = '2024-03-15';
      
      const result1 = toThaiYearCached(date);
      const result2 = toThaiYearCached(date);
      
      expect(result1).toBe('2567');
      expect(result2).toBe('2567');
      expect(result1).toBe(result2);
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-03-15');
      
      const result = toThaiYearCached(date);
      expect(result).toBe('2567');
    });

    it('should return empty string for invalid input', () => {
      expect(toThaiYearCached(null)).toBe('');
      expect(toThaiYearCached(undefined)).toBe('');
      expect(toThaiYearCached('invalid-date')).toBe('');
    });
  });

  describe('normalizeShiftCached', () => {
    it('should cache shift normalization', () => {
      const shift = 'MORNING';
      
      const result1 = normalizeShiftCached(shift);
      const result2 = normalizeShiftCached(shift);
      
      expect(result1).toBe('morning');
      expect(result2).toBe('morning');
      expect(result1).toBe(result2);
    });

    it('should handle empty input', () => {
      expect(normalizeShiftCached(null)).toBe('');
      expect(normalizeShiftCached(undefined)).toBe('');
      expect(normalizeShiftCached('')).toBe('');
    });
  });

  describe('filterArrayOptimized', () => {
    it('should filter array with early termination', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const predicate = (n: number) => n % 2 === 0;
      
      const result = filterArrayOptimized(array, predicate, 2);
      
      expect(result).toEqual([2, 4]);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should handle limit of 0', () => {
      const array = [1, 2, 3];
      const predicate = (n: number) => true;
      
      const result = filterArrayOptimized(array, predicate, 0);
      // The implementation checks limit <= 0 and returns empty array
      expect(result).toEqual([]);
    });

    it('should filter without limit', () => {
      const array = [1, 2, 3, 4, 5];
      const predicate = (n: number) => n > 3;
      
      const result = filterArrayOptimized(array, predicate);
      expect(result).toEqual([4, 5]);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3');
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn('call1');
      throttledFn('call2');
      throttledFn('call3');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');
      
      jest.advanceTimersByTime(100);
      
      throttledFn('call4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('call4');
    });
  });

  describe('VirtualScrollManager', () => {
    let manager: VirtualScrollManager;

    beforeEach(() => {
      manager = new VirtualScrollManager();
    });

    it('should calculate visible items correctly', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        height: 50,
        data: { index: i },
      }));

      manager.setContainerHeight(200);
      manager.setScrollTop(100);

      const result = manager.getVisibleItems(items, 50);

      expect(result.startIndex).toBeGreaterThanOrEqual(0);
      expect(result.endIndex).toBeGreaterThan(result.startIndex);
      expect(result.visibleItems.length).toBeLessThanOrEqual(items.length);
    });

    it('should calculate total height', () => {
      const height = manager.getTotalHeight(10, 50);
      expect(height).toBe(500);
    });
  });

  describe('getMemoryUsage', () => {
    it('should return memory usage when available', () => {
      // Mock performance.memory
      (global.performance as any).memory = {
        usedJSHeapSize: 50000000,
        totalJSHeapSize: 100000000,
      };

      const usage = getMemoryUsage();
      expect(usage.used).toBe(50000000);
      expect(usage.total).toBe(100000000);
    });

    it('should return zeros when memory API unavailable', () => {
      delete (global.performance as any).memory;

      const usage = getMemoryUsage();
      expect(usage.used).toBe(0);
      expect(usage.total).toBe(0);
    });
  });

  describe('logMemoryUsage', () => {
    it('should not throw when logging memory', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      expect(() => logMemoryUsage('test')).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });
});
