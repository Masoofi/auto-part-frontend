export type Role = 'CUSTOMER' | 'ADMIN'

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_STATUSES = [
  'PENDING',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string | null
  price: string
  stock: number
  brand: string | null
  imageUrl: string | null
  isActive: boolean
  categoryId: string
  category?: Category
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  lineTotal: string
  product: Pick<Product, 'id' | 'name' | 'sku' | 'price' | 'stock' | 'imageUrl' | 'isActive'>
}

export interface Cart {
  id?: string | null
  items: CartItem[]
  summary: { uniqueItems: number; totalQuantity: number; subtotal: string }
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  price: string
  quantity: number
  lineTotal: string
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: string
  shippingFee: string
  tax: string
  total: string
  createdAt: string
  items: OrderItem[]
  user?: { id: string; email: string; role: Role }
}

export interface Payment {
  id: string
  orderId: string
  provider: 'RAZORPAY' | 'STRIPE'
  status: PaymentStatus
  amount: string
  currency: string
  paymentMethod: string | null
  failureReason: string | null
  paidAt: string | null
  createdAt: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: Role
  isActive: boolean
  createdAt: string
}

export interface AdminStats {
  orders: { total: number; today: number; byStatus: Partial<Record<OrderStatus, number>> }
  revenue: string
  products: {
    active: number
    lowStockThreshold: number
    lowStockCount: number
    lowStock: Pick<Product, 'id' | 'name' | 'sku' | 'stock'>[]
  }
  customers: number
}

/** One shape for every paginated list, whatever the backend returns. */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}
