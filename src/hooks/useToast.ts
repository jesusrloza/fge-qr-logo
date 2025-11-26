import { useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const showError = (title: string, message: string, action?: ToastMessage['action']) => {
    addToast({ type: 'error', title, message, action, duration: 8000 })
  }

  const showWarning = (title: string, message: string) => {
    addToast({ type: 'warning', title, message, duration: 5000 })
  }

  const showSuccess = (title: string, message: string) => {
    addToast({ type: 'success', title, message, duration: 3000 })
  }

  const showInfo = (title: string, message: string) => {
    addToast({ type: 'info', title, message, duration: 4000 })
  }

  return {
    toasts,
    addToast,
    dismissToast,
    showError,
    showWarning,
    showSuccess,
    showInfo,
  }
}
