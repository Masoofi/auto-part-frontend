import type { ReactNode } from 'react'
import { formatMoney } from '@/lib/format'
import { Card } from '@/components/ui/Card'

interface OrderSummaryProps {
  title?: string
  lines: { label: string; value: string | number; muted?: boolean }[]
  total: string | number
  children?: ReactNode
}

/** Used by the cart, checkout and order detail so totals always look the same. */
export function OrderSummary({ title = 'Order summary', lines, total, children }: OrderSummaryProps) {
  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <dl className="mt-4 space-y-2 text-sm">
        {lines.map((l) => (
          <div key={l.label} className="flex justify-between">
            <dt className="text-slate-600">{l.label}</dt>
            <dd className={l.muted ? 'text-slate-600' : 'font-medium'}>{formatMoney(l.value)}</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-xl font-bold">{formatMoney(total)}</dd>
        </div>
      </dl>
      {children && <div className="mt-5 space-y-3">{children}</div>}
    </Card>
  )
}
