import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

/* ─── Context ─────────────────────────────────────────────── */
const ToastContext = createContext(null)

/* ─── Config ──────────────────────────────────────────────── */
const TOAST_CONFIG = {
  success: {
    Icon: CheckCircle,
    className: 'bg-forest text-white border-forest-dark',
    iconClass: 'text-white/80',
  },
  error: {
    Icon: AlertCircle,
    className: 'bg-clay-bg text-clay border-clay/40',
    iconClass: 'text-clay',
  },
  warning: {
    Icon: AlertTriangle,
    className: 'bg-amber-bg text-amber border-amber/40',
    iconClass: 'text-amber',
  },
  info: {
    Icon: Info,
    className: 'bg-sage text-forest border-sage-line',
    iconClass: 'text-forest',
  },
}

/* ─── Single Toast Item ───────────────────────────────────── */
function ToastItem({ id, message, type = 'info', onDismiss }) {
  const { Icon, className, iconClass } = TOAST_CONFIG[type] ?? TOAST_CONFIG.info

  return (
    <div
      className={[
        'flex items-start gap-3 px-4 py-3',
        'rounded-lg border shadow-md max-w-xs w-full',
        'animate-[toast-in_0.22s_ease-out_both]',
        className,
      ].join(' ')}
      role="alert"
    >
      <Icon size={16} className={['shrink-0 mt-0.5', iconClass].join(' ')} />
      <p className="text-sm font-sans flex-1 leading-snug">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  )
}

/* ─── Toast Container ─────────────────────────────────────── */
function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div
      className="fixed bottom-4 right-4 flex flex-col gap-2 z-50"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

/* ─── Provider ────────────────────────────────────────────── */
/**
 * Wrap your app (or page) in <ToastProvider> to enable toasts.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  /**
   * @param {{ message: string, type?: 'success'|'error'|'warning'|'info', duration?: number }} opts
   * @returns {number} toast id — pass to dismiss() for early removal
   */
  const toast = useCallback(
    ({ message, type = 'info', duration = 4000 }) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration > 0) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

/* ─── Hook ────────────────────────────────────────────────── */
/**
 * Usage:
 *   const { toast } = useToast()
 *   toast({ message: 'Done!', type: 'success' })
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
