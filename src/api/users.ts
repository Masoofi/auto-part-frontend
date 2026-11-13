import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cleanParams, request } from '@/lib/http'
import { fromCountedList, type CountedList } from '@/lib/pagination'
import { toast } from '@/store/toast'
import type { Role, User } from '@/types'

// `isActive` is intentionally not a list filter: the backend validates it as a
// boolean but query strings arrive as text, so the filter can never match.
export interface UserFilters {
  search?: string
  role?: Role
  page?: number
  limit?: number
}

export const useUsers = (filters: UserFilters) =>
  useQuery({
    queryKey: ['users', filters],
    queryFn: async () =>
      fromCountedList(
        await request<CountedList<User>>({ url: '/users', params: cleanParams(filters) }),
      ),
    placeholderData: keepPreviousData,
  })

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; role?: Role; isActive?: boolean }) =>
      request<User>({ method: 'PATCH', url: `/users/${id}`, data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
    },
  })
}
