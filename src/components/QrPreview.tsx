import { forwardRef } from 'react'
import { QrCode, Sparkles } from 'lucide-react'
import './QrPreview.css'

interface QrPreviewProps {
  activeUrl: string
  isUsingShortUrl: boolean
  isGenerated: boolean
  onGenerate: () => void
  isGenerating?: boolean
  shortenedUrl?: string
  onToggleUseShort?: (useShort: boolean) => void
}

const QrPreview = forwardRef<HTMLDivElement, QrPreviewProps>(
  (
    { activeUrl, isUsingShortUrl, isGenerated, onGenerate, isGenerating = false, shortenedUrl, onToggleUseShort },
    ref,
  ) => {
    const showUrlToggle = !!shortenedUrl && !!onToggleUseShort

    return (
      <div className="qr-preview-container">
        <div className="qr-preview-header">
          <QrCode size={20} />
          <h3>Vista Previa del Código QR</h3>
        </div>

        <div className={`qr-preview-box ${isGenerated ? 'qr-generated' : ''}`}>
          <div
            className="qr-render-target"
            ref={ref}
            aria-live="polite"
            aria-label="Vista previa del código QR"
            style={{ visibility: isGenerated ? 'visible' : 'hidden' }}
          />
          {!isGenerated && (
            <div className="qr-placeholder">
              <QrCode size={48} strokeWidth={1} />
              <p>Presiona "Generar QR" para crear el código</p>
            </div>
          )}
        </div>

        <button className="generate-qr-button" onClick={onGenerate} disabled={!activeUrl.trim() || isGenerating}>
          <Sparkles size={18} />
          {isGenerating ? 'Generando...' : isGenerated ? 'Regenerar QR' : 'Generar QR'}
        </button>

        <div className="qr-active-url">
          <div className="qr-url-header">
            <span className="url-label-small">
              URL {isGenerated ? 'en el QR' : 'a codificar'} ({isUsingShortUrl ? 'corta' : 'original'}):
            </span>
            <span className="qr-char-count">{activeUrl.length} caracteres</span>
          </div>
          <code className="active-url-text">{activeUrl || 'Ingresa una URL para generar el código'}</code>
        </div>

        {/* URL toggle - shown when shortened URL is available */}
        {showUrlToggle && (
          <div className="qr-url-toggle">
            <label className="qr-toggle-wrapper">
              <input type="checkbox" checked={isUsingShortUrl} onChange={(e) => onToggleUseShort!(e.target.checked)} />
              <span className="qr-toggle-slider"></span>
              <span className="qr-toggle-label">
                {isUsingShortUrl ? '✓ Usando URL corta en el QR' : 'Usar URL corta en el QR'}
              </span>
            </label>
          </div>
        )}
      </div>
    )
  },
)

QrPreview.displayName = 'QrPreview'

export default QrPreview
