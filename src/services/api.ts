// API base URL - empty for same origin
const API_BASE = ''

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Shorten a URL via the server-side cache
 */
export async function shortenUrl(
  url: string,
  service: string,
  curp?: string,
): Promise<{ shortUrl: string; cached: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/api/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, service, curp }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'El servicio de acortamiento no está disponible. Por favor intenta más tarde.')
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Error al acortar la URL')
    }

    return {
      shortUrl: data.shortUrl,
      cached: data.cached || false,
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
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
export async function verifyCurp(curp: string): Promise<string> {
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

  return data.token
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

export type { ApiResponse }
