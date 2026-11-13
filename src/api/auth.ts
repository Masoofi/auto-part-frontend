import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cleanParams, request } from '@/lib/http'
import { useAuth } from '@/store/auth'
import { toast } from '@/store/toast'
import type { AuthUser } from '@/types'

interface LoginResponse {
  access_token: string
  user: AuthUser
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  firstName: string
  lastName: string
  phone?: string
}

export function useLogin() {
  const queryClient = useQueryClient()
  const login = useAuth((s) => s.login)

  return useMutation({
    mutationFn: (input: LoginInput) =>
      request<LoginResponse>({ method: 'POST', url: '/auth/login', data: input }),
    onSuccess: ({ access_token, user }) => {
      queryClient.clear()
      login(access_token, user)
      toast.success(`Welcome back, ${user.firstName}`)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      request<unknown>({ method: 'POST', url: '/users', data: cleanParams(input) }),
    onSuccess: () => toast.success('Account created. Please sign in.'),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const logout = useAuth((s) => s.logout)

  return () => {
    logout()
    queryClient.clear()
  }
}
