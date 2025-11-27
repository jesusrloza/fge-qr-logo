import { Router, Request, Response } from 'express'
import { createLogger } from '../services/logger.js'

const router = Router()
const logger = createLogger('LogRoute')

type LogAction = 'qr_generated' | 'qr_downloaded' | 'auth_success'

interface LogRequest {
  action: LogAction
  data?: Record<string, unknown>
  curp?: string // This is now the curpHashPrefix (pre-hashed on server during auth)
}

interface LogResponse {
  success: boolean
}

router.post('/', (req: Request, res: Response<LogResponse>) => {
  const { action, data, curp: curpHashPrefix } = req.body as LogRequest

  if (!action) {
    return res.status(400).json({ success: false })
  }

  // curpHashPrefix is already the 8-char hash prefix from auth, or undefined for anonymous
  const userIdentifier = curpHashPrefix || 'anonymous'

  switch (action) {
    case 'qr_generated':
      logger.info('📷 QR generado', {
        url: data?.url,
        urlLength: data?.urlLength,
        isShortened: data?.isShortened,
        trigger: data?.trigger || 'manual', // 'manual' | 'url_shortened' | 'url_toggle'
        curpHashPrefix: userIdentifier,
      })
      break
    case 'qr_downloaded':
      logger.info('📥 QR descargado', {
        url: data?.url,
        urlLength: typeof data?.url === 'string' ? data.url.length : undefined,
        format: data?.format,
        isShortened: data?.isShortened,
        curpHashPrefix: userIdentifier,
      })
      break
    case 'auth_success':
      logger.info('🔐 Sesión iniciada', {
        isAnonymous: data?.anonymous === true,
        curpHashPrefix: userIdentifier,
      })
      break
    default:
      // Log unknown actions for debugging
      logger.warn('⚠️ Acción de log desconocida', {
        action,
        curpHashPrefix: userIdentifier,
      })
      break
  }

  return res.json({ success: true })
})

export default router
