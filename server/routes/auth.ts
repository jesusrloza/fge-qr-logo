import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { createLogger } from '../services/logger.js'

const router = Router()
const logger = createLogger('AuthRoute')

// CURP validation regex
// Format: 4 letters + 6 digits + H/M + 5 letters + 2 alphanumeric
const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/

// JWT expiration (1 month)
const JWT_EXPIRATION = '30d'

interface VerifyCurpRequest {
  curp: string
}

interface VerifyCurpResponse {
  success: boolean
  token?: string
  error?: string
}

interface JwtPayload {
  curpHash: string
  iat: number
  exp: number
}

/**
 * Hash CURP for storage (we don't store plain CURP)
 */
function hashCurp(curp: string): string {
  return crypto.createHash('sha256').update(curp.toUpperCase()).digest('hex')
}

/**
 * Validate CURP format
 */
function isValidCurp(curp: string): boolean {
  if (!curp || typeof curp !== 'string') return false
  return CURP_REGEX.test(curp.toUpperCase().trim())
}

/**
 * Get JWT secret from environment
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno.')
  }
  return secret
}

/**
 * POST /api/auth/verify-curp
 * Validates CURP and returns a JWT token
 */
router.post('/verify-curp', (req: Request, res: Response<VerifyCurpResponse>) => {
  const { curp } = req.body as VerifyCurpRequest

  if (!curp) {
    logger.warn('CURP verification failed: missing CURP')
    return res.status(400).json({
      success: false,
      error: 'Por favor proporciona tu CURP.',
    })
  }

  const normalizedCurp = curp.toUpperCase().trim()

  if (!isValidCurp(normalizedCurp)) {
    logger.warn('CURP verification failed: invalid format', {
      curpPrefix: normalizedCurp.substring(0, 4),
    })
    return res.status(400).json({
      success: false,
      error: 'El formato del CURP no es válido. Debe tener 18 caracteres alfanuméricos.',
    })
  }

  try {
    const jwtSecret = getJwtSecret()
    const curpHash = hashCurp(normalizedCurp)

    const token = jwt.sign({ curpHash }, jwtSecret, {
      expiresIn: JWT_EXPIRATION,
    })

    logger.info('🔐 Inicio de sesión con CURP', {
      curpHashPrefix: curpHash.substring(0, 8),
    })

    return res.json({
      success: true,
      token,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    logger.error('CURP verification error', { error: errorMessage })

    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

/**
 * POST /api/auth/validate-token
 * Validates an existing JWT token
 */
router.post('/validate-token', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({
      success: false,
      valid: false,
      error: 'Token no proporcionado.',
    })
  }

  try {
    const jwtSecret = getJwtSecret()
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload

    logger.debug('Token validated successfully', {
      curpHashPrefix: decoded.curpHash.substring(0, 8),
    })

    return res.json({
      success: true,
      valid: true,
      curpHash: decoded.curpHash,
    })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.info('Token expired')
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'El token ha expirado. Por favor, ingresa tu CURP nuevamente.',
      })
    }

    logger.warn('Invalid token', { error: String(error) })
    return res.status(401).json({
      success: false,
      valid: false,
      error: 'Token inválido.',
    })
  }
})

/**
 * POST /api/auth/anonymous
 * Allows anonymous access (for users who skip CURP entry)
 */
router.post('/anonymous', (_req: Request, res: Response) => {
  logger.info('👤 Anonymous session started')

  return res.json({
    success: true,
    anonymous: true,
  })
})

export default router
