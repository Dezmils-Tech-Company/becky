
import { Badge } from '@/components/ui/Badge'
import type { BadgeVariant } from '@/components/ui/Badge'

const statusToVariant: Record<string, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({
  status,
  className = '',
}: OrderStatusBadgeProps) {
  const variant = statusToVariant[status] || 'neutral'
  return <Badge variant={variant} className={className}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
}