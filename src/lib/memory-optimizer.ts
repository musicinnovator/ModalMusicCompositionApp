/**
 * Memory optimization utilities for the Fugue Suite
 * Manages memory usage, prevents leaks, and optimizes performance
 */

interface MemoryProfile {
  used: number;
  total: number;
  pressure: boolean;
  timestamp: number;
}

interface ComponentRegistry {
  [key: string]: {
    mounted: boolean;
    lastAccess: number;
    memoryUsage: number;
  };
}

export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private componentRegistry: ComponentRegistry = {};
  private memoryThreshold = 50 * 1024 * 1024; // 50MB threshold
  private cleanupInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  private initializeMonitoring(): void {
    try {
      // Set up periodic cleanup
      this.cleanupInterval = setInterval(() => {
        this.performCleanup();
      }, 30000); // Every 30 seconds

      // Monitor performance entries if available
      if (typeof PerformanceObserver !== 'undefined') {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.duration > 100) { // Log operations taking > 100ms
              console.warn(`⚠️ Slow operation detected: ${entry.name} took ${entry.duration}ms`);
            }
          });
        });

        try {
          this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
        } catch (e) {
          // Silently fail if not supported
        }
      }

      // Listen for memory pressure warnings
      if ('memory' in performance && 'onmemorywarning' in window) {
        (window as any).addEventListener('memorywarning', () => {
          console.warn('🚨 Memory pressure detected - performing aggressive cleanup');
          this.performAggressiveCleanup();
        });
      }

    } catch (error) {
      console.warn('Memory monitoring initialization failed:', error);
    }
  }

  /**
   * Register a component for memory tracking
   */
  registerComponent(componentName: string): void {
    try {
      this.componentRegistry[componentName] = {
        mounted: true,
        lastAccess: Date.now(),
        memoryUsage: 0
      };
    } catch (error) {
      console.error('Failed to register component:', error);
    }
  }

  /**
   * Unregister a component and clean up its resources
   */
  unregisterComponent(componentName: string): void {
    try {
      if (this.componentRegistry[componentName]) {
        this.componentRegistry[componentName].mounted = false;
        // Cleanup will happen in next cycle
      }
    } catch (error) {
      console.error('Failed to unregister component:', error);
    }
  }

  /**
   * Update component access time
   */
  touchComponent(componentName: string): void {
    try {
      if (this.componentRegistry[componentName]) {
        this.componentRegistry[componentName].lastAccess = Date.now();
      }
    } catch (error) {
      console.error('Failed to touch component:', error);
    }
  }

  /**
   * Get current memory profile
   */
  getMemoryProfile(): MemoryProfile {
    try {
      // Try to get actual memory info if available
      if ('memory' in performance) {
        const perfMemory = (performance as any).memory;
        return {
          used: perfMemory.usedJSHeapSize || 0,
          total: perfMemory.totalJSHeapSize || 0,
          pressure: perfMemory.usedJSHeapSize > this.memoryThreshold,
          timestamp: Date.now()
        };
      }

      // Fallback estimation based on component count
      const componentCount = Object.keys(this.componentRegistry).length;
      const estimated = componentCount * 1024 * 1024; // Rough estimate

      return {
        used: estimated,
        total: estimated * 2,
        pressure: estimated > this.memoryThreshold,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to get memory profile:', error);
      return {
        used: 0,
        total: 0,
        pressure: false,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Optimize theme data by removing duplicates and compressing
   */
  optimizeThemeData<T extends number[]>(theme: T): T {
    try {
      if (!Array.isArray(theme) || theme.length === 0) {
        return theme;
      }

      // Remove consecutive duplicates
      const optimized = theme.filter((note, index) => {
        return index === 0 || note !== theme[index - 1];
      });

      // If we removed duplicates, log it
      if (optimized.length < theme.length) {
        console.log(`🎵 Theme optimized: ${theme.length} → ${optimized.length} notes (removed ${theme.length - optimized.length} duplicates)`);
      }

      return optimized as T;
    } catch (error) {
      console.error('Theme optimization failed:', error);
      return theme;
    }
  }

  /**
   * Optimize Bach variables by limiting total notes
   */
  optimizeBachVariables(variables: any): any {
    try {
      const MAX_NOTES_PER_VARIABLE = 32;
      const MAX_TOTAL_NOTES = 256;

      let totalNotes = 0;
      const optimized = { ...variables };

      Object.keys(optimized).forEach(key => {
        if (Array.isArray(optimized[key])) {
          // Limit individual variable length
          if (optimized[key].length > MAX_NOTES_PER_VARIABLE) {
            optimized[key] = optimized[key].slice(0, MAX_NOTES_PER_VARIABLE);
            console.log(`✂️ Trimmed ${key} to ${MAX_NOTES_PER_VARIABLE} notes`);
          }
          totalNotes += optimized[key].length;
        }
      });

      // If total exceeds limit, trim proportionally
      if (totalNotes > MAX_TOTAL_NOTES) {
        const reduction = MAX_TOTAL_NOTES / totalNotes;
        Object.keys(optimized).forEach(key => {
          if (Array.isArray(optimized[key])) {
            const newLength = Math.floor(optimized[key].length * reduction);
            optimized[key] = optimized[key].slice(0, Math.max(1, newLength));
          }
        });
        console.log(`🗜️ Bach variables optimized: ${totalNotes} → ${MAX_TOTAL_NOTES} total notes`);
      }

      return optimized;
    } catch (error) {
      console.error('Bach variables optimization failed:', error);
      return variables;
    }
  }

  /**
   * Create optimized callback function with cleanup
   */
  createOptimizedCallback<T extends (...args: any[]) => any>(
    callback: T,
    componentName: string,
    debounceMs: number = 100
  ): T {
    try {
      let timeoutId: NodeJS.Timeout | null = null;
      let lastCall = 0;

      const optimizedCallback = ((...args: any[]) => {
        const now = Date.now();
        
        // Touch component to indicate activity
        this.touchComponent(componentName);

        // Debounce rapid calls
        if (now - lastCall < debounceMs) {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            lastCall = Date.now();
            callback(...args);
          }, debounceMs);
        } else {
          lastCall = now;
          callback(...args);
        }
      }) as T;

      return optimizedCallback;
    } catch (error) {
      console.error('Failed to create optimized callback:', error);
      return callback;
    }
  }

  /**
   * Perform regular cleanup
   */
  private performCleanup(): void {
    try {
      const now = Date.now();
      const INACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

      // Clean up inactive components
      Object.keys(this.componentRegistry).forEach(componentName => {
        const component = this.componentRegistry[componentName];
        if (!component.mounted || (now - component.lastAccess) > INACTIVE_THRESHOLD) {
          delete this.componentRegistry[componentName];
        }
      });

      // Force garbage collection if available
      if ('gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc();
        } catch (e) {
          // Silently ignore GC errors
        }
      }

      const memoryProfile = this.getMemoryProfile();
      if (memoryProfile.pressure) {
        console.warn('🚨 Memory pressure detected during cleanup');
        this.performAggressiveCleanup();
      }

    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Perform aggressive cleanup during memory pressure
   */
  private performAggressiveCleanup(): void {
    try {
      // Clear all non-essential cached data
      Object.keys(this.componentRegistry).forEach(componentName => {
        if (!this.componentRegistry[componentName].mounted) {
          delete this.componentRegistry[componentName];
        }
      });

      // Clear browser caches if possible
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('temp') || name.includes('cache')) {
              caches.delete(name);
            }
          });
        });
      }

      // Clear sessionStorage of non-essential items
      if (typeof Storage !== 'undefined' && sessionStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('temp') || key.includes('cache'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
      }

      console.log('🧹 Aggressive cleanup completed');
    } catch (error) {
      console.error('Aggressive cleanup failed:', error);
    }
  }

  /**
   * Optimize array operations
   */
  optimizeArray<T>(array: T[], maxLength: number = 100): T[] {
    try {
      if (!Array.isArray(array)) return array;
      
      if (array.length > maxLength) {
        console.log(`✂️ Array optimized: ${array.length} → ${maxLength} items`);
        return array.slice(0, maxLength);
      }
      
      return array;
    } catch (error) {
      console.error('Array optimization failed:', error);
      return array;
    }
  }

  /**
   * Cleanup and shutdown
   */
  destroy(): void {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      if (this.performanceObserver) {
        this.performanceObserver.disconnect();
        this.performanceObserver = null;
      }

      this.componentRegistry = {};
      console.log('🔌 Memory optimizer destroyed');
    } catch (error) {
      console.error('Memory optimizer destruction failed:', error);
    }
  }

  /**
   * Get memory usage statistics
   */
  getStats(): {
    components: number;
    memoryProfile: MemoryProfile;
    registeredComponents: string[];
  } {
    return {
      components: Object.keys(this.componentRegistry).length,
      memoryProfile: this.getMemoryProfile(),
      registeredComponents: Object.keys(this.componentRegistry)
    };
  }
}

// Export singleton instance
export const memoryOptimizer = MemoryOptimizer.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    memoryOptimizer.destroy();
  });
}

/**
 * HOC for memory-optimized components
 */
export function withMemoryOptimization<P extends object>(
  Component: any,
  componentName: string
) {
  return function MemoryOptimizedComponent(props: P) {
    const optimizer = MemoryOptimizer.getInstance();
    
    // Use useEffect-like pattern for component lifecycle
    if (typeof window !== 'undefined') {
      optimizer.registerComponent(componentName);
      
      // Cleanup on unmount (best effort)
      const cleanup = () => optimizer.unregisterComponent(componentName);
      if ('addEventListener' in window) {
        window.addEventListener('beforeunload', cleanup);
      }
    }

    optimizer.touchComponent(componentName);

    // Return the component with props
    return Component(props);
  };
}

// Utility for creating memory-safe callbacks
export function createMemorySafeCallback<T extends (...args: any[]) => any>(
  callback: T,
  componentName: string,
  debounceMs: number = 100
): T {
  return memoryOptimizer.createOptimizedCallback(callback, componentName, debounceMs);
}