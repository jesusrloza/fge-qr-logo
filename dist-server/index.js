import 'dotenv/config';
import express from 'express';
import { createLogger, cleanupOldLogs } from './services/logger.js';
import { initializeCache } from './services/cache.js';
import shortenRoutes from './routes/shorten.js';
import logRoutes from './routes/log.js';
import authRoutes from './routes/auth.js';
const logger = createLogger('Server');
export function createServer() {
    const app = express();
    // Middleware
    app.use(express.json());
    // CORS headers for development
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });
    // API Routes
    app.use('/api/shorten', shortenRoutes);
    app.use('/api/log', logRoutes);
    app.use('/api/auth', authRoutes);
    // Health check
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    return app;
}
export function initializeServer() {
    logger.info('🚀 Initializing server...');
    // Initialize cache
    initializeCache();
    // Cleanup old log files
    cleanupOldLogs();
    logger.info('✅ Server initialization complete');
}
// For Vite middleware integration
export function configureViteMiddleware(_app) {
    logger.info('📦 Configuring Vite middleware integration');
    initializeServer();
}
export { logger };
