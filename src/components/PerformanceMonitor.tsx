import { useEffect, useRef } from 'react';
import { toast } from 'sonner@2.0.3';

interface PerformanceMonitorProps {
  enabled?: boolean;
  maxExecutionTime?: number;
  onPerformanceIssue?: (details: { operation: string; duration: number }) => void;
}

export function PerformanceMonitor({ 
  enabled = true, 
  maxExecutionTime = 5000,
  onPerformanceIssue
}: PerformanceMonitorProps) {
  const operationTimersRef = useRef<Map<string, number>>(new Map());
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const lastPerformanceCheck = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    // Throttled frame rate monitoring - only check every few frames
    let frameSkipCounter = 0;
    const checkFrameRate = () => {
      frameSkipCounter++;
      
      // Only check every 10th frame to reduce overhead
      if (frameSkipCounter % 10 === 0) {
        frameCountRef.current++;
        const now = performance.now();
        
        // Only warn about frame drops > 100ms to reduce noise
        if (now - lastFrameTimeRef.current > 100) {
          console.warn(`Significant frame drop: ${now - lastFrameTimeRef.current}ms`);
        }
        
        lastFrameTimeRef.current = now;
      }
      
      requestAnimationFrame(checkFrameRate);
    };

    const animationId = requestAnimationFrame(checkFrameRate);

    // Monitor long tasks with throttling
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const now = performance.now();
          
          // Throttle performance issue reporting to once per second
          if (now - lastPerformanceCheck.current < 1000) {
            return;
          }
          
          for (const entry of list.getEntries()) {
            // Only report truly problematic tasks (>200ms)
            if (entry.duration > 200) {
              console.warn(`Critical long task: ${entry.duration}ms`);
              if (onPerformanceIssue) {
                onPerformanceIssue({
                  operation: entry.name || 'Long Task',
                  duration: entry.duration
                });
              }
              lastPerformanceCheck.current = now;
              break; // Only report one issue per check
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });

        return () => {
          observer.disconnect();
          cancelAnimationFrame(animationId);
        };
      } catch (err) {
        console.warn('Performance monitoring not available:', err);
      }
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [enabled, onPerformanceIssue]);

  // Utility functions for timing operations
  const startOperation = (operationName: string) => {
    if (!enabled) return;
    operationTimersRef.current.set(operationName, performance.now());
  };

  const endOperation = (operationName: string) => {
    if (!enabled) return;
    
    const startTime = operationTimersRef.current.get(operationName);
    if (startTime) {
      const duration = performance.now() - startTime;
      operationTimersRef.current.delete(operationName);
      
      if (duration > maxExecutionTime) {
        console.warn(`Operation "${operationName}" took ${duration}ms`);
        toast.warning(`Performance warning: ${operationName} took ${Math.round(duration)}ms`);
        
        if (onPerformanceIssue) {
          onPerformanceIssue({ operation: operationName, duration });
        }
      }
    }
  };

  // Expose timing functions globally for use in other components
  useEffect(() => {
    if (enabled) {
      (window as any).__performanceMonitor = {
        startOperation,
        endOperation
      };
    }

    return () => {
      if ((window as any).__performanceMonitor) {
        delete (window as any).__performanceMonitor;
      }
    };
  }, [enabled]);

  return null; // This is a utility component with no UI
}

// Utility hook for easy performance monitoring in components
export function usePerformanceTimer() {
  const startOperation = (name: string) => {
    if ((window as any).__performanceMonitor) {
      (window as any).__performanceMonitor.startOperation(name);
    }
  };

  const endOperation = (name: string) => {
    if ((window as any).__performanceMonitor) {
      (window as any).__performanceMonitor.endOperation(name);
    }
  };

  return { startOperation, endOperation };
}