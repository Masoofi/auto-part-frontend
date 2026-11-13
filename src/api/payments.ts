import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cleanParams, request } from '@/lib/http'
import { fromPaymentList, type PaymentList } from '@/lib/pagination'
import type { Payment, PaymentStatus } from '@/types'

export interface CheckoutDetails {
  paymentId: string
  orderId: string
  razorpayOrderId: string
  /** In paise. */
  amount: number
  currency: string
  keyId: string
}

export interface VerifyPaymentInput {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface PaymentFilters {
  status?: PaymentStatus
  search?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export const useCreatePayment = () =>
  useMutation({
    mutationFn: (orderId: string) =>
      request<CheckoutDetails>({ method: 'POST', url: '/payments/create', data: { orderId } }),
  })

export function useVerifyPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VerifyPaymentInput) =>
      request<{ message: string; status: PaymentStatus }>({
        method: 'POST',
        url: '/payments/verify',
        data: input,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export const useOrderPayments = (orderId: string | undefined) =>
  useQuery({
    queryKey: ['payments', 'order', orderId],
    queryFn: () => request<Payment[]>({ url: `/payments/order/${orderId}` }),
    enabled: Boolean(orderId),
  })

export const useAdminPayments = (filters: PaymentFilters) =>
  useQuery({
    queryKey: ['payments', 'admin', filters],
    queryFn: async () =>
      fromPaymentList(
        await request<PaymentList<Payment>>({ url: '/payments', params: cleanParams(filters) }),
      ),
    placeholderData: keepPreviousData,
  })
