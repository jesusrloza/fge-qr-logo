export type ShortenerServiceId = 'tinyurl' | 'bitly' | 'isgd'

export interface ShortenerDefinition {
  id: ShortenerServiceId
  label: string
  description?: string
  helperText?: string
  requiresApiKey?: boolean
  apiKeyLabel?: string
}
