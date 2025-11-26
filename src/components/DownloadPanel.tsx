import { Download } from 'lucide-react'
import type { FileExtension } from 'qr-code-styling'
import './DownloadPanel.css'

interface DownloadPanelProps {
  fileExt: FileExtension
  onExtensionChange: (ext: FileExtension) => void
  onDownload: () => void
  disabled?: boolean
}

export default function DownloadPanel({
  fileExt,
  onExtensionChange,
  onDownload,
  disabled = false,
}: DownloadPanelProps) {
  return (
    <div className="download-panel">
      <div className="download-row">
        <div className="format-selector">
          <label htmlFor="format">Formato:</label>
          <select
            id="format"
            value={fileExt}
            onChange={(e) => onExtensionChange(e.target.value as FileExtension)}
            disabled={disabled}
          >
            <option value="png">PNG (recomendado)</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
          </select>
        </div>

        <button className="download-button" onClick={onDownload} disabled={disabled}>
          <Download size={18} />
          Descargar QR
        </button>
      </div>

      <p className="download-hint">PNG es el formato recomendado para impresión y uso en documentos oficiales.</p>
    </div>
  )
}
