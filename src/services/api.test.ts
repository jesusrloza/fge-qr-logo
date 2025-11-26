import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shortenUrl, logEvent, verifyCurp } from './api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('shortenUrl', () => {
    it('should return shortened URL on success', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            shortUrl: 'https://is.gd/test123',
            cached: false,
          }),
      })

      const result = await shortenUrl('https://example.com', 'isgd')

      expect(result).toEqual({
        shortUrl: 'https://is.gd/test123',
        cached: false,
      })
      expect(mockFetch).toHaveBeenCalledWith('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com',
          service: 'isgd',
          curp: undefined,
        }),
      })
    })

    it('should return cached flag when URL is from cache', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            shortUrl: 'https://is.gd/cached123',
            cached: true,
          }),
      })

      const result = await shortenUrl('https://example.com', 'isgd')

      expect(result.cached).toBe(true)
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Service unavailable',
          }),
      })

      await expect(shortenUrl('https://example.com', 'isgd')).rejects.toThrow('Service unavailable')
    })
  })

  describe('logEvent', () => {
    it('should send log event to server', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      })

      await logEvent('qr_generated', { urlLength: 50 })

      expect(mockFetch).toHaveBeenCalledWith('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'qr_generated',
          data: { urlLength: 50 },
          curp: undefined,
        }),
      })
    })

    it('should not throw on logging failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Should not throw
      await expect(logEvent('qr_generated')).resolves.toBeUndefined()
    })
  })

  describe('verifyCurp', () => {
    it('should return token on successful verification', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            token: 'jwt-token-123',
          }),
      })

      const token = await verifyCurp('GARC850101HDFRRL09')

      expect(token).toBe('jwt-token-123')
    })

    it('should throw error on invalid CURP', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: false,
            error: 'CURP format invalid',
          }),
      })

      await expect(verifyCurp('INVALID')).rejects.toThrow('CURP format invalid')
    })
  })
})
