import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/** A single item in the cart, snapshotting the product at add-time. */
export interface CartItem {
  productId: string
  name: string
  price: number // in cents/KES — smallest currency unit
  quantity: number
  imageUrl: string
  slug: string
  stock: number
}

export interface CartState {
  items: CartItem[]
  /** Adds an item to the cart, or increments quantity if it already exists. */
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  /** Removes an item from the cart entirely. */
  removeItem: (productId: string) => void
  /** Sets the quantity for an item. Removes the item if quantity <= 0. */
  updateQuantity: (productId: string, quantity: number) => void
  /** Empties the cart. */
  clearCart: () => void
}

/**
 * Cart store, persisted to `sessionStorage` so it survives page refreshes
 * but clears when the tab is closed (no PII risk, per Absolute Rules).
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1): void => {
        const { items } = get()
        const existing = items.find((i) => i.productId === item.productId)

        if (existing) {
          const newQuantity = Math.min(existing.quantity + quantity, existing.stock)
          set({
            items: items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: newQuantity } : i
            )
          })
          return
        }

        const initialQuantity = Math.min(quantity, item.stock)
        set({ items: [...items, { ...item, quantity: initialQuantity }] })
      },

      removeItem: (productId: string): void => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      updateQuantity: (productId: string, quantity: number): void => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) })
          return
        }

        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          )
        })
      },

      clearCart: (): void => {
        set({ items: [] })
      }
    }),
    {
      name: 'becky-cart',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)

/**
 * Derived selector: total price of all items in the cart, in the smallest
 * currency unit (cents/KES).
 */
export function selectCartTotal(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/** Derived selector: total number of individual units across all cart items. */
export function selectCartItemCount(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.quantity, 0)
}