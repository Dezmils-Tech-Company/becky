import { cn } from '../../lib/utils/cn'
import type {
  OrderStatus,
  OrderPaymentStatus
} from '../../models/Order'

export type BadgeVariant =
  | 'neutral'
  | 'pink'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-neutral-100 text-neutral-700',
  pink: 'bg-pink-50 text-pink-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  info: 'bg-sky-50 text-sky-700'
}

/**
 * A small rounded label for statuses and tags.
 */
export function Badge({ children, variant = 'neutral', className }: BadgeProps): React.ReactNode {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

const ORDER_STATUS_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'pink',
  shipped: 'pink',
  delivered: 'success',
  cancelled: 'danger'
}

const PAYMENT_STATUS_VARIANTS: Record<OrderPaymentStatus, BadgeVariant> = {
  unpaid: 'neutral',
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'info'
}

/** Renders a `Badge` styled for the given order status. */
export function OrderStatusBadge({ status }: { status: OrderStatus }): React.ReactNode {
  return (
    <Badge variant={ORDER_STATUS_VARIANTS[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

/** Renders a `Badge` styled for the given payment status. */
export function PaymentStatusBadge({ status }: { status: OrderPaymentStatus }): React.ReactNode {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANTS[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}