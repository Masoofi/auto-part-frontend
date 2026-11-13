import type { ReactNode } from 'react'
import { Button } from './Button'
import { Icon, type IconName } from './Icon'

export function EmptyState({
  icon = 'package',
  title,
  description,
  action,
}: {
  icon?: IconName
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon name={icon} size={28} />
      </span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-sm text-slate-600">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({
  message = 'Something went wrong while loading this.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <Icon name="alert" size={28} className="text-red-700" />
      <p className="text-red-900">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <Icon name="refresh" size={16} />
          Try again
        </Button>
      )}
    </div>
  )
}
