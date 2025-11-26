import { FileExtension } from 'qr-code-styling'
import type QRCodeStyling from 'qr-code-styling'
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { createQrCodeAsync, getQrVersion } from './constants'
import { shortenUrl, logEvent } from './services/api'
import { hasValidSession, getCurpForApi, getStoredToken } from './services/auth'
import { CurpModal, UrlInput, ShortenerControls, QrPreview, DownloadPanel, ToastContainer } from './components'
import type { ShortenerServiceId } from './components'
import { useToast } from './hooks'

export default function App() {
  // Auth state
  const [showCurpModal, setShowCurpModal] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  // URL state
  const [url, setUrl] = useState('https://fiscaliamichoacan.gob.mx/')
  const [shortenedUrl, setShortenedUrl] = useState<string>('')
  const [useShortUrl, setUseShortUrl] = useState(false)

  // QR state
  const [isQrGenerated, setIsQrGenerated] = useState(false)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)

  // Shortener state
  const [selectedService, setSelectedService] = useState<ShortenerServiceId>('none')
  const [isShortening, setIsShortening] = useState(false)
  const [shortenError, setShortenError] = useState<string>('')

  // Download state
  const [fileExt, setFileExt] = useState<FileExtension>('png')

  // Toast notifications
  const { toasts, dismissToast, showError, showSuccess, showInfo } = useToast()

  // QR code ref
  const qrRef = useRef<HTMLDivElement>(null)
  const qrInstanceRef = useRef<QRCodeStyling | null>(null)

  // Computed values - URL that would be used for QR generation
  const activeUrl = useShortUrl && shortenedUrl ? shortenedUrl : url
  const activeUrlLength = activeUrl.length

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken()
      if (!token) {
        setShowCurpModal(true)
      } else if (token !== 'anonymous') {
        const isValid = await hasValidSession()
        if (!isValid) {
          setShowCurpModal(true)
        }
      }
      setIsAuthChecked(true)
    }
    checkAuth()
  }, [])

  // Initialize QR code library (create fresh instance and append to DOM)
  // This effect must run AFTER isAuthChecked is true, so the QrPreview component is mounted
  useEffect(() => {
    // Don't run until auth check is complete and the QR preview is mounted
    if (!isAuthChecked) {
      console.log('[QR Debug] Init effect skipped - auth not checked yet')
      return
    }

    console.log('[QR Debug] Init effect running', {
      hasRef: !!qrRef.current,
      hasInstance: !!qrInstanceRef.current,
      refChildren: qrRef.current?.children.length,
    })

    if (qrRef.current && !qrInstanceRef.current) {
      // Create QR instance asynchronously to ensure logo is cached
      const initQr = async () => {
        try {
          if (!qrRef.current) return

          // Clear any existing content first
          qrRef.current.innerHTML = ''

          // Create a fresh QR code instance with cached logo
          console.log('[QR Debug] Creating fresh QR instance (async) and appending')
          const qrInstance = await createQrCodeAsync()

          if (!qrRef.current) return // Component may have unmounted

          qrInstance.append(qrRef.current)
          qrInstanceRef.current = qrInstance

          // Check what was appended
          setTimeout(() => {
            const canvas = qrRef.current?.querySelector('canvas')
            console.log('[QR Debug] After append', {
              hasCanvas: !!canvas,
              canvasWidth: canvas?.width,
              canvasHeight: canvas?.height,
              canvasDisplay: canvas?.style.display,
              refChildren: qrRef.current?.children.length,
            })
          }, 100)
        } catch (error) {
          console.error('Error initializing QR code:', error)
        }
      }

      initQr()
    }

    // Cleanup: destroy instance when component unmounts
    return () => {
      console.log('[QR Debug] Cleanup - clearing instance ref')
      qrInstanceRef.current = null
    }
  }, [isAuthChecked])

  // Track if the active URL has changed since last QR generation
  const lastGeneratedUrlRef = useRef<string>('')

  // Handle toggling between short/original URL - regenerate QR if it was already generated
  const handleToggleUseShort = (useShort: boolean) => {
    setUseShortUrl(useShort)

    // Only regenerate if QR was already generated and we have a shortened URL to toggle to/from
    if (isQrGenerated && shortenedUrl) {
      const newActiveUrl = useShort ? shortenedUrl : url
      regenerateQrWithUrl(newActiveUrl)
    }
  }

  // Helper function to regenerate QR with a specific URL (used by toggle and generate button)
  const regenerateQrWithUrl = (targetUrl: string) => {
    const qrInstance = qrInstanceRef.current
    if (!qrInstance || !targetUrl.trim()) return

    const urlLength = targetUrl.length

    // Adjust logo size based on URL length to maintain scannability
    let imageSize = 0.4
    if (urlLength > 180) {
      imageSize = 0.25
    } else if (urlLength > 120) {
      imageSize = 0.35
    }

    // Calculate appropriate QR version (at least MIN_QR_VERSION for recognition)
    const typeNumber = getQrVersion(urlLength)

    qrInstance.update({
      data: targetUrl,
      imageOptions: { imageSize },
      qrOptions: {
        errorCorrectionLevel: 'Q',
        mode: 'Byte',
        typeNumber,
      },
    })

    lastGeneratedUrlRef.current = targetUrl
  }

  // Handle QR generation
  const handleGenerateQr = () => {
    if (!activeUrl.trim()) return

    const qrInstance = qrInstanceRef.current
    console.log('[QR Debug] Generate clicked', {
      hasRef: !!qrRef.current,
      hasInstance: !!qrInstance,
      refChildren: qrRef.current?.children.length,
      hasCanvas: !!qrRef.current?.querySelector('canvas'),
    })

    if (!qrInstance) {
      console.error('[QR Debug] No QR instance available!')
      showError('Error', 'El generador de QR no está listo. Por favor recarga la página.')
      return
    }

    setIsGeneratingQr(true)

    try {
      console.log('[QR Debug] Calling regenerateQrWithUrl()', { urlLength: activeUrl.length })

      // Use the helper function to regenerate QR
      regenerateQrWithUrl(activeUrl)

      // Check canvas state after update
      setTimeout(() => {
        const canvas = qrRef.current?.querySelector('canvas')
        console.log('[QR Debug] After update', {
          hasCanvas: !!canvas,
          canvasWidth: canvas?.width,
          canvasHeight: canvas?.height,
          canvasStyleWidth: canvas?.style.width,
          canvasStyleHeight: canvas?.style.height,
        })
      }, 100)

      setIsQrGenerated(true)

      // Log QR generation - only on explicit user action (button click)
      logEvent(
        'qr_generated',
        {
          url: activeUrl,
          urlLength: activeUrl.length,
          isShortened: useShortUrl && !!shortenedUrl,
        },
        getCurpForApi(),
      )

      showSuccess('QR generado', 'El código QR se generó exitosamente.')
    } catch (error) {
      console.error('Error generating QR code:', error)
      showError('Error', 'No se pudo generar el código QR.')
    } finally {
      setIsGeneratingQr(false)
    }
  }

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    // Don't reset shortener state - they're independent
  }

  const handleShorten = async () => {
    const targetUrl = url.trim()
    if (!targetUrl) {
      setShortenError('Por favor ingrese una URL válida')
      return
    }

    if (selectedService === 'none') {
      setShortenError('Por favor seleccione un servicio de acortamiento')
      return
    }

    setIsShortening(true)
    setShortenError('')
    setShortenedUrl('')

    try {
      const result = await shortenUrl(targetUrl, selectedService, getCurpForApi())

      setShortenedUrl(result.shortUrl)
      setUseShortUrl(true)

      // If QR was already generated, regenerate it with the new shortened URL
      if (isQrGenerated) {
        regenerateQrWithUrl(result.shortUrl)
      }

      if (result.cached) {
        showInfo('URL en caché', 'Esta URL ya había sido acortada previamente.')
      } else {
        showSuccess('URL acortada', 'La URL se acortó exitosamente.')
      }
    } catch (error) {
      console.error('Error shortening URL:', error)
      const message =
        error instanceof Error ? error.message : 'No se pudo acortar la URL. Por favor intenta nuevamente.'
      setShortenError(message)
      showError('Error al acortar URL', message, {
        label: 'Intentar con otro servicio',
        onClick: () => {
          const services: ShortenerServiceId[] = ['isgd', 'tinyurl', 'bitly']
          const currentIndex = services.indexOf(selectedService as ShortenerServiceId)
          const nextService = services[(currentIndex + 1) % services.length]
          setSelectedService(nextService)
        },
      })
    } finally {
      setIsShortening(false)
    }
  }

  const handleDownload = () => {
    if (!isQrGenerated) {
      showError('Sin QR', 'Primero genera un código QR para poder descargarlo.')
      return
    }

    const qrInstance = qrInstanceRef.current
    if (!qrInstance) {
      showError('Error', 'El generador de QR no está disponible.')
      return
    }

    qrInstance.download({
      extension: fileExt,
      name: 'qr-fge-michoacan',
    })

    // Log download event - intentional user action
    logEvent(
      'qr_downloaded',
      {
        url: lastGeneratedUrlRef.current,
        format: fileExt,
        isShortened: useShortUrl && !!shortenedUrl,
      },
      getCurpForApi(),
    )

    showSuccess('QR descargado', `El código QR se descargó en formato ${fileExt.toUpperCase()}.`)
  }

  const handleAuthSuccess = () => {
    showSuccess('Sesión iniciada', 'Tu identificación ha sido registrada.')
    logEvent('auth_success', { anonymous: false }, getCurpForApi())
  }

  if (!isAuthChecked) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="App">
      <CurpModal isOpen={showCurpModal} onClose={() => setShowCurpModal(false)} onSuccess={handleAuthSuccess} />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <header className="header">
        <h1>Generador de Códigos QR</h1>
        <p>Fiscalía General del Estado de Michoacán</p>
      </header>

      <main className="main-content">
        <div className="card card-config">
          <h2>1. Ingresa la URL</h2>
          <UrlInput
            url={url}
            onChange={handleUrlChange}
            activeUrlLength={activeUrlLength}
            isUsingShortUrl={useShortUrl && !!shortenedUrl}
          />

          <h2 className="section-title">2. Acortar URL (Opcional)</h2>
          <ShortenerControls
            originalUrl={url}
            shortenedUrl={shortenedUrl}
            selectedService={selectedService}
            isShortening={isShortening}
            error={shortenError}
            useShortUrl={useShortUrl}
            isQrGenerated={isQrGenerated}
            onServiceChange={setSelectedService}
            onShorten={handleShorten}
            onToggleUseShort={handleToggleUseShort}
          />
        </div>

        <div className="card card-preview">
          <h2>3. Vista Previa y Descarga</h2>
          <QrPreview
            ref={qrRef}
            activeUrl={activeUrl}
            isUsingShortUrl={useShortUrl && !!shortenedUrl}
            isGenerated={isQrGenerated}
            onGenerate={handleGenerateQr}
            isGenerating={isGeneratingQr}
          />
          <DownloadPanel
            fileExt={fileExt}
            onExtensionChange={setFileExt}
            onDownload={handleDownload}
            disabled={!isQrGenerated}
          />
        </div>
      </main>

      <footer className="footer">
        <p>Dirección General de Tecnologías de la Información, Planeación y Estadística</p>
        <p className="footer-version">v0.1.0</p>
      </footer>
    </div>
  )
}
