import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/http'
import { useAuth } from '@/store/auth'
import { toast } from '@/store/toast'
import type { Cart } from '@/types'

const CART_KEY = ['cart'] as const

export const useCart = () => {
  const signedIn = useAuth((s) => Boolean(s.token))
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => request<Cart>({ url: '/cart' }),
    enabled: signedIn,
  })
}

/** Mutation responses have different shapes, so always refetch the cart instead. */
function useCartMutation<TInput>(fn: (input: TInput) => Promise<unknown>, message?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_KEY })
      if (message) toast.success(message)
    },
  })
}

export const useAddToCart = () =>
  useCartMutation(
    (input: { productId: string; quantity: number }) =>
      request({ method: 'POST', url: '/cart/items', data: input }),
    'Added to cart',
  )

export const useUpdateCartItem = () =>
  useCartMutation(({ itemId, quantity }: { itemId: string; quantity: number }) =>
    request({ method: 'PATCH', url: `/cart/items/${itemId}`, data: { quantity } }),
  )

export const useRemoveCartItem = () =>
  useCartMutation(
    (itemId: string) => request({ method: 'DELETE', url: `/cart/items/${itemId}` }),
    'Item removed',
  )

export const useClearCart = () =>
  useCartMutation(() => request({ method: 'DELETE', url: '/cart' }), 'Cart cleared')
