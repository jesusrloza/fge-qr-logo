import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createLogger } from './logger.js';
const logger = createLogger('UrlCache');
// Cache configuration
const CACHE_TTL_DAYS = 30;
const MAX_CACHE_ENTRIES = 500;
const CACHE_VERSION = 1;
// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    return dataDir;
}
// Get cache file path
function getCacheFilePath() {
    const dataDir = ensureDataDir();
    return path.join(dataDir, 'url-cache.json');
}
// Generate cache key from service and URL
function generateCacheKey(service, originalUrl) {
    const hash = crypto.createHash('sha256');
    hash.update(`${service}:${originalUrl}`);
    return hash.digest('hex').substring(0, 16); // Use first 16 chars for brevity
}
// Load cache from disk
function loadCache() {
    const cachePath = getCacheFilePath();
    try {
        if (fs.existsSync(cachePath)) {
            const data = fs.readFileSync(cachePath, 'utf8');
            const cache = JSON.parse(data);
            // Version check for future migrations
            if (cache.metadata?.version !== CACHE_VERSION) {
                logger.warn('Cache version mismatch, creating new cache');
                return createEmptyCache();
            }
            return cache;
        }
    }
    catch (error) {
        logger.error('Error loading cache, creating new cache', { error: String(error) });
    }
    return createEmptyCache();
}
// Create empty cache structure
function createEmptyCache() {
    return {
        entries: {},
        metadata: {
            version: CACHE_VERSION,
            lastCleanup: new Date().toISOString(),
        },
    };
}
// Save cache to disk
function saveCache(cache) {
    const cachePath = getCacheFilePath();
    try {
        fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
    }
    catch (error) {
        logger.error('Error saving cache', { error: String(error) });
    }
}
// Check if entry is expired
function isExpired(entry) {
    const createdAt = new Date(entry.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > CACHE_TTL_DAYS;
}
// LRU eviction: remove oldest accessed entries if over limit
function evictIfNeeded(cache) {
    const entries = Object.entries(cache.entries);
    if (entries.length <= MAX_CACHE_ENTRIES) {
        return;
    }
    // Sort by lastAccessedAt ascending (oldest first)
    entries.sort((a, b) => {
        const dateA = new Date(a[1].lastAccessedAt).getTime();
        const dateB = new Date(b[1].lastAccessedAt).getTime();
        return dateA - dateB;
    });
    // Remove oldest entries until we're at 90% capacity
    const targetSize = Math.floor(MAX_CACHE_ENTRIES * 0.9);
    const toRemove = entries.slice(0, entries.length - targetSize);
    for (const [key] of toRemove) {
        delete cache.entries[key];
        logger.debug('Evicted cache entry (LRU)', { key });
    }
    logger.info(`Cache eviction complete`, {
        removed: toRemove.length,
        remaining: Object.keys(cache.entries).length,
    });
}
// Clean expired entries
function cleanExpiredEntries(cache) {
    let removed = 0;
    for (const [key, entry] of Object.entries(cache.entries)) {
        if (isExpired(entry)) {
            delete cache.entries[key];
            removed++;
        }
    }
    if (removed > 0) {
        cache.metadata.lastCleanup = new Date().toISOString();
        logger.info(`Cleaned expired cache entries`, { removed });
    }
    return removed;
}
// Public API
/**
 * Get a cached short URL if it exists and is not expired
 */
export function getCachedUrl(service, originalUrl) {
    const cache = loadCache();
    const key = generateCacheKey(service, originalUrl);
    const entry = cache.entries[key];
    if (!entry) {
        logger.debug('Cache miss', { service, url: originalUrl.substring(0, 50) });
        return null;
    }
    if (isExpired(entry)) {
        logger.debug('Cache entry expired', { service, key });
        delete cache.entries[key];
        saveCache(cache);
        return null;
    }
    // Update access metadata
    entry.lastAccessedAt = new Date().toISOString();
    entry.accessCount++;
    saveCache(cache);
    logger.info('🎯 Cache hit', {
        service,
        shortUrl: entry.shortUrl,
        accessCount: entry.accessCount,
    });
    return entry.shortUrl;
}
/**
 * Store a shortened URL in the cache
 */
export function setCachedUrl(service, originalUrl, shortUrl) {
    const cache = loadCache();
    const key = generateCacheKey(service, originalUrl);
    cache.entries[key] = {
        shortUrl,
        originalUrl,
        service,
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        accessCount: 1,
    };
    // Clean and evict if necessary
    cleanExpiredEntries(cache);
    evictIfNeeded(cache);
    saveCache(cache);
    logger.info('💾 Cached URL', {
        service,
        shortUrl,
        originalUrl: originalUrl.substring(0, 50) + (originalUrl.length > 50 ? '...' : ''),
    });
}
/**
 * Get cache statistics
 */
export function getCacheStats() {
    const cache = loadCache();
    const entries = Object.values(cache.entries);
    if (entries.length === 0) {
        return {
            totalEntries: 0,
            oldestEntry: null,
            newestEntry: null,
            lastCleanup: cache.metadata.lastCleanup,
        };
    }
    const sorted = entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return {
        totalEntries: entries.length,
        oldestEntry: sorted[0].createdAt,
        newestEntry: sorted[sorted.length - 1].createdAt,
        lastCleanup: cache.metadata.lastCleanup,
    };
}
/**
 * Initialize cache (run cleanup on startup)
 */
export function initializeCache() {
    logger.info('🚀 Initializing URL cache');
    const cache = loadCache();
    const removed = cleanExpiredEntries(cache);
    saveCache(cache);
    const stats = getCacheStats();
    logger.info('Cache initialized', {
        totalEntries: stats.totalEntries,
        expiredRemoved: removed,
    });
}
