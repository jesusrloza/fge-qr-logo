import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({ errorInfo })
    // Errors are logged to console only (no server-side logging)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleGoHome = () => {
    window.location.href = import.meta.env.BASE_URL
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <AlertTriangle size={48} color="#dc2626" />
            </div>
            <h1 style={styles.title}>¡Algo salió mal!</h1>
            <p style={styles.description}>
              Ha ocurrido un error inesperado al cargar la aplicación. Por favor, intenta de nuevo o contacta al
              administrador si el problema persiste.
            </p>

            {this.state.error && (
              <div style={styles.errorBox}>
                <code style={styles.errorCode}>{this.state.error.message}</code>
              </div>
            )}

            <div style={styles.actions}>
              <button style={styles.primaryButton} onClick={this.handleRetry}>
                <RefreshCw size={18} />
                Intentar de nuevo
              </button>
              <button style={styles.secondaryButton} onClick={this.handleGoHome}>
                <Home size={18} />
                Ir al inicio
              </button>
            </div>

            <p style={styles.helpText}>Si el problema persiste, contacta a la DGTIPE para asistencia técnica.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f8fa',
    padding: '20px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, Arial, sans-serif",
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  iconContainer: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#152f4a',
    margin: '0 0 12px 0',
  },
  description: {
    fontSize: '15px',
    color: '#6b7280',
    lineHeight: 1.6,
    margin: '0 0 20px 0',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  errorCode: {
    fontSize: '13px',
    color: '#dc2626',
    wordBreak: 'break-word',
    fontFamily: "'Courier New', monospace",
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#152f4a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  helpText: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
}

export default ErrorBoundary
