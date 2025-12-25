/**
 * Performance monitoring utilities
 */

export function measurePerformance(label: string) {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - start;
      if (duration > 1000) {
        console.warn(`[Performance] ${label} took ${duration.toFixed(2)}ms`);
      } else {
        console.log(`[Performance] ${label} took ${duration.toFixed(2)}ms`);
      }
      return duration;
    },
  };
}

export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const timer = measurePerformance(label);
  try {
    const result = await fn();
    timer.end();
    return result;
  } catch (error) {
    timer.end();
    throw error;
  }
}

/**
 * Debounce function for search and other frequent operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll and resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
