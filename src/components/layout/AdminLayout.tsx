import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useLogout } from '@/api/auth'
import { cn } from '@/lib/cn'
import { useAuth } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Logo } from './Logo'

const items: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/products', label: 'Products', icon: 'package' },
  { to: '/admin/categories', label: 'Categories', icon: 'tag' },
  { to: '/admin/orders', label: 'Orders', icon: 'cart' },
  { to: '/admin/payments', label: 'Payments', icon: 'card' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
]

export function AdminLayout() {
  const user = useAuth((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium',
              isActive ? 'bg-brand-600 text-white' : 'text-slate-200 hover:bg-white/10',
            )
          }
        >
          <Icon name={i.icon} size={18} />
          {i.label}
        </NavLink>
      ))}
    </nav>
  )

  const footer = (
    <div className="mt-auto space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
      <NavLink to="/" className="flex h-11 items-center rounded-lg px-3 hover:bg-white/10">
        View storefront
      </NavLink>
      <p className="px-3 text-slate-400">{user?.email}</p>
      <button
        type="button"
        onClick={() => {
          logout()
          navigate('/login')
        }}
        className="flex h-11 w-full items-center gap-2 rounded-lg px-3 hover:bg-white/10"
      >
        <Icon name="logout" size={18} />
        Sign out
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <header className="flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Logo to="/admin" light />
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          aria-label="Toggle admin menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'x' : 'menu'} />
        </Button>
      </header>
      {open && <div className="flex flex-col gap-4 bg-ink px-4 pb-4 lg:hidden">{nav}{footer}</div>}

      <aside className="hidden w-60 shrink-0 flex-col gap-6 bg-ink p-4 lg:flex">
        <Logo to="/admin" light />
        {nav}
        {footer}
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  )
}
