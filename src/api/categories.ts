import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/http'
import { fromCountedList, type CountedList } from '@/lib/pagination'
import { toast } from '@/store/toast'
import type { Category } from '@/types'

export const useCategories = (page = 1, limit = 100) =>
  useQuery({
    queryKey: ['categories', page, limit],
    queryFn: async () =>
      fromCountedList(
        await request<CountedList<Category>>({ url: '/categories', params: { page, limit } }),
      ),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })

function useCategoryMutation<TInput>(
  fn: (input: TInput) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(successMessage)
    },
  })
}

export const useCreateCategory = () =>
  useCategoryMutation(
    (name: string) => request({ method: 'POST', url: '/categories', data: { name } }),
    'Category created',
  )

export const useUpdateCategory = () =>
  useCategoryMutation(
    ({ id, name }: { id: string; name: string }) =>
      request({ method: 'PATCH', url: `/categories/${id}`, data: { name } }),
    'Category updated',
  )

export const useDeleteCategory = () =>
  useCategoryMutation(
    (id: string) => request({ method: 'DELETE', url: `/categories/${id}` }),
    'Category deleted',
  )
