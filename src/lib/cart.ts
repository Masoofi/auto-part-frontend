import type { CartItem } from '@/types'

/** Returns a user-facing problem with this cart line, if any. */
export function cartLineIssue(item: CartItem) {
  if (!item.product.isActive) return 'This product is no longer available.'
  if (item.product.stock <= 0) return 'Out of stock.'
  if (item.quantity > item.product.stock) return `Only ${item.product.stock} left in stock.`
  return null
}
