import { useState } from 'react'
import { Key, Eye, EyeOff, Save, Trash2, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Star } from 'lucide-react'
import { saveStoredBitlyToken, clearStoredBitlyToken } from '../services/bitlyStorage'
import './BitlyTokenInput.css'

interface BitlyTokenInputProps {
  /** Current user token (from localStorage) */
  userToken: string
  /** Callback when user saves/clears token */
  onTokenChange: (token: string) => void
  /** Whether there was an invalid token error */
  hasTokenError?: boolean
}

export default function BitlyTokenInput({ userToken, onTokenChange, hasTokenError = false }: BitlyTokenInputProps) {
  const [inputValue, setInputValue] = useState(userToken)
  const [showToken, setShowToken] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const hasStoredToken = userToken.length > 0
  const hasInputValue = inputValue.trim().length > 0

  const handleSave = () => {
    const token = inputValue.trim()
    if (token) {
      saveStoredBitlyToken(token)
      onTokenChange(token)
    }
  }

  const handleClear = () => {
    clearStoredBitlyToken()
    setInputValue('')
    onTokenChange('')
  }

  return (
    <div className="bitly-token-container">
      {/* Header with status indicator */}
      <div className="bitly-token-header">
        <Key size={16} />
        <span>Token de Bitly</span>
        {/* Status indicator */}
        <div className={`token-status ${hasStoredToken && !hasTokenError ? 'configured' : 'not-configured'}`}>
          {hasStoredToken && !hasTokenError ? (
            <>
              <CheckCircle size={14} />
              <span>Configurado</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              <span>No configurado</span>
            </>
          )}
        </div>
      </div>

      {/* Token error message */}
      {hasTokenError && (
        <div className="token-error-message">
          El token proporcionado no es válido. Por favor verifica e intenta de nuevo.
        </div>
      )}

      {/* Benefits section */}
      <div className="token-benefits">
        <div className="benefits-title">
          <Star size={14} />
          <span>Ventajas de usar tu propio token:</span>
        </div>
        <ul className="benefits-list">
          <li>Mejores límites de uso mensual</li>
          <li>Acceso a analíticas personalizadas</li>
        </ul>
      </div>

      {/* Token input */}
      <div className="token-input-wrapper">
        <input
          type={showToken ? 'text' : 'password'}
          className={`token-input ${hasTokenError ? 'error' : ''}`}
          placeholder="Pega tu token de Bitly aquí"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="visibility-toggle"
          onClick={() => setShowToken(!showToken)}
          title={showToken ? 'Ocultar token' : 'Mostrar token'}
          type="button"
        >
          {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Action buttons */}
      <div className="token-actions">
        <button className="save-token-btn" onClick={handleSave} disabled={!hasInputValue}>
          <Save size={14} />
          <span>Guardar token</span>
        </button>

        {hasStoredToken && (
          <button className="clear-token-btn" onClick={handleClear}>
            <Trash2 size={14} />
            <span>Borrar token guardado</span>
          </button>
        )}
      </div>

      {/* Saved confirmation */}
      {hasStoredToken && !hasTokenError && (
        <div className="token-saved-indicator">
          <CheckCircle size={14} />
          <span>Token guardado en este navegador</span>
        </div>
      )}

      {/* Collapsible guide */}
      <details className="token-guide" open={showGuide} onToggle={(e) => setShowGuide(e.currentTarget.open)}>
        <summary className="guide-summary">
          {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>¿Cómo obtener tu token de Bitly?</span>
        </summary>
        <div className="guide-content">
          <ol className="guide-steps">
            <li>
              Crea una cuenta gratuita en{' '}
              <a href="https://bitly.com" target="_blank" rel="noopener noreferrer">
                bitly.com
              </a>
            </li>
            <li>
              Inicia sesión y ve a{' '}
              <a href="https://app.bitly.com/settings/api/" target="_blank" rel="noopener noreferrer">
                Settings → Developer settings → API
              </a>
            </li>
            <li>Haz clic en "Generate token" para crear un nuevo Access Token</li>
            <li>Copia el token generado y pégalo en el campo de arriba</li>
          </ol>
          <p className="guide-note">
            💡 <strong>Nota:</strong> El token se guardará en tu navegador para futuras visitas.
          </p>
        </div>
      </details>
    </div>
  )
}
