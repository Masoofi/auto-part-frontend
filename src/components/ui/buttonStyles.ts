import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secondary:
    'border border-slate-300 bg-white text-ink hover:bg-slate-50 disabled:text-slate-400',
  dark: 'bg-ink text-white hover:bg-slate-800 disabled:bg-ink/50',
  ghost: 'text-ink hover:bg-slate-100 disabled:text-slate-400',
  danger: 'bg-red-700 text-white hover:bg-red-800 disabled:bg-red-700/50',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const buttonClasses = ({ variant = 'primary', size = 'md', fullWidth }: ButtonStyleProps) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
  )
