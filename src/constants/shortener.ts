export type ShortenerServiceId = 'none' | 'tinyurl' | 'bitly' | 'isgd'

export interface ShortenerService {
  id: ShortenerServiceId
  label: string
  description: string
}

export const shortenerServices: ShortenerService[] = [
  { id: 'isgd', label: 'is.gd', description: 'Servicio gratuito y rápido' },
  { id: 'tinyurl', label: 'TinyURL', description: 'Servicio popular y confiable' },
  { id: 'bitly', label: 'Bit.ly', description: 'Requiere configuración' },
]
