import { createLogger } from './logger.js'

const logger = createLogger('UrlShortener')

const TINYURL_ENDPOINT = 'https://tinyurl.com/api-create.php'
const BITLY_ENDPOINT = 'https://api-ssl.bitly.com/v4/shorten'
const ISGD_ENDPOINT = 'https://is.gd/create.php'

export type ShortenerServiceId = 'tinyurl' | 'bitly' | 'isgd'

// Response types for API payloads
interface BitlyResponse {
  link?: string
  message?: string
}

interface IsGdResponse {
  shorturl?: string
  errorcode?: number
  errormessage?: string
}

// Retry configuration
const MAX_RETRIES = 3
const INITIAL_DELAY_MS = 1000

// Sleep helper for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Exponential backoff retry wrapper
async function withRetry<T>(operation: () => Promise<T>, serviceName: string): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1)
        logger.warn(`Retry attempt ${attempt}/${MAX_RETRIES} for ${serviceName}`, {
          delay,
          error: lastError.message,
        })
        await sleep(delay)
      }
    }
  }

  logger.error(`All ${MAX_RETRIES} attempts failed for ${serviceName}`, {
    error: lastError?.message,
  })
  throw lastError
}

async function shortenViaTinyUrl(longUrl: string): Promise<string> {
  logger.info('🔗 Shortening via TinyURL', { url: longUrl.substring(0, 50) })

  const response = await fetch(`${TINYURL_ENDPOINT}?url=${encodeURIComponent(longUrl)}`)

  if (!response.ok) {
    throw new Error('TinyURL no pudo acortar la URL. Intenta otra vez más tarde.')
  }

  const shortUrl = await response.text()
  logger.info('✅ TinyURL success', { shortUrl })
  return shortUrl
}

async function shortenViaBitly(longUrl: string): Promise<string> {
  logger.info('🔗 Shortening via Bit.ly', { url: longUrl.substring(0, 50) })

  const accessToken = process.env.BITLY_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('El token de Bitly no está configurado. Asegúrate de definir BITLY_ACCESS_TOKEN en .env.')
  }

  const response = await fetch(BITLY_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      long_url: longUrl,
    }),
  })

  const payload = (await response.json().catch(() => ({}))) as BitlyResponse

  if (!response.ok) {
    const message = payload.message ?? 'Bit.ly devolvió un error. Revisa tu token y permisos.'
    throw new Error(message)
  }

  if (!payload.link) {
    throw new Error('Bit.ly no devolvió una URL válida.')
  }

  logger.info('✅ Bit.ly success', { shortUrl: payload.link })
  return payload.link
}

async function shortenViaIsGd(longUrl: string): Promise<string> {
  logger.info('🔗 Shortening via is.gd', { url: longUrl.substring(0, 50) })

  const response = await fetch(`${ISGD_ENDPOINT}?format=json&url=${encodeURIComponent(longUrl)}`)
  const payload = (await response.json().catch(() => ({}))) as IsGdResponse

  if (payload.errorcode) {
    throw new Error(`is.gd: ${payload.errormessage ?? 'No se pudo acortar la URL. Intenta otra vez más tarde.'}`)
  }

  if (!response.ok || !payload.shorturl) {
    throw new Error('is.gd no pudo acortar la URL. Intenta otra vez más tarde.')
  }

  logger.info('✅ is.gd success', { shortUrl: payload.shorturl })
  return payload.shorturl
}

/**
 * Shorten a URL using the specified service with retry logic
 */
export async function shortenUrl(serviceId: ShortenerServiceId, longUrl: string): Promise<string> {
  if (!longUrl || longUrl.trim() === '') {
    throw new Error('Por favor ingresa una URL válida antes de acortarla.')
  }

  switch (serviceId) {
    case 'tinyurl':
      return withRetry(() => shortenViaTinyUrl(longUrl), 'TinyURL')
    case 'bitly':
      return withRetry(() => shortenViaBitly(longUrl), 'Bit.ly')
    case 'isgd':
      return withRetry(() => shortenViaIsGd(longUrl), 'is.gd')
    default:
      throw new Error('Servicio de acortamiento no soportado.')
  }
}

/**
 * Validate that a service ID is valid
 */
export function isValidService(serviceId: string): serviceId is ShortenerServiceId {
  return ['tinyurl', 'bitly', 'isgd'].includes(serviceId)
}
