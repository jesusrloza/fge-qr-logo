import { ShortenerDefinition, ShortenerServiceId } from '../types/urlShortener'

const TINYURL_ENDPOINT = 'https://tinyurl.com/api-create.php'
const BITLY_ENDPOINT = 'https://api-ssl.bitly.com/v4/shorten'
const ISGD_ENDPOINT = 'https://is.gd/create.php'

export const shortenerServices: ShortenerDefinition[] = [
  {
    id: 'isgd',
    label: 'is.gd',
  },
  {
    id: 'tinyurl',
    label: 'TinyURL',
  },
  {
    id: 'bitly',
    label: 'Bit.ly',
  },
]

async function shortenViaTinyUrl(longUrl: string) {
  const response = await fetch(`${TINYURL_ENDPOINT}?url=${encodeURIComponent(longUrl)}`)
  if (!response.ok) {
    throw new Error('TinyURL no pudo acortar la URL. Intenta otra vez más tarde.')
  }
  return response.text()
}

async function shortenViaBitly(longUrl: string) {
  const accessToken = import.meta.env.VITE_BITLY_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('El token de Bitly no está configurado. Asegúrate de definir VITE_BITLY_ACCESS_TOKEN en .env.')
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

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload?.message ?? 'Bit.ly devolvió un error. Revisa tu token y permisos.'
    throw new Error(message)
  }

  return payload.link
}

async function shortenViaIsGd(longUrl: string) {
  const response = await fetch(`${ISGD_ENDPOINT}?format=json&url=${encodeURIComponent(longUrl)}`)
  const payload = await response.json().catch(() => ({}))

  if (payload.errorcode) {
    throw new Error(`is.gd: ${payload.errormessage ?? 'No se pudo acortar la URL. Intenta otra vez más tarde.'}`)
  }

  if (!response.ok || !payload.shorturl) {
    throw new Error('is.gd no pudo acortar la URL. Intenta otra vez más tarde.')
  }

  return payload.shorturl
}
export async function shortenWithService(serviceId: ShortenerServiceId, longUrl: string) {
  if (!longUrl || longUrl.trim() === '') {
    throw new Error('Por favor ingresa una URL válida antes de acortarla.')
  }

  if (serviceId === 'none') {
    throw new Error('Seleccione un servicio de acortamiento antes de intentar acortar la URL.')
  }

  switch (serviceId) {
    case 'tinyurl':
      return shortenViaTinyUrl(longUrl)
    case 'bitly':
      return shortenViaBitly(longUrl)
    case 'isgd':
      return shortenViaIsGd(longUrl)
    default:
      throw new Error('Servicio de acortamiento no soportado.')
  }
}
export type { ShortenerDefinition, ShortenerServiceId }
