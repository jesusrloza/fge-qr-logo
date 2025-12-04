import { useState } from 'react'
import { Link as LinkIcon, Copy as CopyIcon, Check as CheckIcon, AlertTriangle, Zap, RefreshCw } from 'lucide-react'
import { shortenerServices, ShortenerServiceId } from '../constants/shortener'
import BitlyTokenInput from './BitlyTokenInput'
import './ShortenerControls.css'

interface ShortenerControlsProps {
  originalUrl: string
  shortenedUrl: string
  selectedService: ShortenerServiceId
  isShortening: boolean
  error: string
  errorCode?: string // Distinct error code for handling
  useShortUrl: boolean
  isQrGenerated: boolean
  userBitlyToken: string
  onServiceChange: (service: ShortenerServiceId) => void
  onShorten: () => void
  onToggleUseShort: (use: boolean) => void
  onUserBitlyTokenChange: (token: string) => void
}

export default function ShortenerControls({
  originalUrl,
  shortenedUrl,
  selectedService,
  isShortening,
  error,
  errorCode,
  userBitlyToken,
  onServiceChange,
  onShorten,
  onUserBitlyTokenChange,
}: ShortenerControlsProps) {
  const [copySuccess, setCopySuccess] = useState(false)

  const trimmedUrl = originalUrl.trim()
  const isShortUrlWarning = trimmedUrl.length > 0 && trimmedUrl.length <= 40

  // Determine if we should show BitlyTokenInput and its state
  const isBitlySelected = selectedService === 'bitly'
  const isBitlyTokenError = errorCode === 'BITLY_NO_TOKEN' || errorCode === 'BITLY_INVALID_TOKEN'
  const bitlyNeedsToken = isBitlySelected && !userBitlyToken

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  return (
    <div className="shortener-container">
      <div className="shortener-header">
        <Zap size={18} />
        <h3>Acortar URL (Opcional)</h3>
      </div>

      <p className="shortener-description">
        Si tu URL es muy larga, puedes acortarla para mejorar la calidad del código QR y facilitar que los usuarios la
        escriban manualmente.
      </p>

      <div className="service-selector">
        <label htmlFor="shortener-service">Servicio de acortamiento:</label>
        <select
          id="shortener-service"
          value={selectedService}
          onChange={(e) => onServiceChange(e.target.value as ShortenerServiceId)}
          disabled={isShortening}
        >
          <option value="none">No acortar</option>
          {shortenerServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.label} - {service.description}
            </option>
          ))}
        </select>
      </div>

      {selectedService !== 'none' && (
        <>
          {isShortUrlWarning && (
            <div className="short-url-warning">
              <AlertTriangle size={16} />
              <span>Tu URL ya tiene solo {trimmedUrl.length} caracteres. ¿Seguro que necesitas acortarla?</span>
            </div>
          )}

          {/* Bitly Token Input - shown when Bitly is selected */}
          {isBitlySelected && (
            <BitlyTokenInput
              userToken={userBitlyToken}
              onTokenChange={onUserBitlyTokenChange}
              hasTokenError={isBitlyTokenError}
            />
          )}

          <button
            className="shorten-button"
            onClick={onShorten}
            disabled={isShortening || !trimmedUrl || bitlyNeedsToken}
          >
            {isShortening ? (
              <>
                <RefreshCw size={16} className="spinning" />
                Acortando...
              </>
            ) : (
              <>
                <LinkIcon size={16} />
                Acortar URL
              </>
            )}
          </button>

          {/* Error display - but not for token errors when BitlyTokenInput is shown */}
          {error && !(isBitlyTokenError && isBitlySelected) && (
            <div className="shortener-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Service warning - only for non-bitly services */}
          {selectedService !== 'bitly' && (
            <div className="service-warning">
              <AlertTriangle size={14} />
              <span>Los acortadores gratuitos pueden dejar de funcionar o limitarse en el futuro.</span>
            </div>
          )}
        </>
      )}

      {shortenedUrl && (
        <div className="shortened-result">
          <div className="shortened-header">
            <CheckIcon size={16} className="success-icon" />
            <span>URL acortada exitosamente</span>
          </div>

          <div className="shortened-url-box">
            <code className="shortened-url">{shortenedUrl}</code>
            <button className="copy-btn" onClick={copyToClipboard} title="Copiar al portapapeles">
              {copySuccess ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            </button>
          </div>

          {copySuccess && <span className="copy-feedback">¡Copiado al portapapeles!</span>}
        </div>
      )}
    </div>
  )
}
