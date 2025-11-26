import 'dotenv/config'
import express, { Express, Request, Response, NextFunction } from 'express'
import { createLogger, cleanupOldLogs, Logger } from './services/logger.js'
import { initializeCache } from './services/cache.js'
import shortenRoutes from './routes/shorten.js'
import logRoutes from './routes/log.js'
import authRoutes from './routes/auth.js'

const logger: Logger = createLogger('Server')

export function createServer(): Express {
  const app = express()

  // Middleware
  app.use(express.json())

  // CORS headers for development
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })

  // API Routes
  app.use('/api/shorten', shortenRoutes)
  app.use('/api/log', logRoutes)
  app.use('/api/auth', authRoutes)

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  return app
}

export function initializeServer(): void {
  logger.info('🚀 Initializing server...')

  // Initialize cache
  initializeCache()

  // Cleanup old log files
  cleanupOldLogs()

  logger.info('✅ Server initialization complete')
}

// For Vite middleware integration
export function configureViteMiddleware(_app: Express): void {
  logger.info('📦 Configuring Vite middleware integration')
  initializeServer()
}

export { logger }
