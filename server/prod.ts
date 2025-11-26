import path from 'path'
import express from 'express'
import { createServer, initializeServer, logger } from './index.js'

const PORT = process.env.PORT || 4173

async function startProductionServer() {
  logger.info('🚀 Starting production server...')

  // Initialize services
  initializeServer()

  // Create Express app with API routes
  const app = createServer()

  // Serve static files from the built frontend
  const distPath = path.join(process.cwd(), 'dist')
  app.use(express.static(distPath))

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' })
    }
    res.sendFile(path.join(distPath, 'index.html'))
  })

  // Start server
  app.listen(PORT, () => {
    logger.info(`✅ Production server running on port ${PORT}`)
    logger.info(`📁 Serving static files from: ${distPath}`)
    logger.info(`🌐 Access the app at: http://localhost:${PORT}`)
  })
}

startProductionServer().catch((error) => {
  logger.error('Failed to start production server', { error: String(error) })
  process.exit(1)
})
