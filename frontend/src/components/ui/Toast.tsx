import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type ToastVariant = 'success' | 'error' | 'info'
interface ToastItem { id: number; variant: ToastVariant; title: string; description?: string }
interface ToastOptions { title: string; description?: string; variant?: ToastVariant }

interface ToastContextValue { toast: (opts: ToastOptions) => void }

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() { return useContext(ToastContext) }

const ICON: Record<ToastVariant, string> = { success: '✓', error: '✕', info: 'ℹ' }
const RING: Record<ToastVariant, string> = {
  success: 'border-emerald-500/40',
  error: 'border-red-500/40',
  info: 'border-primary/40',
}
const ICON_BG: Record<ToastVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-500',
  error: 'bg-red-500/15 text-red-500',
  info: 'bg-primary/15 text-primary',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback((opts: ToastOptions) => {
    const id = ++idRef.current
    const item: ToastItem = { id, variant: opts.variant ?? 'success', title: opts.title, description: opts.description }
    setToasts((t) => [...t, item])
    window.setTimeout(() => dismiss(id), 4200)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[999] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'toast-pop pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface-elevated p-3 shadow-lg',
              RING[t.variant]
            )}
          >
            <span className={cn('mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold', ICON_BG[t.variant])}>
              {ICON[t.variant]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-text">{t.title}</div>
              {t.description && <div className="mt-0.5 text-xs text-muted">{t.description}</div>}
            </div>
            <button className="text-muted hover:text-text" onClick={() => dismiss(t.id)} aria-label="Dismiss">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
