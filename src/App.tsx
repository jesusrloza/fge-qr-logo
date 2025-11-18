import { FileExtension } from 'qr-code-styling'
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { qrCode } from './constants'
import { shortenerServices, shortenWithService, ShortenerServiceId } from './services/urlShortener'
import { Link as LinkIcon, Download as DownloadIcon, Copy as CopyIcon, Check as CheckIcon } from 'lucide-react'

// Mostrar advertencia si la URL tiene esta cantidad de caracteres o menos.
// Se elevó a 40 para que URLs como la del ejemplo (33) muestren la advertencia.
const SHORT_URL_WARNING_THRESHOLD = 40

export default function App() {
  const [url, setUrl] = useState('https://fiscaliamichoacan.gob.mx/')
  const [fileExt, setFileExt] = useState<FileExtension>('png')
  const [shortenedUrl, setShortenedUrl] = useState<string>('')
  const [isShortening, setIsShortening] = useState(false)
  const [shortenError, setShortenError] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [useShortUrl, setUseShortUrl] = useState(false)
  const [selectedService, setSelectedService] = useState<ShortenerServiceId>('none')
  const trimmedUrl = url.trim()
  const fallbackService = shortenerServices[0]!
  const currentService = shortenerServices.find((service) => service.id === selectedService) ?? fallbackService
  const showShortUrlWarning = trimmedUrl.length > 0 && trimmedUrl.length <= SHORT_URL_WARNING_THRESHOLD
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      try {
        qrCode.append(ref.current)
      } catch (error) {
        console.error('Error appending QR code:', error)
      }
    }
  }, [])

  useEffect(() => {
    try {
      // Determine which URL to use for the QR code
      const activeUrl = useShortUrl && shortenedUrl ? shortenedUrl : url

      if (activeUrl && activeUrl.trim() !== '') {
        // Dynamically adjust settings based on URL length
        const urlLength = activeUrl.length

        // Optimized for printing and copying with good error correction
        // Thresholds calculated for 40% logo size:
        // - Up to 120 chars: Error Level Q (25% recovery) - best for printing
        // - 121-180 chars: Error Level M (15% recovery) - good balance
        // - 181+ chars: Error Level L (7% recovery) + smaller logo - maximum capacity

        let imageSize = 0.4
        let errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'Q'

        if (urlLength > 180) {
          imageSize = 0.25 // Reduce logo for very long URLs
          errorCorrectionLevel = 'L' // Lowest error correction for max capacity
        } else if (urlLength > 120) {
          imageSize = 0.4 // Keep full logo
          errorCorrectionLevel = 'M' // Medium error correction
        }
        // For URLs ≤120 chars, keep default settings (imageSize: 0.4, errorCorrection: 'Q')
        // This provides the best quality for printing and copying

        qrCode.update({
          data: activeUrl,
          imageOptions: {
            imageSize: imageSize,
          },
          qrOptions: {
            errorCorrectionLevel: errorCorrectionLevel,
            mode: 'Byte',
          },
        })
      }
    } catch (error) {
      console.error('Error updating QR code:', error)
    }
  }, [url, useShortUrl, shortenedUrl])

  const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    setUrl(event.target.value)
  }

  const onExtensionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFileExt(event.target.value as FileExtension)
  }

  const onServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(event.target.value as ShortenerServiceId)
  }

  const onDownloadClick = () => {
    qrCode.download({
      extension: fileExt,
      name: 'qr-code',
    })
  }

  const shortenUrl = async () => {
    const targetUrl = url.trim()
    if (!targetUrl) {
      setShortenError('Por favor ingrese una URL válida')
      return
    }

    setIsShortening(true)
    setShortenError('')
    setShortenedUrl('')

    try {
      const shortUrl = await shortenWithService(currentService.id, targetUrl)

      setShortenedUrl(shortUrl)
      setUseShortUrl(true)
    } catch (error) {
      console.error('Error shortening URL:', error)
      const message =
        error instanceof Error ? error.message : 'No se pudo acortar la URL. Por favor intenta nuevamente.'
      setShortenError(message)
    } finally {
      setIsShortening(false)
    }
  }

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
    <div className="App">
      <header className="header">
        <h1>Generador de Códigos QR</h1>
        <p>Fiscalía General del Estado de Michoacán</p>
      </header>
      <div className="instructions">
        <p>
          Ingrese la URL que desea codificar en el código QR. Seleccione el formato de descarga y haga clic en
          "Descargar" para obtener su código QR personalizado.
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          💡 <strong>Consejo:</strong> Para mejor calidad de impresión y escaneo, mantenga las URLs por debajo de 120
          caracteres. Los códigos QR están optimizados para resistir daños en copias e impresoras antiguas.
        </p>
      </div>
      <div className="container">
        <div className="card">
          <h2>Configuración</h2>
          <div className="input-group">
            <label htmlFor="url">URL:</label>
            <input id="url" type="url" value={url} onChange={onUrlChange} placeholder="Ingrese la URL aquí" />
            {(() => {
              const activeUrlLength = useShortUrl && shortenedUrl ? shortenedUrl.length : url.length
              const isShortUrlActive = useShortUrl && shortenedUrl
              return (
                <small
                  style={{
                    color: activeUrlLength > 180 ? 'red' : activeUrlLength > 120 ? 'orange' : 'green',
                    fontWeight: activeUrlLength > 120 ? 'bold' : 'normal',
                  }}
                >
                  Caracteres: {activeUrlLength}
                  {isShortUrlActive && ' (URL corta)'}
                  {!isShortUrlActive && ' (URL original)'}
                  {activeUrlLength <= 120 && ' ✓ Calidad óptima para impresión'}
                  {activeUrlLength > 120 && activeUrlLength <= 180 && ' ⚠️ Calidad media - aún apta para impresión'}
                  {activeUrlLength > 180 && ' ⚠️ Calidad reducida - puede ser difícil de escanear en impresiones'}
                </small>
              )
            })()}

            <div className="url-shortener-section">
              <div className="service-selector">
                <label htmlFor="shortener-service">Servicio de acortamiento</label>
                <select id="shortener-service" value={selectedService} onChange={onServiceChange}>
                  <option value="none">Ninguno</option>
                  {shortenerServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.label}
                    </option>
                  ))}
                </select>
                {/* Se eliminaron descripción y texto auxiliar de los servicios */}
              </div>

              {selectedService !== 'none' && (
                <>
                  <button
                    className="button button-secondary"
                    onClick={shortenUrl}
                    disabled={isShortening || !url || url.trim() === ''}
                  >
                    {isShortening ? (
                      <>
                        <LinkIcon size={16} /> Acortando...
                      </>
                    ) : (
                      <>
                        <LinkIcon size={16} /> Acortar URL
                      </>
                    )}
                  </button>
                  {shortenError && <div className="error-message">{shortenError}</div>}
                </>
              )}

              {shortenedUrl && (
                <div className="shortened-url-container">
                  <div className="shortened-url-display">
                    <span className="shortened-url-text">{shortenedUrl}</span>
                    <button className="copy-button" onClick={copyToClipboard} title="Copiar al portapapeles">
                      {copySuccess ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                    </button>
                  </div>
                  {copySuccess && <small className="copy-success">¡Copiado al portapapeles!</small>}

                  {/* Toggle control */}
                  <div className="url-toggle-container">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={useShortUrl}
                        onChange={(e) => setUseShortUrl(e.target.checked)}
                        className="toggle-checkbox"
                      />
                      <span className="toggle-text">
                        {useShortUrl ? '✓ Usando URL corta en el QR' : 'Usar URL corta en el QR'}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {selectedService !== 'none' && (
                <div className="url-shortener-warning">
                  <small>
                    ⚠️ <strong>Nota:</strong>{' '}
                    {selectedService === 'bitly'
                      ? 'Bit.ly requiere un token de acceso y puede imponer límites según tu plan. Si se revoca el token o se alcanzan cuotas, la creación de nuevos enlaces puede fallar.'
                      : 'Los acortadores gratuitos pueden dejar de funcionar, limitarse o descontinuarse. Úsalos considerando tus necesidades de confiabilidad.'}
                  </small>
                  {showShortUrlWarning && !useShortUrl && (
                    <>
                      <div className="warning-separator" />
                      <small>
                        ⚠️ ¿Seguro que quieres acortar esta URL? Tiene solo {trimmedUrl.length} caracteres y ya es
                        bastante corta.
                      </small>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <h2>Código QR Generado</h2>
          <div className="qr-container" ref={ref} />
          <div className="download-controls">
            <label htmlFor="format">Formato de descarga:</label>
            <select id="format" onChange={onExtensionChange} value={fileExt}>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WEBP</option>
            </select>
            <button className="button" onClick={onDownloadClick}>
              <DownloadIcon size={16} /> Descargar QR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
