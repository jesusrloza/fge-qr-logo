import { verifyCurp, validateToken, registerAnonymous } from './api'

const TOKEN_KEY = 'fge_qr_token'
const CURP_KEY = 'fge_qr_curp'

/**
 * Get the stored JWT token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get the stored CURP (first 4 chars only for display)
 */
export function getStoredCurpPrefix(): string | null {
  return localStorage.getItem(CURP_KEY)
}

/**
 * Store token and CURP prefix
 */
export function storeCredentials(token: string, curp: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CURP_KEY, curp.substring(0, 4).toUpperCase())
}

/**
 * Clear stored credentials
 */
export function clearCredentials(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CURP_KEY)
}

/**
 * Validate CURP format
 * Format: 4 letters + 6 digits + H/M + 5 letters + 2 alphanumeric
 */
export function isValidCurpFormat(curp: string): boolean {
  if (!curp || typeof curp !== 'string') return false
  const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/
  return CURP_REGEX.test(curp.toUpperCase().trim())
}

/**
 * Check if user has a valid session
 */
export async function hasValidSession(): Promise<boolean> {
  const token = getStoredToken()
  if (!token) return false

  const isValid = await validateToken(token)
  if (!isValid) {
    clearCredentials()
  }

  return isValid
}

/**
 * Login with CURP
 */
export async function loginWithCurp(curp: string): Promise<void> {
  const token = await verifyCurp(curp)
  storeCredentials(token, curp)
}

/**
 * Continue without identifying (anonymous)
 */
export async function continueAnonymous(): Promise<void> {
  await registerAnonymous()
  // Store a flag indicating anonymous session
  localStorage.setItem(TOKEN_KEY, 'anonymous')
  localStorage.setItem(CURP_KEY, 'anon')
}

/**
 * Get CURP for API calls (if available)
 */
export function getCurpForApi(): string | undefined {
  const prefix = getStoredCurpPrefix()
  if (!prefix || prefix === 'anon') return undefined
  return prefix // We only have the prefix, server will use token
}

/**
 * Check if current session is anonymous
 */
export function isAnonymousSession(): boolean {
  return getStoredToken() === 'anonymous'
}
