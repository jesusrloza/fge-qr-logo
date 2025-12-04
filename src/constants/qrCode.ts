import QRCodeStyling from 'qr-code-styling'

// Minimum QR version to ensure codes look recognizable
// Version 4 = 33x33 modules, good balance between simplicity and recognition
// This prevents very short URLs from creating tiny, unfamiliar-looking QR codes
export const MIN_QR_VERSION = 4

// Cached logo as base64 data URL to prevent repeated network requests
let cachedLogoDataUrl: string | null = null
let logoLoadPromise: Promise<string> | null = null

/**
 * Load and cache the logo as a base64 data URL.
 * This prevents the browser from fetching the image on every QR update.
 */
async function loadLogoAsDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) {
    return cachedLogoDataUrl
  }

  if (logoLoadPromise) {
    return logoLoadPromise
  }

  logoLoadPromise = new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        ctx.drawImage(img, 0, 0)
        cachedLogoDataUrl = canvas.toDataURL('image/png')
        console.log('[QR Logo] Logo cached as data URL')
        resolve(cachedLogoDataUrl)
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = () => reject(new Error('Failed to load logo image'))
    img.src = `${import.meta.env.BASE_URL}fge400.png`
  })

  return logoLoadPromise
}

// Start loading the logo immediately when this module loads
loadLogoAsDataUrl().catch((err) => console.error('[QR Logo] Failed to preload logo:', err))

// QR Code version capacity table for Byte mode with Q error correction
// Each entry is the max bytes that version can hold
const QR_CAPACITY_Q: number[] = [
  0, // Version 0 (not used)
  11, // Version 1
  20, // Version 2
  32, // Version 3
  46, // Version 4
  60, // Version 5
  74, // Version 6
  86, // Version 7
  108, // Version 8
  130, // Version 9
  151, // Version 10
  177, // Version 11
  203, // Version 12
  241, // Version 13
  258, // Version 14
  292, // Version 15
  322, // Version 16
  364, // Version 17
  394, // Version 18
  442, // Version 19
  482, // Version 20
  509, // Version 21
  565, // Version 22
  611, // Version 23
  661, // Version 24
  715, // Version 25
  751, // Version 26
  805, // Version 27
  868, // Version 28
  908, // Version 29
  982, // Version 30
  1030, // Version 31
  1112, // Version 32
  1168, // Version 33
  1228, // Version 34
  1283, // Version 35
  1351, // Version 36
  1423, // Version 37
  1499, // Version 38
  1579, // Version 39
  1663, // Version 40
]

export type QRTypeNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40

/**
 * Calculate the appropriate QR version for the given data length.
 * Returns at least MIN_QR_VERSION to ensure codes look recognizable,
 * but will return a higher version if the data requires it.
 */
export function getQrVersion(dataLength: number): QRTypeNumber {
  // Find the minimum version that can hold the data
  let requiredVersion = 1
  for (let v = 1; v <= 40; v++) {
    if (QR_CAPACITY_Q[v] >= dataLength) {
      requiredVersion = v
      break
    }
    if (v === 40) {
      requiredVersion = 40 // Max version if data is very long
    }
  }

  // Return the higher of required version or minimum version
  return Math.max(requiredVersion, MIN_QR_VERSION) as QRTypeNumber
}

// Export config so it can be used to create new instances
export const QR_CONFIG = {
  width: 250,
  height: 250,
  margin: 10,
  data: 'https://fiscaliamichoacan.gob.mx/',
  image: '', // Will be set with cached data URL
  imageOptions: {
    imageSize: 0.4,
  },
  qrOptions: {
    // High error correction (Q = ~25% recovery) for print resilience
    // Even with minor printing issues, the QR will still scan
    errorCorrectionLevel: 'Q' as const,
    mode: 'Byte' as const,
    // Version will be set dynamically based on URL length
    typeNumber: MIN_QR_VERSION as QRTypeNumber,
  },
  backgroundOptions: { color: '#fff' },
  cornersSquareOptions: { color: '#c09f77', type: 'square' as const },
  cornersDotOptions: { color: '#152f4a', type: 'square' as const },
  dotsOptions: { color: '#152f4a', type: 'extra-rounded' as const },
}

/**
 * Factory function to create a fresh QR instance with the cached logo.
 * Returns a promise because we need to wait for the logo to be loaded.
 */
export async function createQrCodeAsync(): Promise<QRCodeStyling> {
  console.log('[QR Debug] Creating fresh QRCodeStyling instance (async)')
  const logoDataUrl = await loadLogoAsDataUrl()
  return new QRCodeStyling({
    ...QR_CONFIG,
    image: logoDataUrl,
  })
}

/**
 * Factory function to create a fresh instance synchronously.
 * Uses cached logo if available, otherwise falls back to URL (may cause extra requests).
 */
export function createQrCode(): QRCodeStyling {
  console.log('[QR Debug] Creating fresh QRCodeStyling instance')
  return new QRCodeStyling({
    ...QR_CONFIG,
    image: cachedLogoDataUrl || `${import.meta.env.BASE_URL}fge400.png`,
  })
}

/**
 * Update an existing QR instance with the cached logo.
 * Call this after initial creation to ensure the logo is cached.
 */
export async function updateQrWithCachedLogo(qrInstance: QRCodeStyling): Promise<void> {
  const logoDataUrl = await loadLogoAsDataUrl()
  qrInstance.update({ image: logoDataUrl })
}

// Legacy singleton export (deprecated - prefer createQrCode())
export const qrCode = new QRCodeStyling(QR_CONFIG)
