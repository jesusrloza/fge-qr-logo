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
      qrCode.append(ref.current)
    }
  }, [])

  useEffect(() => {
    qrCode.update({
      data: url,
    })
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
      </div>
      <div className="container">
        <div className="card">
          <h2>Configuración</h2>
          <div className="input-group">
            <label htmlFor="url">URL:</label>
            <input id="url" type="url" value={url} onChange={onUrlChange} placeholder="Ingrese la URL aquí" />
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
