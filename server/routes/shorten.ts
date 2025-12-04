import { Router, Request, Response } from 'express'
import { createLogger } from '../services/logger.js'
import { getCachedUrl, setCachedUrl } from '../services/cache.js'
import { shortenUrl, isValidService, ShortenerServiceId, BitlyError } from '../services/shorteners.js'

const router = Router()
const logger = createLogger('ShortenRoute')

interface ShortenRequest {
  url: string
  service: string
  curp?: string // This is now the curpHashPrefix (pre-hashed on server during auth)
  bitlyToken?: string // Optional user-provided Bitly token
}

interface ShortenResponse {
  success: boolean
  shortUrl?: string
  cached?: boolean
  error?: string
  errorCode?: string // Distinct error code for client-side handling
}

router.post('/', async (req: Request, res: Response<ShortenResponse>) => {
  const { url, service, curp: curpHashPrefix, bitlyToken } = req.body as ShortenRequest

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
  // curpHashPrefix is already the 8-char hash prefix from auth, or undefined for anonymous
  const userIdentifier = curpHashPrefix || 'anonymous'

  logger.debug('Shorten request received', {
    service: serviceId,
    urlLength: trimmedUrl.length,
    curpHashPrefix: userIdentifier,
  })

  try {
    // Check cache first
    const cachedUrl = getCachedUrl(serviceId, trimmedUrl)
    if (cachedUrl) {
      logger.info('🔗 URL acortada (caché)', {
        service: serviceId,
        originalUrlLength: trimmedUrl.length,
        shortUrl: cachedUrl,
        cached: true,
        curpHashPrefix: userIdentifier,
      })
      return res.json({
        success: true,
        shortUrl: cachedUrl,
        cached: true,
      })
    }

    // Not in cache, call the service
    const shortUrl = await shortenUrl(serviceId, trimmedUrl, bitlyToken)

    // Store in cache for future requests
    setCachedUrl(serviceId, trimmedUrl, shortUrl)

    // Log the URL shortening event
    logger.info('🔗 URL acortada', {
      service: serviceId,
      originalUrlLength: trimmedUrl.length,
      shortUrl,
      cached: false,
      curpHashPrefix: userIdentifier,
    })

    return res.json({
      success: true,
      shortUrl,
      cached: false,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorCode = error instanceof BitlyError ? error.code : undefined

    logger.error('Failed to shorten URL', {
      service: serviceId,
      error: errorMessage,
      errorCode,
      curpHashPrefix: userIdentifier,
    })

    return res.status(500).json({
      success: false,
      error: errorMessage,
      errorCode,
    })
  }
})

export default router
