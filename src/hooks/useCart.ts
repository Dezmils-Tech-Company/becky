import { useCartStore } from '../store/cart.store';
import type { CartState } from '../store/cart.store';
import { selectCartTotal, selectCartItemCount } from '../store/cart.store';

/**
 * Hook to access the cart store state and actions.
 * Returns the cart items, cart actions, and derived totals.
 */
export function useCart() {
  const store = useCartStore((state: CartState) => state);
  const total = selectCartTotal(store);
  const itemCount = selectCartItemCount(store);
  return {
    items: store.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    total,
    itemCount,
  };
}