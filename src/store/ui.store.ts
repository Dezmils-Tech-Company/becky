import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export interface UIState {
  toast: Toast | null
  isCartOpen: boolean
  /** Shows a toast notification. Auto-dismissed by the Toast component after 4s. */
  showToast: (message: string, type: ToastType) => void
  /** Dismisses the current toast immediately. */
  dismissToast: () => void
  /** Toggles the cart drawer open/closed. */
  toggleCart: () => void
  /** Explicitly opens the cart drawer. */
  openCart: () => void
  /** Explicitly closes the cart drawer. */
  closeCart: () => void
}

/**
 * Global UI state store: toast notifications and cart drawer visibility.
 */
export const useUIStore = create<UIState>((set) => ({
  toast: null,
  isCartOpen: false,

  showToast: (message, type): void => {
    set({ toast: { id: crypto.randomUUID(), message, type } })
  },

  dismissToast: (): void => {
    set({ toast: null })
  },

  toggleCart: (): void => {
    set((state) => ({ isCartOpen: !state.isCartOpen }))
  },

  openCart: (): void => {
    set({ isCartOpen: true })
  },

  closeCart: (): void => {
    set({ isCartOpen: false })
  }
}))