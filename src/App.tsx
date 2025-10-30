import { FileExtension } from 'qr-code-styling'
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { qrCode } from './constants'

export default function App() {
  const [url, setUrl] = useState('https://fiscaliamichoacan.gob.mx/')
  const [fileExt, setFileExt] = useState<FileExtension>('png')
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
      if (url && url.trim() !== '') {
        // Dynamically adjust settings based on URL length
        const urlLength = url.length

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
          data: url,
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
  }, [url])

  const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    setUrl(event.target.value)
  }

  const onExtensionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFileExt(event.target.value as FileExtension)
  }

  const onDownloadClick = () => {
    qrCode.download({
      extension: fileExt,
      name: 'qr-code',
    })
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
            <small
              style={{
                color: url.length > 180 ? 'red' : url.length > 120 ? 'orange' : 'green',
                fontWeight: url.length > 120 ? 'bold' : 'normal',
              }}
            >
              Caracteres: {url.length}
              {url.length <= 120 && ' ✓ Calidad óptima para impresión'}
              {url.length > 120 && url.length <= 180 && ' ⚠️ Calidad media - aún apta para impresión'}
              {url.length > 180 && ' ⚠️ Calidad reducida - puede ser difícil de escanear en impresiones'}
            </small>
            <label htmlFor="format">Formato de descarga:</label>
            <select id="format" onChange={onExtensionChange} value={fileExt}>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WEBP</option>
            </select>
            <button className="button" onClick={onDownloadClick}>
              Descargar QR
            </button>
          </div>
        </div>
        <div className="card">
          <h2>Código QR Generado</h2>
          <div className="qr-container" ref={ref} />
        </div>
      </div>
    </div>
  )
}
