import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import './UrlInput.css'

interface UrlInputProps {
  url: string
  onChange: (url: string) => void
  activeUrlLength: number
  isUsingShortUrl: boolean
  disabled?: boolean
}

export default function UrlInput({ url, onChange, activeUrlLength, isUsingShortUrl, disabled = false }: UrlInputProps) {
  const getQualityInfo = () => {
    if (activeUrlLength <= 120) {
      return {
        color: 'green',
        icon: <CheckCircle size={14} />,
        text: 'Calidad óptima para impresión',
        level: 'optimal',
      }
    }
    if (activeUrlLength <= 180) {
      return {
        color: 'orange',
        icon: <AlertTriangle size={14} />,
        text: 'Calidad media - aún apta para impresión',
        level: 'medium',
      }
    }
    return {
      color: 'red',
      icon: <AlertTriangle size={14} />,
      text: 'Calidad reducida - puede ser difícil de escanear',
      level: 'low',
    }
  }

  const quality = getQualityInfo()

  return (
    <div className="url-input-container">
      <label htmlFor="url-input" className="url-label">
        <Info size={16} />
        <span>URL para el código QR</span>
      </label>

      <input
        id="url-input"
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://ejemplo.com/mi-pagina"
        disabled={disabled}
        className="url-input"
      />

      <div className={`url-quality quality-${quality.level}`}>
        <span className="char-info">
          {quality.icon}
          {isUsingShortUrl && <span className="url-type-badge">URL corta</span>}
          {!isUsingShortUrl && <span className="url-type-badge url-type-original">URL original</span>}
        </span>
        <span className="quality-text">{quality.text}</span>
      </div>

      <p className="url-hint">
        💡 <strong>Consejo:</strong> Para mejor calidad de impresión y escaneo, mantenga las URLs por debajo de 120
        caracteres.
      </p>
    </div>
  )
}
