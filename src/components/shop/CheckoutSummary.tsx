'use client'

import { useCart } from '@/hooks/useCart'
import { formatKES, formatUSD } from '@/lib/utils/currency'

interface CheckoutSummaryProps {
  currency: 'KES' | 'USD'
}

export function CheckoutSummary({ currency }: CheckoutSummaryProps) {
  const { items, total } = useCart()
  const formattedTotal =
    currency === 'KES' ? formatKES(total) : formatUSD(total)

  return (
    <div className="space-y-4">
      <div className="border-t border-neutral-100 pt-4">
        <h2 className="text-base font-semibold text-neutral-900">
          Order Summary
        </h2>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex items-start justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-neutral-500">
                  {item.quantity} × {currency === 'KES' ? formatKES(item.price) : formatUSD(item.price)}
                </p>
              </div>
              <p className="text-neutral-900">
                {currency === 'KES' ? formatKES(item.price * item.quantity) : formatUSD(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <p className="text-sm font-medium text-neutral-600">
            Subtotal
          </p>
          <p className="text-xl font-semibold text-neutral-900">
            {formattedTotal}
          </p>
        </div>
      </div>
    </div>
  )
}