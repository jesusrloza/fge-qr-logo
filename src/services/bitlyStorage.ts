// localStorage key for Bitly user token
export const BITLY_TOKEN_STORAGE_KEY = 'bitly_user_token'

/**
 * Load stored Bitly token from localStorage
 */
export function loadStoredBitlyToken(): string {
  try {
    return localStorage.getItem(BITLY_TOKEN_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

/**
 * Save Bitly token to localStorage
 */
export function saveStoredBitlyToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(BITLY_TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(BITLY_TOKEN_STORAGE_KEY)
    }
  } catch {
    console.error('Failed to save Bitly token to localStorage')
  }
}

/**
 * Clear stored Bitly token from localStorage
 */
export function clearStoredBitlyToken(): void {
  try {
    localStorage.removeItem(BITLY_TOKEN_STORAGE_KEY)
  } catch {
    console.error('Failed to clear Bitly token from localStorage')
  }
}
