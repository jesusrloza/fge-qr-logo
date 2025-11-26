import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CurpModal from './CurpModal'

// Mock the auth service
vi.mock('../services/auth', () => ({
  isValidCurpFormat: vi.fn((curp: string) => {
    if (!curp || typeof curp !== 'string') return false
    const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/i
    return regex.test(curp)
  }),
  loginWithCurp: vi.fn(),
  continueAnonymous: vi.fn(),
}))

import { loginWithCurp, continueAnonymous } from '../services/auth'

describe('CurpModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(loginWithCurp).mockResolvedValue()
    vi.mocked(continueAnonymous).mockResolvedValue()
  })

  it('should not render when isOpen is false', () => {
    render(<CurpModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    expect(screen.queryByText('Identificación de Usuario')).not.toBeInTheDocument()
  })

  it('should render modal content when isOpen is true', () => {
    render(<CurpModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('Identificación de Usuario')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('XXXX000000XXXXXX00')).toBeInTheDocument()
    expect(screen.getByText('Continuar')).toBeInTheDocument()
    expect(screen.getByText('Continuar sin identificarme')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(<CurpModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    // Find the close button (it has modal-close class)
    const closeButton = document.querySelector('.modal-close')
    fireEvent.click(closeButton!)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should show warning on first skip click, then call continueAnonymous on second', async () => {
    render(<CurpModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    // First click shows warning
    fireEvent.click(screen.getByText('Continuar sin identificarme'))
    expect(screen.getByText(/En próximas versiones/)).toBeInTheDocument()

    // Second click (confirm) calls continueAnonymous
    fireEvent.click(screen.getByText('Sí, continuar'))

    await waitFor(() => {
      expect(continueAnonymous).toHaveBeenCalledTimes(1)
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('should show error for invalid CURP format', async () => {
    render(<CurpModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    // Enter a CURP with correct length (18) but wrong format (invalid gender marker X)
    const input = screen.getByPlaceholderText('XXXX000000XXXXXX00')
    fireEvent.change(input, { target: { value: 'GARC850101XDFRRL09' } }) // X is invalid, should be H or M

    // Submit the form
    const submitButton = screen.getByText('Continuar')
    expect(submitButton).not.toBeDisabled()
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/El formato del CURP no es válido/)).toBeInTheDocument()
    })
    expect(loginWithCurp).not.toHaveBeenCalled()
  })

  it('should submit valid CURP and call loginWithCurp', async () => {
    render(<CurpModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const input = screen.getByPlaceholderText('XXXX000000XXXXXX00')
    fireEvent.change(input, { target: { value: 'GARC850101HDFRRL09' } })

    const submitButton = screen.getByText('Continuar')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(loginWithCurp).toHaveBeenCalledWith('GARC850101HDFRRL09')
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('should convert input to uppercase and filter invalid characters', () => {
    render(<CurpModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const input = screen.getByPlaceholderText('XXXX000000XXXXXX00') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'garc-850101-hdfrrl09!' } })

    // Should uppercase and remove special chars
    expect(input.value).toBe('GARC850101HDFRRL09')
  })

  it('should display character count', () => {
    render(<CurpModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('0/18')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('XXXX000000XXXXXX00')
    fireEvent.change(input, { target: { value: 'GARC850101' } })

    expect(screen.getByText('10/18')).toBeInTheDocument()
  })

  it('should disable submit button when CURP is not 18 characters', () => {
    render(<CurpModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const submitButton = screen.getByText('Continuar')
    expect(submitButton).toBeDisabled()

    const input = screen.getByPlaceholderText('XXXX000000XXXXXX00')
    fireEvent.change(input, { target: { value: 'GARC850101' } }) // Only 10 chars

    expect(submitButton).toBeDisabled()
  })

  it('should handle login error', async () => {
    vi.mocked(loginWithCurp).mockRejectedValueOnce(new Error('Network error'))

    render(<CurpModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    const input = screen.getByPlaceholderText('XXXX000000XXXXXX00')
    fireEvent.change(input, { target: { value: 'GARC850101HDFRRL09' } })
    fireEvent.click(screen.getByText('Continuar'))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })
})
