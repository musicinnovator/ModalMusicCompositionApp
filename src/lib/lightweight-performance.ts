// Lightweight performance monitoring that doesn't cause frame drops

export class LightweightPerformance {
  private static operationTimers: Map<string, number> = new Map();
  private static lastWarning = 0;
  private static isEnabled = true;

  // Start timing an operation
  static startTimer(operationName: string): void {
    if (!this.isEnabled) return;
    this.operationTimers.set(operationName, performance.now());
  }

  // End timing and optionally warn if too slow
  static endTimer(operationName: string, warnThreshold: number = 1000): number {
    if (!this.isEnabled) return 0;
    
    const startTime = this.operationTimers.get(operationName);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.operationTimers.delete(operationName);
    
    // Only warn if significant performance issue and not warned recently
    if (duration > warnThreshold && performance.now() - this.lastWarning > 5000) {
      console.warn(`Performance: ${operationName} took ${Math.round(duration)}ms`);
      this.lastWarning = performance.now();
    }
    
    return duration;
  }

  // Quick check if we should defer expensive operations
  static shouldDefer(): boolean {
    // Simple heuristic: defer if document is hidden or if it's been less than 100ms since last operation
    return document.hidden || (performance.now() - this.lastWarning < 100);
  }

  // Enable/disable monitoring
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.operationTimers.clear();
    }
  }

  // Get simple memory info if available
  static getMemoryInfo(): { used?: number; limit?: number; pressure: boolean } {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const limit = memory.jsHeapSizeLimit;
      return {
        used,
        limit,
        pressure: used / limit > 0.9
      };
    }
    return { pressure: false };
  }

  // Throttle function calls
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Debounce function calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }
}