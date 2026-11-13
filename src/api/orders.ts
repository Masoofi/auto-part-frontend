import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cleanParams, request } from '@/lib/http'
import { fromMetaList, type MetaList } from '@/lib/pagination'
import { toast } from '@/store/toast'
import type { Order, OrderStatus } from '@/types'

export interface OrderFilters {
  status?: OrderStatus
  search?: string
  page?: number
  limit?: number
}

export const useOrders = (filters: OrderFilters) =>
  useQuery({
    queryKey: ['orders', 'mine', filters],
    queryFn: async () =>
      fromMetaList(
        await request<MetaList<Order>>({ url: '/orders', params: cleanParams(filters) }),
      ),
    placeholderData: keepPreviousData,
  })

export const useAdminOrders = (filters: OrderFilters) =>
  useQuery({
    queryKey: ['orders', 'admin', filters],
    queryFn: async () =>
      fromMetaList(
        await request<MetaList<Order>>({
          url: '/orders/admin/all',
          params: cleanParams(filters),
        }),
      ),
    placeholderData: keepPreviousData,
  })

export const useOrder = (id: string | undefined) =>
  useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => request<Order>({ url: `/orders/${id}` }),
    enabled: Boolean(id),
  })

function useOrderMutation<TInput, TResult = unknown>(
  fn: (input: TInput) => Promise<TResult>,
  message: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success(message)
    },
  })
}

/** Turns the current cart into an order. */
export const usePlaceOrder = () =>
  useOrderMutation(() => request<Order>({ method: 'POST', url: '/orders' }), 'Order placed')

export const useCancelOrder = () =>
  useOrderMutation(
    (id: string) => request<Order>({ method: 'PATCH', url: `/orders/${id}/cancel` }),
    'Order cancelled',
  )

export const useUpdateOrderStatus = () =>
  useOrderMutation(
    ({ id, status }: { id: string; status: OrderStatus }) =>
      request<Order>({ method: 'PATCH', url: `/orders/${id}/status`, data: { status } }),
    'Order status updated',
  )
