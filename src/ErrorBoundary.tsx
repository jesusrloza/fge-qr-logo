import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
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
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Algo salió mal</h1>
          <p>Ha ocurrido un error al cargar la aplicación.</p>
          <p style={{ color: 'red', fontSize: '12px' }}>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: undefined })}>Intentar de nuevo</button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
