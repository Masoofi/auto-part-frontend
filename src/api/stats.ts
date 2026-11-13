import { useQuery } from '@tanstack/react-query'
import { request } from '@/lib/http'
import type { AdminStats } from '@/types'

export const useAdminStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: () => request<AdminStats>({ url: '/admin/stats' }),
  })
