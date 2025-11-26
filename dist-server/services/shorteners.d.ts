export type ShortenerServiceId = 'tinyurl' | 'bitly' | 'isgd';
/**
 * Shorten a URL using the specified service with retry logic
 */
export declare function shortenUrl(serviceId: ShortenerServiceId, longUrl: string): Promise<string>;
/**
 * Validate that a service ID is valid
 */
export declare function isValidService(serviceId: string): serviceId is ShortenerServiceId;
