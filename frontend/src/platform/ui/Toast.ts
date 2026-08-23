import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastOptions {
  readonly title: string
  readonly description?: string
  readonly variant?: ToastVariant
}

export interface ToastContextValue {
  readonly toast: (options: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue>({ toast: () => undefined })

export function useToast() {
  return useContext(ToastContext)
}
