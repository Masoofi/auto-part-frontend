import { humanize } from '@/lib/format'
import type { OrderStatus, PaymentStatus } from '@/types'
import { Badge, type Tone } from '@/components/ui/Badge'

const orderTones: Record<OrderStatus, Tone> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
}

const paymentTones: Record<PaymentStatus, Tone> = {
  PENDING: 'warning',
  AUTHORIZED: 'info',
  CAPTURED: 'success',
  FAILED: 'danger',
  CANCELLED: 'danger',
  REFUNDED: 'neutral',
  PARTIALLY_REFUNDED: 'neutral',
}

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge tone={orderTones[status]}>{humanize(status)}</Badge>
)

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <Badge tone={paymentTones[status]}>{humanize(status)}</Badge>
)
