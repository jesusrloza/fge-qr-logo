import { verifyCurp, validateToken, registerAnonymous } from './api'

const TOKEN_KEY = 'fge_qr_token'
const CURP_HASH_KEY = 'fge_qr_curp_hash'
const OLD_CURP_KEY = 'fge_qr_curp' // Legacy key from previous version

/**
 * Check if the stored curpHashPrefix is in the correct format.
 * Valid format: 8-character hex string (SHA256 hash prefix) or 'anonymous'
 */
function isValidCurpHashFormat(value: string | null): boolean {
  if (!value) return false
  if (value === 'anonymous') return true
  // Must be exactly 8 hex characters (SHA256 hash prefix)
  return /^[a-f0-9]{8}$/.test(value)
}

/**
 * Migrate from old localStorage format to new format.
 * Old format: fge_qr_curp stored first 4 chars of raw CURP (e.g., "GARC")
 * New format: fge_qr_curp_hash stores 8-char SHA256 hash prefix (e.g., "fcdbf2f2")
 *
 * This function clears invalid credentials so user will be prompted to log in again.
 */
export function migrateLocalStorage(): void {
  // Check for old key that should no longer exist
  const oldValue = localStorage.getItem(OLD_CURP_KEY)
  if (oldValue) {
    // Old format detected - clear everything
    console.info('[Auth] Migrating from old localStorage format - clearing credentials')
    localStorage.removeItem(OLD_CURP_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(CURP_HASH_KEY)
    return
  }

  // Check if current hash value is in wrong format (e.g., "GARC" instead of hex hash)
  const currentHash = localStorage.getItem(CURP_HASH_KEY)
  if (currentHash && !isValidCurpHashFormat(currentHash)) {
    console.info('[Auth] Invalid curpHashPrefix format detected - clearing credentials')
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(CURP_HASH_KEY)
  }
}

/**
 * Get the stored JWT token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get the stored CURP hash prefix (for API calls and display)
 */
export function getStoredCurpHashPrefix(): string | null {
  return localStorage.getItem(CURP_HASH_KEY)
}

/**
 * @deprecated Use getStoredCurpHashPrefix instead
 */
export function getStoredCurpPrefix(): string | null {
  return getStoredCurpHashPrefix()
}

/**
 * Store token and CURP hash prefix
 */
export function storeCredentials(token: string, curpHashPrefix: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CURP_HASH_KEY, curpHashPrefix)
}

/**
 * Clear stored credentials
 */
export function clearCredentials(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CURP_HASH_KEY)
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
  const { token, curpHashPrefix } = await verifyCurp(curp)
  storeCredentials(token, curpHashPrefix)
}

/**
 * Continue without identifying (anonymous)
 */
export async function continueAnonymous(): Promise<void> {
  await registerAnonymous()
  // Store a flag indicating anonymous session
  localStorage.setItem(TOKEN_KEY, 'anonymous')
  localStorage.setItem(CURP_HASH_KEY, 'anonymous')
}

/**
 * Get CURP hash prefix for API calls (if available)
 * This is the pre-hashed identifier from the server
 */
export function getCurpForApi(): string | undefined {
  const hashPrefix = getStoredCurpHashPrefix()
  if (!hashPrefix || hashPrefix === 'anonymous') return undefined
  return hashPrefix
}

/**
 * Check if current session is anonymous
 */
export function isAnonymousSession(): boolean {
  return getStoredToken() === 'anonymous'
}
