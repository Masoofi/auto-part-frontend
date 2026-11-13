import axios, { type AxiosRequestConfig } from 'axios'
import { useAuth } from '@/store/auth'

interface Envelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const client = axios.create({
  // Dev: relative `/api`, proxied by Vite. Production: set VITE_API_URL to the API origin.
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

client.interceptors.request.use((config) => {
  const token = useAuth.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (!axios.isAxiosError<Envelope<null>>(error)) return Promise.reject(error)

    const status = error.response?.status ?? 0
    // Expired or invalid session: drop it so route guards send the user to /login.
    if (status === 401 && useAuth.getState().token) useAuth.getState().logout()

    const message =
      error.response?.data?.message ??
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Is the backend running?'
        : 'Something went wrong')
    return Promise.reject(new ApiError(message, status))
  },
)

/** Unwraps the `{ success, data }` envelope every endpoint returns. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await client.request<Envelope<T>>(config)
  return res.data.data
}

/** Drops empty values: the backend rejects unknown or blank query params. */
export function cleanParams<T extends object>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong'
