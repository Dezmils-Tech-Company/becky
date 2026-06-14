'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useUIStore } from '../../store/ui.store'
import type { ToastType } from '../../store/ui.store'
import { cn } from '../../lib/utils/cn'

const TOAST_STYLES: Record<ToastType, { icon: typeof CheckCircle2; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error: { icon: XCircle, classes: 'border-rose-200 bg-rose-50 text-rose-800' },
  info: { icon: Info, classes: 'border-pink-200 bg-pink-50 text-pink-800' },
  warning: { icon: AlertTriangle, classes: 'border-amber-200 bg-amber-50 text-amber-800' }
}

/**
 * Global toast notification, fixed to the bottom-right of the viewport.
 * Reads from `useUIStore`; auto-dismisses after 4 seconds.
 */
export function Toast(): React.ReactNode {
  const toast = useUIStore((state) => state.toast)
  const dismissToast = useUIStore((state) => state.dismissToast)

  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => {
      dismissToast()
    }, 4000)

    return (): void => clearTimeout(timer)
  }, [toast, dismissToast])

  if (!toast) return null

  const { icon: Icon, classes } = TOAST_STYLES[toast.type]

  return (
    <div className="fixed bottom-4 right-4 z-50" role="status" aria-live="polite">
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
          classes
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="ml-2 flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}