/**
 * Performance utilities for optimizing React renders and DOM operations
 */

/**
 * Schedules a callback to run after the next paint, with optional focus handling
 * Replaces multiple requestAnimationFrame calls with a single optimized one
 */
export function scheduleAfterPaint(
  callback: () => void,
  options?: {
    focusElement?: HTMLElement | null;
    parseAmounts?: () => void;
  },
) {
  requestAnimationFrame(() => {
    // Focus element if provided
    if (options?.focusElement) {
      options.focusElement.focus();
    }

    // Execute the main callback
    callback();

    // Parse amounts if provided
    if (options?.parseAmounts) {
      options.parseAmounts();
    }
  });
}

/**
 * Debounced function to prevent excessive calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Performance measurement utility
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  if (typeof performance !== "undefined" && performance.mark) {
    performance.mark(`${name}-start`);
    const result = fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    return result;
  }
  return fn();
}
