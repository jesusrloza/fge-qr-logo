import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { createLogger } from '../services/logger.js'

const router = Router()
const logger = createLogger('LogRoute')

type LogAction = 'qr_generated' | 'qr_downloaded' | 'auth_success'

interface LogRequest {
  action: LogAction
  data?: Record<string, unknown>
  curp?: string
}

interface LogResponse {
  success: boolean
}

/**
 * Hash CURP and return prefix for logging (same as auth route)
 */
function getCurpHashPrefix(curp?: string): string {
  if (!curp) return 'anonymous'
  const hash = crypto.createHash('sha256').update(curp.toUpperCase()).digest('hex')
  return hash.substring(0, 8)
}

router.post('/', (req: Request, res: Response<LogResponse>) => {
  const { action, data, curp } = req.body as LogRequest

  if (!action) {
    return res.status(400).json({ success: false })
  }

  const curpHashPrefix = getCurpHashPrefix(curp)

  switch (action) {
    case 'qr_generated':
      logger.info('📷 QR generado', {
        url: data?.url,
        urlLength: data?.urlLength,
        isShortened: data?.isShortened,
        curpHashPrefix,
      })
      break
    case 'qr_downloaded':
      logger.info('📥 QR descargado', {
        url: data?.url,
        format: data?.format,
        isShortened: data?.isShortened,
        curpHashPrefix,
      })
      break
    case 'auth_success':
      logger.info('🔐 Sesión iniciada', { curpHashPrefix })
      break
    default:
      // Ignore other actions
      break
  }

  return res.json({ success: true })
})

export default router
