import { useState } from 'react'
import { X, AlertTriangle, Shield } from 'lucide-react'
import { isValidCurpFormat, loginWithCurp, continueAnonymous } from '../services/auth'
import './CurpModal.css'

interface CurpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CurpModal({ isOpen, onClose, onSuccess }: CurpModalProps) {
  const [curp, setCurp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSkipWarning, setShowSkipWarning] = useState(false)

  if (!isOpen) return null

  const handleCurpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setCurp(value.substring(0, 18))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidCurpFormat(curp)) {
      setError('El formato del CURP no es válido. Debe tener 18 caracteres alfanuméricos con el formato correcto.')
      return
    }

    setIsLoading(true)
    try {
      await loginWithCurp(curp)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar CURP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!showSkipWarning) {
      setShowSkipWarning(true)
      return
    }

    setIsLoading(true)
    try {
      await continueAnonymous()
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al continuar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose} disabled={isLoading}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <Shield size={48} className="modal-icon" />
          <h2>Identificación de Usuario</h2>
          <p>Para mejorar la seguridad y trazabilidad del servicio, por favor ingresa tu CURP.</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-wrapper">
            <label htmlFor="curp">CURP (Clave Única de Registro de Población)</label>
            <input
              id="curp"
              type="text"
              value={curp}
              onChange={handleCurpChange}
              placeholder="XXXX000000XXXXXX00"
              maxLength={18}
              disabled={isLoading}
              autoComplete="off"
              autoFocus
            />
            <span className="char-count">{curp.length}/18</span>
          </div>

          {error && (
            <div className="error-box">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading || curp.length !== 18}>
            {isLoading ? 'Verificando...' : 'Continuar'}
          </button>
        </form>

        <div className="modal-footer">
          {showSkipWarning ? (
            <div className="skip-warning">
              <AlertTriangle size={16} />
              <p>
                <strong>Aviso:</strong> En próximas versiones, la identificación será obligatoria. ¿Deseas continuar sin
                identificarte?
              </p>
              <div className="skip-actions">
                <button className="btn-text" onClick={() => setShowSkipWarning(false)} disabled={isLoading}>
                  Cancelar
                </button>
                <button className="btn-text btn-warning" onClick={handleSkip} disabled={isLoading}>
                  Sí, continuar
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-text btn-skip" onClick={handleSkip} disabled={isLoading}>
              Continuar sin identificarme
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
