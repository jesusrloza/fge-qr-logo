import { Router, Request, Response } from 'express'
import { createLogger } from '../services/logger.js'
import { getCachedUrl, setCachedUrl } from '../services/cache.js'
import { shortenUrl, isValidService, ShortenerServiceId } from '../services/shorteners.js'

const router = Router()
const logger = createLogger('ShortenRoute')

interface ShortenRequest {
  url: string
  service: string
  curp?: string // Optional user identifier
}

interface ShortenResponse {
  success: boolean
  shortUrl?: string
  cached?: boolean
  error?: string
}

router.post('/', async (req: Request, res: Response<ShortenResponse>) => {
  const { url, service, curp } = req.body as ShortenRequest

  // Validate request
  if (!url || typeof url !== 'string' || url.trim() === '') {
    logger.warn('Invalid request: missing URL')
    return res.status(400).json({
      success: false,
      error: 'Por favor proporciona una URL válida.',
    })
  }

  if (!service || !isValidService(service)) {
    logger.warn('Invalid request: invalid service', { service })
    return res.status(400).json({
      success: false,
      error: 'Por favor selecciona un servicio de acortamiento válido.',
    })
  }

  const trimmedUrl = url.trim()
  const serviceId = service as ShortenerServiceId

  logger.debug('Shorten request received', {
    service: serviceId,
    urlLength: trimmedUrl.length,
  })

  try {
    // Check cache first
    const cachedUrl = getCachedUrl(serviceId, trimmedUrl)
    if (cachedUrl) {
      logger.debug('Cache hit', { service: serviceId })
      return res.json({
        success: true,
        shortUrl: cachedUrl,
        cached: true,
      })
    }

    // Not in cache, call the service
    const shortUrl = await shortenUrl(serviceId, trimmedUrl)

    // Store in cache for future requests
    setCachedUrl(serviceId, trimmedUrl, shortUrl)

    // Log the URL shortening event
    logger.info('🔗 URL acortada', {
      service: serviceId,
      originalUrl: trimmedUrl,
      shortUrl,
      curp: curp ? curp.substring(0, 4) + '***' : 'anonymous',
    })

    return res.json({
      success: true,
      shortUrl,
      cached: false,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    logger.error('Failed to shorten URL', {
      service: serviceId,
      error: errorMessage,
      curp: curp ? curp.substring(0, 4) + '***' : 'anonymous',
    })

    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

export default router
