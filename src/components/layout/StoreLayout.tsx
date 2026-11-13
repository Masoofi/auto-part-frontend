import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useLogout } from '@/api/auth'
import { useCart } from '@/api/cart'
import { cn } from '@/lib/cn'
import { useAuth } from '@/store/auth'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Logo } from './Logo'

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-slate-100',
    isActive && 'text-brand-700',
  )

function HeaderSearch() {
  const navigate = useNavigate()
  const [text, setText] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = text.trim()
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 focus-within:border-brand-600 sm:max-w-md"
    >
      <Icon name="search" size={18} className="shrink-0 text-slate-500" />
      <input
        type="search"
        aria-label="Search parts"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search parts or brand"
        className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
      />
    </form>
  )
}

function CartLink() {
  const { data } = useCart()
  const count = data?.summary.totalQuantity ?? 0

  return (
    <Link
      to="/cart"
      aria-label={`Cart, ${count} items`}
      className="relative flex size-11 items-center justify-center rounded-lg hover:bg-slate-100"
    >
      <Icon name="cart" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  )
}

export function StoreLayout() {
  const user = useAuth((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = (
    <>
      <NavLink to="/products" className={navLink} onClick={() => setMenuOpen(false)}>
        Products
      </NavLink>
      {user && (
        <NavLink to="/orders" className={navLink} onClick={() => setMenuOpen(false)}>
          My orders
        </NavLink>
      )}
      {user?.role === 'ADMIN' && (
        <NavLink to="/admin" className={navLink} onClick={() => setMenuOpen(false)}>
          Admin
        </NavLink>
      )}
    </>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="ml-4 hidden items-center md:flex">
            {links}
          </nav>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
            <HeaderSearch />
            <CartLink />
            {user ? (
              <div className="hidden items-center gap-1 md:flex">
                <span className="px-2 text-sm text-slate-700">Hi, {user.firstName}</span>
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  aria-label="Sign out"
                >
                  <Icon name="logout" size={18} />
                </Button>
              </div>
            ) : (
              <ButtonLink to="/login" variant="dark" className="hidden md:inline-flex">
                Sign in
              </ButtonLink>
            )}
            <Button
              variant="ghost"
              className="md:hidden"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Icon name={menuOpen ? 'x' : 'menu'} />
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Mobile" className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden">
            {links}
            {user ? (
              <Button
                variant="secondary"
                onClick={() => {
                  logout()
                  setMenuOpen(false)
                  navigate('/')
                }}
              >
                Sign out ({user.firstName})
              </Button>
            ) : (
              <ButtonLink to="/login" variant="dark" onClick={() => setMenuOpen(false)}>
                Sign in
              </ButtonLink>
            )}
          </nav>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="bg-ink px-4 py-8 text-center text-sm text-slate-300">
        <div className="mb-3 flex justify-center">
          <Logo light />
        </div>
        Genuine parts, secure checkout.
      </footer>
    </div>
  )
}
