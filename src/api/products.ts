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

function useRefreshProducts() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['products'] })
    void queryClient.invalidateQueries({ queryKey: ['product'] })
  }
}

function useProductMutation<TInput, TData>(
  fn: (input: TInput) => Promise<TData>,
  successMessage: string | null,
) {
  const refresh = useRefreshProducts()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      refresh()
      if (successMessage) toast.success(successMessage)
    },
  })
}

export const useCreateProduct = () =>
  useProductMutation(
    (input: ProductInput) =>
      request<Product>({ method: 'POST', url: '/products', data: cleanParams(input) }),
    null,
  )

/** Sends the file as multipart form data (field name `image`). Silent on success: the form reports. */
export const useUploadProductImage = () =>
  useProductMutation(({ id, file }: { id: string; file: File }) => {
    const data = new FormData()
    data.append('image', file)
    // The client defaults to JSON, which would flatten FormData (and the File) into `{}`.
    return request({
      method: 'PATCH',
      url: `/products/${id}/image`,
      data,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }, null)

export const useDeleteProductImage = () =>
  useProductMutation(
    (id: string) => request({ method: 'DELETE', url: `/products/${id}/image` }),
    null,
  )

export const useUpdateProduct = () =>
  useProductMutation(
    ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      request({ method: 'PATCH', url: `/products/${id}`, data: cleanParams(input) }),
    null,
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
