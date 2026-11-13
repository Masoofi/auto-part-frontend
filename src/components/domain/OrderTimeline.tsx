import { cn } from '@/lib/cn'
import { humanize } from '@/lib/format'
import type { OrderStatus } from '@/types'
import { Icon } from '@/components/ui/Icon'

const STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 font-medium text-red-900">
        <Icon name="x" size={18} />
        This order was cancelled.
      </p>
    )
  }

  const current = STEPS.indexOf(status)

  return (
    <ol className="grid grid-cols-5 gap-2" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i <= current
        return (
          <li key={step} className="flex flex-col items-center gap-2 text-center">
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-full text-sm font-semibold',
                done ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700',
              )}
              aria-current={i === current ? 'step' : undefined}
            >
              {done ? <Icon name="check" size={16} /> : i + 1}
            </span>
            <span className={cn('text-xs', done ? 'font-semibold text-ink' : 'text-slate-600')}>
              {humanize(step)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
