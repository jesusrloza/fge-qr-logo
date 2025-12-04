// API base URL - uses Vite's base URL for subpath deployments
// Remove trailing slash(es) from BASE_URL since API paths start with /
const API_BASE = (import.meta.env.BASE_URL || '').replace(/\/+$/, '')

// Custom error class that includes error code
export class ApiError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/**
 * Shorten a URL via the server-side cache
 */
export async function shortenUrl(
  url: string,
  service: string,
  curp?: string,
  bitlyToken?: string,
): Promise<{ shortUrl: string; cached: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/api/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, service, curp, bitlyToken }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new ApiError(
        data.error || 'El servicio de acortamiento no está disponible. Por favor intenta más tarde.',
        data.errorCode,
      )
    }

    const data = await response.json()

    if (!data.success) {
      throw new ApiError(data.error || 'Error al acortar la URL', data.errorCode)
    }

    return {
      shortUrl: data.shortUrl,
      cached: data.cached || false,
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
    }
    throw error
  }
}

/**
 * Log an event to the server
 */
export async function logEvent(action: string, data?: Record<string, unknown>, curp?: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data, curp }),
    })
  } catch (error) {
    // Silently fail - logging shouldn't break the app
    console.error('Failed to log event:', error)
  }
}

/**
 * Verify CURP and get JWT token
 */
export async function verifyCurp(curp: string): Promise<{ token: string; curpHashPrefix: string }> {
  const response = await fetch(`${API_BASE}/api/auth/verify-curp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ curp }),
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Error al verificar CURP')
  }

  return {
    token: data.token,
    curpHashPrefix: data.curpHashPrefix,
  }
}

/**
 * Validate existing JWT token
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    return data.success && data.valid
  } catch {
    return false
  }
}

/**
 * Register anonymous session
 */
export async function registerAnonymous(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/anonymous`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
