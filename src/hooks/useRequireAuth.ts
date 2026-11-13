import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { toast } from '@/store/toast'

/**
 * Wraps an action that needs a signed-in user. Guests are sent to /login and
 * returned to the current page afterwards.
 */
export function useRequireAuth() {
  const signedIn = useAuth((s) => Boolean(s.token))
  const navigate = useNavigate()
  const location = useLocation()

  return (action: () => void) => {
    if (signedIn) return action()
    toast.info('Please sign in to continue')
    navigate('/login', { state: { from: location.pathname + location.search } })
  }
}
