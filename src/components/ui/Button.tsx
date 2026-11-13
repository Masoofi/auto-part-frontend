import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { buttonClasses, type ButtonStyleProps } from './buttonStyles'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  loading?: boolean
}

export function Button({
  variant,
  size,
  fullWidth,
  loading,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...rest
}: LinkProps & ButtonStyleProps) {
  return <Link className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...rest} />
}
