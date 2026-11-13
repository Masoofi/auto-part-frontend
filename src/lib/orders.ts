import type { OrderStatus } from '@/types'

/** Mirrors the backend rule: only these can be cancelled by the customer. */
export const canCancel = (status: OrderStatus) => status === 'PENDING' || status === 'CONFIRMED'

/** Unpaid orders are PENDING until the payment is captured. */
export const canPay = (status: OrderStatus) => status === 'PENDING'

/** Mirrors the backend's one-way transitions. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}
