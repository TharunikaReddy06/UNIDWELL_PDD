/**
 * In-Memory Firestore Document TTL Cache
 * Prevents redundant Firestore read operations during UI re-renders and auth state changes.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class FirestoreCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTLMs: number;

  constructor(defaultTTLMs = 30000) { // 30 seconds default TTL
    this.defaultTTLMs = defaultTTLMs;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const expiry = Date.now() + (ttlMs ?? this.defaultTTLMs);
    this.cache.set(key, { data, expiry });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const firestoreCache = new FirestoreCache(30000);
