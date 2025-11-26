/**
 * Get a cached short URL if it exists and is not expired
 */
export declare function getCachedUrl(service: string, originalUrl: string): string | null;
/**
 * Store a shortened URL in the cache
 */
export declare function setCachedUrl(service: string, originalUrl: string, shortUrl: string): void;
/**
 * Get cache statistics
 */
export declare function getCacheStats(): {
    totalEntries: number;
    oldestEntry: string | null;
    newestEntry: string | null;
    lastCleanup: string;
};
/**
 * Initialize cache (run cleanup on startup)
 */
export declare function initializeCache(): void;
