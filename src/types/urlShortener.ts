export type ShortenerServiceId = 'none' | 'tinyurl' | 'bitly' | 'isgd'

export interface ShortenerDefinition {
  id: ShortenerServiceId
  label: string
}
