import 'dotenv/config';
import { Express } from 'express';
import { Logger } from './services/logger.js';
declare const logger: Logger;
export declare function createServer(): Express;
export declare function initializeServer(): void;
export declare function configureViteMiddleware(_app: Express): void;
export { logger };
