/**
 * Retry Utility with Exponential Backoff
 * Handles transient network glitches during Firebase / External API calls seamlessly.
 */

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 300
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      // Check if error is network/transient
      const isTransient = 
        !error.status || 
        error.code === 'unavailable' || 
        error.code === 'deadline-exceeded' ||
        error.message?.includes('network') ||
        error.message?.includes('Failed to fetch');

      if (!isTransient && attempt > 1) {
        throw error;
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}
