import type { Page } from '@/types'

/** Products, categories and users: `{ data, count, page, page_count }`. */
export interface CountedList<T> {
  data: T[]
  count: number
  page: number
  page_count: number
}

export const fromCountedList = <T>(raw: CountedList<T>): Page<T> => ({
  items: raw.data,
  total: raw.count,
  page: raw.page,
  totalPages: Math.max(raw.page_count, 1),
})

/** Orders: `{ items, meta }`. */
export interface MetaList<T> {
  items: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const fromMetaList = <T>(raw: MetaList<T>): Page<T> => ({
  items: raw.items,
  total: raw.meta.total,
  page: raw.meta.page,
  totalPages: Math.max(raw.meta.totalPages, 1),
})

/** Payments: `{ payments, pagination }`. */
export interface PaymentList<T> {
  payments: T[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export const fromPaymentList = <T>(raw: PaymentList<T>): Page<T> => ({
  items: raw.payments,
  total: raw.pagination.total,
  page: raw.pagination.page,
  totalPages: Math.max(raw.pagination.totalPages, 1),
})
