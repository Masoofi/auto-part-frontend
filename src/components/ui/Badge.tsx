import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

// Text/background pairs all meet 4.5:1; meaning is also carried by the label.
const tones: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-800',
  info: 'bg-blue-100 text-blue-900',
  success: 'bg-green-100 text-green-900',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-900',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
