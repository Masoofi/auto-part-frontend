import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/auth'

/** Signed-in users only; guests are sent to /login and returned afterwards. */
export function RequireAuth() {
  const token = useAuth((s) => s.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/** The UI gate for admin pages. The API enforces the real permission. */
export function RequireAdmin() {
  const role = useAuth((s) => s.user?.role)
  const token = useAuth((s) => s.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (role !== 'ADMIN') return <Navigate to="/" replace />
  return <Outlet />
}

/** Login/register pages bounce signed-in users away. */
export function GuestOnly() {
  const token = useAuth((s) => s.token)
  return token ? <Navigate to="/" replace /> : <Outlet />
}
