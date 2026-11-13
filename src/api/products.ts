import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cleanParams, request } from '@/lib/http'
import { fromCountedList, type CountedList } from '@/lib/pagination'
import { toast } from '@/store/toast'
import type { Product } from '@/types'

export interface ProductFilters {
  search?: string
  categoryId?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'name' | 'price' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ProductInput {
  sku: string
  name: string
  price: number
  categoryId: string
  description?: string
  stock?: number
  brand?: string
  imageUrl?: string
}

/** `admin: true` also lists deactivated products (admin-only endpoint). */
export const useProducts = (filters: ProductFilters, { admin = false } = {}) =>
  useQuery({
    queryKey: ['products', { admin }, filters],
    queryFn: async () =>
      fromCountedList(
        await request<CountedList<Product>>({
          url: admin ? '/products/admin/list' : '/products',
          params: cleanParams(filters),
        }),
      ),
    placeholderData: keepPreviousData,
  })

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: () => request<Product>({ url: `/products/${id}` }),
    enabled: Boolean(id),
  })

function useProductMutation<TInput>(
  fn: (input: TInput) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['product'] })
      toast.success(successMessage)
    },
  })
}

export const useCreateProduct = () =>
  useProductMutation(
    (input: ProductInput) =>
      request({ method: 'POST', url: '/products', data: cleanParams(input) }),
    'Product created',
  )

export const useUpdateProduct = () =>
  useProductMutation(
    ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      request({ method: 'PATCH', url: `/products/${id}`, data: cleanParams(input) }),
    'Product updated',
  )

export const useDeactivateProduct = () =>
  useProductMutation(
    (id: string) => request({ method: 'DELETE', url: `/products/${id}` }),
    'Product deactivated',
  )

export const useRestoreProduct = () =>
  useProductMutation(
    (id: string) =>
      request({ method: 'PATCH', url: `/products/${id}/restore`, data: { isActive: true } }),
    'Product restored',
  )
