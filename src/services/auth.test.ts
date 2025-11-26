import { describe, it, expect } from 'vitest'
import { isValidCurpFormat } from './auth'

describe('Auth Service', () => {
  describe('isValidCurpFormat', () => {
    it('should return true for valid CURP', () => {
      // Standard format: 4 letters + 6 digits + H/M + 5 letters + 2 alphanumeric
      expect(isValidCurpFormat('GARC850101HDFRRL09')).toBe(true)
      expect(isValidCurpFormat('LOMA901231MMCSRR01')).toBe(true)
    })

    it('should handle lowercase input', () => {
      expect(isValidCurpFormat('garc850101hdfrrl09')).toBe(true)
    })

    it('should return false for invalid CURP', () => {
      expect(isValidCurpFormat('')).toBe(false)
      expect(isValidCurpFormat('INVALID')).toBe(false)
      expect(isValidCurpFormat('GARC850101XDFRRL09')).toBe(false) // Invalid gender
      expect(isValidCurpFormat('GAR8501011HDFRRL09')).toBe(false) // Too few letters at start
      expect(isValidCurpFormat('GARC8501011HDFRRL0')).toBe(false) // Wrong length
    })

    it('should return false for null/undefined', () => {
      expect(isValidCurpFormat(null as unknown as string)).toBe(false)
      expect(isValidCurpFormat(undefined as unknown as string)).toBe(false)
    })
  })
})
